import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

function getAppPort(): number {
  const portArgIdx = process.argv.indexOf('--port');
  if (portArgIdx !== -1 && process.argv[portArgIdx + 1]) {
    return parseInt(process.argv[portArgIdx + 1], 10);
  }
  if (process.env.DEFAULT_APP_PORT) {
    return parseInt(process.env.DEFAULT_APP_PORT, 10);
  }
  // In AI Studio / Cloud Run, PORT=8080 is reserved for nginx reverse proxy.
  // The app dev server MUST bind to port 3000.
  if (process.env.PORT && process.env.PORT !== '8080') {
    return parseInt(process.env.PORT, 10);
  }
  return 3000;
}

const PORT = getAppPort();

server.on('error', (err: any) => {
  console.error('HTTP server error:', err);
});

app.use(express.json({ limit: '15mb' }));

// -------------------------------------------------------------
// Real-Time Ephemeral Matchmaking & Group Lounges Engine (100% Real Users, No Bots)
// -------------------------------------------------------------

export interface UserSession {
  id: string;
  ws: WebSocket;
  myGender: 'male' | 'female' | 'nonbinary';
  seekingGender: 'female' | 'male' | 'anyone';
  topic: string;
  avatarUrl: string;
  partnerId: string | null;
  joinedQueueAt: number | null;
  currentGroupId: string | null;
  groupAlias: string | null;
  groupColor: string | null;
}

export interface GroupMemberState {
  id: string;
  alias: string;
  color: string;
  avatarUrl: string;
  status: 'online' | 'offline';
  isHost?: boolean;
  joinedAt: number;
}

export interface GroupRoomState {
  id: string;
  name: string;
  topic: string;
  description: string;
  isPrivate: boolean;
  passcode?: string;
  createdBy: string;
  createdAt: number;
  maxMembers: number;
  tags: string[];
  members: Map<string, GroupMemberState>;
  recentMessages: any[];
}

// In-memory ephemeral state (Zero DB persistence)
const sessions = new Map<string, UserSession>();
const matchQueue: string[] = [];
const groupRooms = new Map<string, GroupRoomState>();

export const DEFAULT_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=160&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=160&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=160&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=160&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=160&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=160&auto=format&fit=crop&q=80',
];

const RANDOM_ALIASES = [
  'Velvet Panther',
  'Neon Phoenix',
  'Midnight Leopard',
  'Electric Viper',
  'Obsidian Wolf',
  'Crimson Fox',
  'Silver Raven',
  'Cosmic Lynx',
  'Shadow Orchid',
  'Aurora Mirage',
];

const RANDOM_COLORS = [
  '#f43f5e', // rose
  '#ec4899', // pink
  '#a855f7', // purple
  '#6366f1', // indigo
  '#06b6d4', // cyan
  '#10b981', // emerald
  '#f59e0b', // amber
];

function generateRandomId(): string {
  return Math.random().toString(36).substring(2, 10);
}

// Pre-seed curated public group lounges (Zero fake members - only real users)
function seedInitialGroupRooms() {
  const initialRooms: Array<Omit<GroupRoomState, 'members' | 'recentMessages'>> = [
    {
      id: 'grp_generalplaza',
      name: '🌆 Coupchat Night Plaza',
      topic: 'General',
      description: 'The central open lounge for everyone. Introduce yourself, drop a greeting, or join the buzz.',
      isPrivate: false,
      createdBy: 'system',
      createdAt: Date.now() - 1200000,
      maxMembers: 60,
      tags: ['General', 'Lobby', 'AllWelcome'],
    },
    {
      id: 'grp_midnight',
      name: '🌙 Midnight Confessions',
      topic: 'Late Night',
      description: 'Whisper your unfiltered, late-night thoughts and secrets under the cover of velvet darkness.',
      isPrivate: false,
      createdBy: 'system',
      createdAt: Date.now() - 3600000,
      maxMembers: 50,
      tags: ['LateNight', 'Secrets', 'Unfiltered'],
    },
    {
      id: 'grp_lofibpm',
      name: '🎶 Lo-Fi Beats & 3 AM Moods',
      topic: 'Chill',
      description: 'Dim the lights, put your headphones on, and share the tracks keeping you sane tonight.',
      isPrivate: false,
      createdBy: 'system',
      createdAt: Date.now() - 6000000,
      maxMembers: 50,
      tags: ['Chill', 'LoFi', 'Aesthetic'],
    },
    {
      id: 'grp_truthordare',
      name: '🎲 2 AM Truth or Dare',
      topic: 'Gaming',
      description: 'Spill the boldest truth or take the dare. The party wheel spins constantly.',
      isPrivate: false,
      createdBy: 'system',
      createdAt: Date.now() - 1800000,
      maxMembers: 35,
      tags: ['Gaming', 'Party', 'TruthOrDare'],
    },
    {
      id: 'grp_flirt',
      name: '💋 Flirt & Sparks Lounge',
      topic: 'Flirting & Sparks',
      description: 'Cheeky banter, bold chemistry, and high voltage sparks. Singles welcome.',
      isPrivate: false,
      createdBy: 'system',
      createdAt: Date.now() - 7200000,
      maxMembers: 50,
      tags: ['Flirting', 'Banter', 'Sparks'],
    },
    {
      id: 'grp_deeptalks',
      name: '🌌 Deep Talks & Stargazers',
      topic: 'Deep Talks',
      description: 'Cosmic musings, existential questions, and late-night philosophical bonding.',
      isPrivate: false,
      createdBy: 'system',
      createdAt: Date.now() - 5400000,
      maxMembers: 40,
      tags: ['Deep', 'Cosmic', 'Philosophy'],
    },
    {
      id: 'grp_gamerslate',
      name: '🎮 3 AM Squad & Gaming Co-Op',
      topic: 'Gaming',
      description: 'Find late-night teammates, talk multiplayer games, or chat while grinding ranks.',
      isPrivate: false,
      createdBy: 'system',
      createdAt: Date.now() - 2100000,
      maxMembers: 40,
      tags: ['Gaming', 'Multiplayer', 'Squad'],
    },
    {
      id: 'grp_velvetbar',
      name: '🍸 The Velvet Bar (Singles 18+)',
      topic: 'General',
      description: 'Pull up a stool, grab a cocktail, and vibe with open-minded night owls worldwide.',
      isPrivate: false,
      createdBy: 'system',
      createdAt: Date.now() - 900000,
      maxMembers: 60,
      tags: ['General', 'Bar', 'NightLife'],
    },
    {
      id: 'grp_neonbadhabits',
      name: '🔥 Neon Hearts & Bad Habits',
      topic: 'Late Night',
      description: 'Electric conversations, guilty pleasures, and after-hours temptations.',
      isPrivate: false,
      createdBy: 'system',
      createdAt: Date.now() - 2400000,
      maxMembers: 45,
      tags: ['LateNight', 'Electric', 'Pleasures'],
    },
    {
      id: 'grp_hindi_chat',
      name: '🇮🇳 Desi Hindi Chat & Gupshup',
      topic: 'Desi & Hindi',
      description: 'Connect with Indian strangers in Hindi or Hinglish. Late-night banter, Bollywood, and authentic conversations with zero signup.',
      isPrivate: false,
      createdBy: 'system',
      createdAt: Date.now() - 3200000,
      maxMembers: 60,
      tags: ['Hindi', 'Desi', 'India', 'SubiChat'],
    },
    {
      id: 'grp_punjabi_adda',
      name: '🪘 Punjabi Adda & Beats',
      topic: 'Desi & Hindi',
      description: 'Bhangra vibes, Punjab diyan gallan, desi jokes, and friendly stranger talks worldwide.',
      isPrivate: false,
      createdBy: 'system',
      createdAt: Date.now() - 4100000,
      maxMembers: 50,
      tags: ['Punjabi', 'Desi', 'Gupshup'],
    },
    {
      id: 'grp_south_lounge',
      name: '🌴 South Indian Lounge (Telugu, Tamil, Kannada)',
      topic: 'Desi & Hindi',
      description: 'Meet South Indian strangers for cinema talks, music, tech, and friendly casual chats.',
      isPrivate: false,
      createdBy: 'system',
      createdAt: Date.now() - 5000000,
      maxMembers: 50,
      tags: ['Telugu', 'Tamil', 'Kannada', 'SouthIndia'],
    },
    {
      id: 'grp_marathi_katta',
      name: '☕ Marathi Katta & Gappa',
      topic: 'Desi & Hindi',
      description: 'Marathi gappa-goshti, Mumbai & Pune night owls, and heartwarming friendly talks.',
      isPrivate: false,
      createdBy: 'system',
      createdAt: Date.now() - 2800000,
      maxMembers: 45,
      tags: ['Marathi', 'Katta', 'Desi'],
    },
    {
      id: 'grp_bangla_adda',
      name: '☕ Bangla Adda & Late Night Cha',
      topic: 'Desi & Hindi',
      description: 'Kolkata & Bengali adda. Intellectual musings, cinema, music, and soulful late-night talks.',
      isPrivate: false,
      createdBy: 'system',
      createdAt: Date.now() - 3600000,
      maxMembers: 45,
      tags: ['Bangla', 'Bengali', 'Adda'],
    },
    {
      id: 'grp_bhojpuri_dhamaal',
      name: '🎉 Bhojpuri Chat & Masti',
      topic: 'Desi & Hindi',
      description: 'Desi entertainment, high-energy banter, and fun stranger chats in Bhojpuri & Hindi.',
      isPrivate: false,
      createdBy: 'system',
      createdAt: Date.now() - 1900000,
      maxMembers: 45,
      tags: ['Bhojpuri', 'Desi', 'Masti'],
    },
  ];

  for (const r of initialRooms) {
    const roomState: GroupRoomState = {
      ...r,
      members: new Map(), // Real users only when they enter
      recentMessages: [
        {
          id: `welcome_${r.id}`,
          groupId: r.id,
          senderId: 'sys',
          senderAlias: 'Lounge Host',
          senderColor: '#ec4899',
          isMe: false,
          content: `Welcome to ${r.name}! 100% real anonymous humans only. Speak freely—no bot logs or records are ever kept.`,
          timestamp: 'Live',
          isSystem: true,
        },
      ],
    };
    groupRooms.set(r.id, roomState);
  }
}

seedInitialGroupRooms();

function broadcastOnlineCount() {
  const realCount = sessions.size;
  const payload = JSON.stringify({
    type: 'online_stats',
    onlineCount: realCount,
    realConnected: realCount,
  });

  for (const session of sessions.values()) {
    if (session.ws.readyState === WebSocket.OPEN) {
      session.ws.send(payload);
    }
  }
}

function getPublicGroupsList() {
  const list = [];
  for (const group of groupRooms.values()) {
    let lastMsg: any = null;
    for (let i = group.recentMessages.length - 1; i >= 0; i--) {
      lastMsg = group.recentMessages[i];
      break;
    }

    let lastMessageSnippet = undefined;
    if (lastMsg) {
      let contentPreview = lastMsg.content || '';
      if (lastMsg.mediaType === 'image') contentPreview = '📷 Sent a sensitive photo';
      else if (lastMsg.mediaType === 'video') contentPreview = '🎥 Sent a video clip';
      else if (lastMsg.mediaType === 'gif') contentPreview = '✨ Sent a GIF reaction';

      lastMessageSnippet = {
        content: contentPreview,
        senderAlias: lastMsg.senderAlias || 'Stranger',
        senderColor: lastMsg.senderColor || '#ec4899',
        timestamp: lastMsg.timestamp || 'Just now',
        mediaType: lastMsg.mediaType || 'text',
      };
    }

    const onlineMembersCount = Array.from(group.members.values()).filter(
      (m) => m.status === 'online'
    ).length;

    list.push({
      id: group.id,
      name: group.name,
      topic: group.topic,
      description: group.description,
      isPrivate: group.isPrivate,
      memberCount: onlineMembersCount,
      totalEnteredCount: group.members.size,
      maxMembers: group.maxMembers,
      tags: group.tags,
      createdAt: group.createdAt,
      lastMessageSnippet,
    });
  }
  return list;
}

function broadcastGroupList() {
  const payload = JSON.stringify({
    type: 'groups_list',
    groups: getPublicGroupsList(),
  });

  for (const session of sessions.values()) {
    if (session.ws.readyState === WebSocket.OPEN) {
      session.ws.send(payload);
    }
  }
}

function broadcastToGroup(groupId: string, payloadStr: string, excludeSessionId?: string) {
  const group = groupRooms.get(groupId);
  if (!group) return;

  for (const memberId of group.members.keys()) {
    if (excludeSessionId && memberId === excludeSessionId) continue;
    const memberSession = sessions.get(memberId);
    if (memberSession && memberSession.ws.readyState === WebSocket.OPEN) {
      memberSession.ws.send(payloadStr);
    }
  }
}

// 1-on-1 Matching Logic
function findMatchFor(sessionId: string): string | null {
  const user = sessions.get(sessionId);
  if (!user) return null;

  for (let i = 0; i < matchQueue.length; i++) {
    const candidateId = matchQueue[i];
    if (candidateId === sessionId) continue;

    const candidate = sessions.get(candidateId);
    if (!candidate || candidate.ws.readyState !== WebSocket.OPEN) {
      matchQueue.splice(i, 1);
      i--;
      continue;
    }

    const userLikesCandidate =
      user.seekingGender === 'anyone' || user.seekingGender === candidate.myGender;
    const candidateLikesUser =
      candidate.seekingGender === 'anyone' || candidate.seekingGender === user.myGender;

    if (userLikesCandidate && candidateLikesUser) {
      matchQueue.splice(i, 1);
      return candidateId;
    }
  }

  // Fallback: match after 4s
  const now = Date.now();
  if (user.joinedQueueAt && now - user.joinedQueueAt > 4000) {
    for (let i = 0; i < matchQueue.length; i++) {
      const candidateId = matchQueue[i];
      if (candidateId === sessionId) continue;
      const candidate = sessions.get(candidateId);
      if (candidate && candidate.ws.readyState === WebSocket.OPEN) {
        matchQueue.splice(i, 1);
        return candidateId;
      }
    }
  }

  return null;
}

function pairUsers(userAId: string, userBId: string) {
  const userA = sessions.get(userAId);
  const userB = sessions.get(userBId);
  if (!userA || !userB) return;

  const idxA = matchQueue.indexOf(userAId);
  if (idxA !== -1) matchQueue.splice(idxA, 1);
  const idxB = matchQueue.indexOf(userBId);
  if (idxB !== -1) matchQueue.splice(idxB, 1);

  userA.partnerId = userBId;
  userB.partnerId = userAId;
  userA.joinedQueueAt = null;
  userB.joinedQueueAt = null;

  const strangerNumA = Math.floor(100 + Math.random() * 899);
  const strangerNumB = Math.floor(100 + Math.random() * 899);

  if (userA.ws.readyState === WebSocket.OPEN) {
    userA.ws.send(
      JSON.stringify({
        type: 'matched',
        strangerAlias: `Stranger #${strangerNumB}`,
        partnerGender: userB.myGender,
        partnerAvatarUrl: userB.avatarUrl,
        partnerStatus: 'online',
        topic: userB.topic || 'Late-Night Vibes',
      })
    );
  }

  if (userB.ws.readyState === WebSocket.OPEN) {
    userB.ws.send(
      JSON.stringify({
        type: 'matched',
        strangerAlias: `Stranger #${strangerNumA}`,
        partnerGender: userA.myGender,
        partnerAvatarUrl: userA.avatarUrl,
        partnerStatus: 'online',
        topic: userA.topic || 'Late-Night Vibes',
      })
    );
  }
}

function dissolvePair(sessionId: string, notifyPartner = true) {
  const user = sessions.get(sessionId);
  if (!user) return;

  const partnerId = user.partnerId;
  user.partnerId = null;

  if (partnerId) {
    const partner = sessions.get(partnerId);
    if (partner) {
      partner.partnerId = null;
      if (notifyPartner && partner.ws.readyState === WebSocket.OPEN) {
        partner.ws.send(
          JSON.stringify({
            type: 'partner_left',
            reason: 'Stranger has disconnected or skipped to next.',
          })
        );
      }
    }
  }

  const qIdx = matchQueue.indexOf(sessionId);
  if (qIdx !== -1) matchQueue.splice(qIdx, 1);
}

function leaveCurrentGroup(session: UserSession) {
  if (!session.currentGroupId) return;

  const groupId = session.currentGroupId;
  const group = groupRooms.get(groupId);

  if (group) {
    const member = group.members.get(session.id);
    if (member) {
      member.status = 'offline';
    }

    // Notify remaining group members of status change to offline
    const leaveMsg = {
      id: `sys_left_${generateRandomId()}`,
      groupId,
      senderId: 'sys',
      senderAlias: session.groupAlias || 'A stranger',
      senderColor: session.groupColor || '#ec4899',
      senderAvatarUrl: session.avatarUrl,
      isMe: false,
      content: `${session.groupAlias || 'A stranger'} went offline.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSystem: true,
    };
    group.recentMessages.push(leaveMsg);
    if (group.recentMessages.length > 50) group.recentMessages.shift();

    const allEnteredMembers = Array.from(group.members.values());
    const onlineCount = allEnteredMembers.filter((m) => m.status === 'online').length;

    broadcastToGroup(
      groupId,
      JSON.stringify({
        type: 'group_member_status',
        memberId: session.id,
        status: 'offline',
        alias: session.groupAlias,
        members: allEnteredMembers,
        message: leaveMsg,
        memberCount: onlineCount,
      })
    );
  }

  session.currentGroupId = null;
  broadcastGroupList();
}

// WebSocket Server initialization on the same HTTP server
const wss = new WebSocketServer({ server });

wss.on('error', (err) => {
  console.error('WebSocketServer error:', err);
});

wss.on('connection', (ws) => {
  const sessionId = generateRandomId();
  const randomAvatar = DEFAULT_AVATARS[Math.floor(Math.random() * DEFAULT_AVATARS.length)];
  const session: UserSession = {
    id: sessionId,
    ws,
    myGender: 'male',
    seekingGender: 'anyone',
    topic: 'late_night',
    avatarUrl: randomAvatar,
    partnerId: null,
    joinedQueueAt: null,
    currentGroupId: null,
    groupAlias: RANDOM_ALIASES[Math.floor(Math.random() * RANDOM_ALIASES.length)],
    groupColor: RANDOM_COLORS[Math.floor(Math.random() * RANDOM_COLORS.length)],
  };
  sessions.set(sessionId, session);

  ws.send(
    JSON.stringify({
      type: 'session_init',
      sessionId,
      defaultAlias: session.groupAlias,
      defaultColor: session.groupColor,
      defaultAvatar: session.avatarUrl,
    })
  );

  broadcastOnlineCount();
  ws.send(
    JSON.stringify({
      type: 'groups_list',
      groups: getPublicGroupsList(),
    })
  );

  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data.toString());

      switch (msg.type) {
        // Profile & Avatar update
        case 'update_profile': {
          if (msg.alias) session.groupAlias = msg.alias.trim();
          if (msg.color) session.groupColor = msg.color;
          if (msg.avatarUrl) session.avatarUrl = msg.avatarUrl;

          if (session.currentGroupId) {
            const group = groupRooms.get(session.currentGroupId);
            if (group && group.members.has(session.id)) {
              const m = group.members.get(session.id)!;
              m.alias = session.groupAlias || m.alias;
              m.color = session.groupColor || m.color;
              m.avatarUrl = session.avatarUrl || m.avatarUrl;

              broadcastToGroup(
                session.currentGroupId,
                JSON.stringify({
                  type: 'group_members_updated',
                  members: Array.from(group.members.values()),
                })
              );
            }
          }
          break;
        }

        // ----------------- 1-on-1 Matching (100% Real Users, Zero Bots) -----------------
        case 'join_queue': {
          leaveCurrentGroup(session);
          dissolvePair(sessionId, true);
          session.myGender = msg.myGender || 'male';
          session.seekingGender = msg.seekingGender || 'anyone';
          session.topic = msg.topic || 'late_night';
          if (msg.avatarUrl) session.avatarUrl = msg.avatarUrl;
          session.joinedQueueAt = Date.now();

          const matchedPeerId = findMatchFor(sessionId);
          if (matchedPeerId) {
            pairUsers(sessionId, matchedPeerId);
          } else {
            if (!matchQueue.includes(sessionId)) {
              matchQueue.push(sessionId);
            }
            ws.send(JSON.stringify({ type: 'queue_status', status: 'searching' }));
          }
          break;
        }

        case 'cancel_queue': {
          const qIdx = matchQueue.indexOf(sessionId);
          if (qIdx !== -1) matchQueue.splice(qIdx, 1);
          session.joinedQueueAt = null;
          ws.send(JSON.stringify({ type: 'queue_status', status: 'idle' }));
          break;
        }

        case 'next_stranger': {
          dissolvePair(sessionId, true);
          session.joinedQueueAt = Date.now();
          const matchedPeerId = findMatchFor(sessionId);
          if (matchedPeerId) {
            pairUsers(sessionId, matchedPeerId);
          } else {
            if (!matchQueue.includes(sessionId)) {
              matchQueue.push(sessionId);
            }
            ws.send(JSON.stringify({ type: 'queue_status', status: 'searching' }));
          }
          break;
        }

        case 'leave_chat': {
          dissolvePair(sessionId, true);
          ws.send(JSON.stringify({ type: 'chat_terminated' }));
          break;
        }

        case 'send_message': {
          if (!session.partnerId) return;

          const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const messageId = generateRandomId();

          const partner = sessions.get(session.partnerId);
          if (partner && partner.ws.readyState === WebSocket.OPEN) {
            partner.ws.send(
              JSON.stringify({
                type: 'message',
                id: messageId,
                sender: 'stranger',
                senderAvatarUrl: session.avatarUrl,
                content: msg.content,
                mediaType: msg.mediaType || 'text',
                mediaUrl: msg.mediaUrl,
                caption: msg.caption,
                sensitive: msg.sensitive ?? true,
                timestamp,
              })
            );
          }
          break;
        }

        case 'typing': {
          if (!session.partnerId) return;
          const partner = sessions.get(session.partnerId);
          if (partner && partner.ws.readyState === WebSocket.OPEN) {
            partner.ws.send(
              JSON.stringify({
                type: 'partner_typing',
                isTyping: !!msg.isTyping,
              })
            );
          }
          break;
        }

        // ----------------- Group Lounges -----------------
        case 'get_groups': {
          ws.send(
            JSON.stringify({
              type: 'groups_list',
              groups: getPublicGroupsList(),
            })
          );
          break;
        }

        case 'create_group': {
          leaveCurrentGroup(session);
          dissolvePair(sessionId, false);

          const groupId = 'room_' + generateRandomId();
          const groupName = msg.name?.trim() || 'Late-Night Anonymous Lounge';
          const topic = msg.topic || 'Late Night';
          const description = msg.description?.trim() || 'A private ephemeral group lounge.';
          const isPrivate = !!msg.isPrivate;
          const passcode = msg.passcode?.trim() || undefined;

          if (msg.alias) session.groupAlias = msg.alias.trim();
          if (msg.color) session.groupColor = msg.color;
          if (msg.avatarUrl) session.avatarUrl = msg.avatarUrl;

          const newGroup: GroupRoomState = {
            id: groupId,
            name: groupName,
            topic,
            description,
            isPrivate,
            passcode,
            createdBy: session.id,
            createdAt: Date.now(),
            maxMembers: msg.maxMembers || 50,
            tags: msg.tags || ['Ephemeral', topic],
            members: new Map(),
            recentMessages: [
              {
                id: `sys_${generateRandomId()}`,
                groupId,
                senderId: 'sys',
                senderAlias: 'Lounge Host',
                senderColor: '#ec4899',
                isMe: false,
                content: `✨ ${session.groupAlias} founded this lounge! Everyone can chat anonymously. Zero logs kept.`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isSystem: true,
              },
            ],
          };

          newGroup.members.set(session.id, {
            id: session.id,
            alias: session.groupAlias || 'Room Founder',
            color: session.groupColor || '#ec4899',
            avatarUrl: session.avatarUrl,
            status: 'online',
            isHost: true,
            joinedAt: Date.now(),
          });

          groupRooms.set(groupId, newGroup);
          session.currentGroupId = groupId;

          const allNewMembers = Array.from(newGroup.members.values());

          ws.send(
            JSON.stringify({
              type: 'group_joined',
              room: {
                id: newGroup.id,
                name: newGroup.name,
                topic: newGroup.topic,
                description: newGroup.description,
                isPrivate: newGroup.isPrivate,
                memberCount: 1,
                totalEnteredCount: 1,
                maxMembers: newGroup.maxMembers,
                tags: newGroup.tags,
                createdAt: newGroup.createdAt,
              },
              members: allNewMembers,
              messages: newGroup.recentMessages,
              myAlias: session.groupAlias,
              myColor: session.groupColor,
              myAvatar: session.avatarUrl,
            })
          );

          broadcastGroupList();
          break;
        }

        case 'join_group': {
          leaveCurrentGroup(session);
          dissolvePair(sessionId, false);

          const targetGroupId = msg.groupId;
          const group = groupRooms.get(targetGroupId);

          if (!group) {
            ws.send(
              JSON.stringify({
                type: 'group_error',
                message: 'This group lounge does not exist or has expired.',
              })
            );
            return;
          }

          if (group.isPrivate && group.passcode && group.passcode !== msg.passcode) {
            ws.send(
              JSON.stringify({
                type: 'group_error',
                message: 'Incorrect lounge passcode. Access denied.',
              })
            );
            return;
          }

          if (msg.alias) session.groupAlias = msg.alias.trim();
          if (msg.color) session.groupColor = msg.color;
          if (msg.avatarUrl) session.avatarUrl = msg.avatarUrl;

          const existing = group.members.get(session.id);
          const memberInfo: GroupMemberState = {
            id: session.id,
            alias: session.groupAlias || (existing ? existing.alias : 'Stranger'),
            color: session.groupColor || (existing ? existing.color : '#ec4899'),
            avatarUrl: session.avatarUrl || (existing ? existing.avatarUrl : DEFAULT_AVATARS[0]),
            status: 'online',
            isHost: group.createdBy === session.id,
            joinedAt: existing ? existing.joinedAt : Date.now(),
          };

          group.members.set(session.id, memberInfo);
          session.currentGroupId = targetGroupId;

          const joinMsg = {
            id: `sys_join_${generateRandomId()}`,
            groupId: targetGroupId,
            senderId: 'sys',
            senderAlias: session.groupAlias || 'Stranger',
            senderColor: session.groupColor || '#ec4899',
            senderAvatarUrl: session.avatarUrl,
            isMe: false,
            content: `${session.groupAlias} entered the lounge.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isSystem: true,
          };
          group.recentMessages.push(joinMsg);
          if (group.recentMessages.length > 50) group.recentMessages.shift();

          const allMembers = Array.from(group.members.values());
          const onlineCount = allMembers.filter((m) => m.status === 'online').length;

          // Send confirmation to user with full entered users roster
          ws.send(
            JSON.stringify({
              type: 'group_joined',
              room: {
                id: group.id,
                name: group.name,
                topic: group.topic,
                description: group.description,
                isPrivate: group.isPrivate,
                memberCount: onlineCount,
                totalEnteredCount: allMembers.length,
                maxMembers: group.maxMembers,
                tags: group.tags,
                createdAt: group.createdAt,
              },
              members: allMembers,
              messages: group.recentMessages,
              myAlias: session.groupAlias,
              myColor: session.groupColor,
              myAvatar: session.avatarUrl,
            })
          );

          // Broadcast to other members in the room with updated members list
          broadcastToGroup(
            targetGroupId,
            JSON.stringify({
              type: 'group_member_joined',
              member: memberInfo,
              members: allMembers,
              message: joinMsg,
              memberCount: onlineCount,
            }),
            session.id
          );

          broadcastGroupList();
          break;
        }

        case 'leave_group': {
          leaveCurrentGroup(session);
          ws.send(JSON.stringify({ type: 'group_left' }));
          break;
        }

        case 'group_send_message': {
          if (!session.currentGroupId) return;
          const group = groupRooms.get(session.currentGroupId);
          if (!group) return;

          const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const newMsg = {
            id: `gmsg_${generateRandomId()}`,
            groupId: group.id,
            senderId: session.id,
            senderAlias: session.groupAlias || 'Stranger',
            senderColor: session.groupColor || '#ec4899',
            senderAvatarUrl: session.avatarUrl,
            isMe: false,
            content: msg.content,
            mediaType: msg.mediaType || 'text',
            mediaUrl: msg.mediaUrl,
            caption: msg.caption,
            sensitive: msg.sensitive ?? (msg.mediaType === 'image' || msg.mediaType === 'video'),
            timestamp,
          };

          group.recentMessages.push(newMsg);
          if (group.recentMessages.length > 50) group.recentMessages.shift();

          // Broadcast to all members including sender (sender marks as isMe)
          for (const memberId of group.members.keys()) {
            const memberSession = sessions.get(memberId);
            if (memberSession && memberSession.ws.readyState === WebSocket.OPEN) {
              memberSession.ws.send(
                JSON.stringify({
                  type: 'group_message',
                  message: {
                    ...newMsg,
                    isMe: memberId === session.id,
                    revealed: memberId === session.id, // User's own media starts revealed
                  },
                })
              );
            }
          }
          broadcastGroupList();
          break;
        }

        case 'group_typing': {
          if (!session.currentGroupId) return;
          broadcastToGroup(
            session.currentGroupId,
            JSON.stringify({
              type: 'group_member_typing',
              senderId: session.id,
              senderAlias: session.groupAlias,
              isTyping: !!msg.isTyping,
            }),
            session.id
          );
          break;
        }
      }
    } catch (err) {
      console.error('Error handling WS message:', err);
    }
  });

  ws.on('close', () => {
    dissolvePair(sessionId, true);
    leaveCurrentGroup(session);
    sessions.delete(sessionId);
    broadcastOnlineCount();
  });
});

setInterval(() => {
  broadcastOnlineCount();
}, 20000);

// API Endpoints
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    brand: 'Coupchat',
    ephemeral: true,
    active1on1Rooms: Math.floor(sessions.size / 2),
    activeGroups: groupRooms.size,
  });
});

app.get('/api/groups', (_req, res) => {
  res.json({ groups: getPublicGroupsList() });
});

app.get('/api/gifs', (req, res) => {
  const query = (req.query.q as string)?.toLowerCase() || 'flirt';
  const gifDatabase = [
    { id: '1', title: 'Wink & Smile', url: 'https://media.giphy.com/media/OpfkuToK5FTYQ/giphy.gif', category: 'flirt' },
    { id: '2', title: 'Late Night Dance', url: 'https://media.giphy.com/media/blSTtZehjAZ8I/giphy.gif', category: 'party' },
    { id: '3', title: 'Heart Eyes Blush', url: 'https://media.giphy.com/media/26BRv0ThflsDTjDUs/giphy.gif', category: 'flirt' },
    { id: '4', title: 'Mind Blown', url: 'https://media.giphy.com/media/xT0xeJpnrWC4XWblEk/giphy.gif', category: 'funny' },
    { id: '5', title: 'Popcorn Chill', url: 'https://media.giphy.com/media/gl0mkIZOW6Nwc/giphy.gif', category: 'chill' },
    { id: '6', title: 'Cheeky Smirk', url: 'https://media.giphy.com/media/l4pTfx2qLszoacZRS/giphy.gif', category: 'flirt' },
    { id: '7', title: 'Cheers Toast', url: 'https://media.giphy.com/media/GCLlQnV7dXZ2E/giphy.gif', category: 'party' },
    { id: '8', title: 'Shy Wave Hello', url: 'https://media.giphy.com/media/ASd0Ukj0BC5roG5Lmp/giphy.gif', category: 'greetings' },
    { id: '9', title: 'Laughing Out Loud', url: 'https://media.giphy.com/media/3oEjHAUOqG3lSS0f1C/giphy.gif', category: 'funny' },
    { id: '10', title: 'Sending Kisses', url: 'https://media.giphy.com/media/26ufcYAkp8e66vanu/giphy.gif', category: 'flirt' },
    { id: '11', title: 'Excited Bounce', url: 'https://media.giphy.com/media/artj92V8o75VPL7AeQ/giphy.gif', category: 'party' },
    { id: '12', title: 'Listening Closely', url: 'https://media.giphy.com/media/3oKIPbNb1vWd0btuIE/giphy.gif', category: 'chill' },
  ];

  const filtered = gifDatabase.filter(
    (g) => g.category.includes(query) || g.title.toLowerCase().includes(query) || query === 'all'
  );

  res.json({
    gifs: filtered.length > 0 ? filtered : gifDatabase.slice(0, 6),
  });
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`⚡ Coupchat Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
