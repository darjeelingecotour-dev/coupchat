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
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '15mb' }));

// -------------------------------------------------------------
// Real-Time Ephemeral Matchmaking & Group Lounges Engine
// -------------------------------------------------------------

interface UserSession {
  id: string;
  ws: WebSocket;
  myGender: 'male' | 'female' | 'nonbinary';
  seekingGender: 'female' | 'male' | 'anyone';
  topic: string;
  partnerId: string | null;
  joinedQueueAt: number | null;
  isSimulatedPartner?: boolean;
  currentGroupId: string | null;
  groupAlias: string | null;
  groupColor: string | null;
}

interface GroupMemberState {
  id: string;
  alias: string;
  color: string;
  isHost?: boolean;
  joinedAt: number;
}

interface GroupRoomState {
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

// Realistic base count of late-night participants
let baseOnlineSeed = 1420;

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

// Pre-seed curated public group lounges
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
  ];

  const memberPool = [
    { alias: 'Velvet Fox', color: '#f43f5e' },
    { alias: 'Neon Panther', color: '#6366f1' },
    { alias: 'Midnight Lynx', color: '#06b6d4' },
    { alias: 'Cosmic Soul', color: '#a855f7' },
    { alias: 'Obsidian Wolf', color: '#10b981' },
    { alias: 'Crimson Ghost', color: '#ec4899' },
    { alias: 'Electric Viper', color: '#f59e0b' },
  ];

  // Specific member count distribution to establish clear trending rooms
  const memberCounts = [18, 24, 14, 9, 21, 16, 12, 10];

  const starterSnippets = [
    { sender: 'Velvet Fox', color: '#f43f5e', text: 'Honestly, the hardest part of late nights is knowing I can’t text them... 🌙', time: '02:14 AM' },
    { sender: 'Neon Panther', color: '#6366f1', text: 'Someone give me a truth or dare that’s actually daring 😈', time: '02:18 AM' },
    { sender: 'Midnight Lynx', color: '#06b6d4', text: 'Dare accepted! Just dropped the proof with blur filter 🙈', time: '02:12 AM', mediaType: 'image' },
    { sender: 'Cosmic Soul', color: '#a855f7', text: 'Do you think we remember dreams, or do dreams remember us?', time: '02:08 AM' },
    { sender: 'Obsidian Wolf', color: '#10b981', text: 'Espresso martini in hand. Who else is awake in Europe right now? 🍸', time: '02:16 AM' },
    { sender: 'Electric Viper', color: '#f59e0b', text: 'Rule #1: What is whispered in here stays in RAM forever. ✨', time: '02:11 AM' },
    { sender: 'Crimson Ghost', color: '#ec4899', text: 'Never have I ever fallen for someone purely from late night chats...', time: '02:15 AM' },
    { sender: 'Shadow Orchid', color: '#a855f7', text: 'Listening to late night jazz rain while watching the skyline 🌧️🎶', time: '02:17 AM' },
  ];

  for (let rIdx = 0; rIdx < initialRooms.length; rIdx++) {
    const r = initialRooms[rIdx];
    const snippet = starterSnippets[rIdx % starterSnippets.length];
    const roomState: GroupRoomState = {
      ...r,
      members: new Map(),
      recentMessages: [
        {
          id: `seed_msg_1_${r.id}`,
          groupId: r.id,
          senderId: 'sys',
          senderAlias: 'Lounge Host',
          senderColor: '#ec4899',
          isMe: false,
          content: `Welcome to ${r.name}! Speak your mind freely. Everything shared here is 100% ephemeral and unlogged.`,
          timestamp: '11:45 PM',
          isSystem: true,
        },
        {
          id: `seed_msg_2_${r.id}`,
          groupId: r.id,
          senderId: `sim_m_0_${r.id}`,
          senderAlias: snippet.sender,
          senderColor: snippet.color,
          isMe: false,
          content: snippet.text,
          mediaType: snippet.mediaType || 'text',
          timestamp: snippet.time,
        },
      ],
    };

    const targetCount = memberCounts[rIdx] || 5;
    for (let i = 0; i < targetCount; i++) {
      const p = memberPool[i % memberPool.length];
      const fakeId = `sim_m_${i}_${r.id}`;
      roomState.members.set(fakeId, {
        id: fakeId,
        alias: i === 0 ? p.alias : `${p.alias} #${100 + i}`,
        color: p.color,
        isHost: i === 0,
        joinedAt: Date.now() - 1000 * 60 * (i * 4 + 2),
      });
    }

    groupRooms.set(r.id, roomState);
  }
}

seedInitialGroupRooms();

function broadcastOnlineCount() {
  const realCount = sessions.size;
  const simulatedActive =
    baseOnlineSeed + realCount * 12 + Math.floor(Math.sin(Date.now() / 60000) * 45);
  const payload = JSON.stringify({
    type: 'online_stats',
    onlineCount: Math.max(simulatedActive, realCount),
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
    // Find last user message or fallback to last message
    let lastMsg: any = null;
    for (let i = group.recentMessages.length - 1; i >= 0; i--) {
      if (!group.recentMessages[i].isSystem) {
        lastMsg = group.recentMessages[i];
        break;
      }
    }
    if (!lastMsg && group.recentMessages.length > 0) {
      lastMsg = group.recentMessages[group.recentMessages.length - 1];
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

    list.push({
      id: group.id,
      name: group.name,
      topic: group.topic,
      description: group.description,
      isPrivate: group.isPrivate,
      memberCount: group.members.size,
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
    group.members.delete(session.id);

    // Notify remaining group members
    const leaveMsg = {
      id: `sys_left_${generateRandomId()}`,
      groupId,
      senderId: 'sys',
      senderAlias: session.groupAlias || 'A stranger',
      senderColor: session.groupColor || '#ec4899',
      isMe: false,
      content: `${session.groupAlias || 'A stranger'} stepped out of the lounge.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSystem: true,
    };
    group.recentMessages.push(leaveMsg);
    if (group.recentMessages.length > 40) group.recentMessages.shift();

    broadcastToGroup(
      groupId,
      JSON.stringify({
        type: 'group_member_left',
        memberId: session.id,
        alias: session.groupAlias,
        message: leaveMsg,
        memberCount: group.members.size,
      })
    );

    // If custom empty group and creator left, dissolve after 10 mins or keep public rooms
    if (group.members.size === 0 && !group.id.startsWith('grp_')) {
      groupRooms.delete(groupId);
    }
  }

  session.currentGroupId = null;
  broadcastGroupList();
}

// Simulated solo testing responses for 1-on-1
const companionGreetings = [
  "Hey there... what keeps you up so late tonight? 🌙",
  "Couldn't sleep, had to find someone interesting. What's your vibe right now?",
  "Whispers in the dark are always the most honest. What's on your mind? 😈",
  "Hey! Honestly glad I skipped into your room. What are you doing in bed right now?",
  "Late nights are made for good conversation and bad habits. Which one do you bring?",
];

const companionReplies = [
  "Haha, I love that answer! You're definitely not boring.",
  "Tell me your biggest guilty pleasure when nobody is watching 👀",
  "I was actually just listening to music with the lights dimmed down.",
  "That sounds dangerously intriguing... care to elaborate? 😈",
  "If you could teleport anywhere right this second, where are we going?",
  "You have really good energy. Do you stay up late often?",
  "Send a teaser photo or GIF! Let's see what you're working with 😉",
  "That's such a mood. I swear 2 AM hits completely differently.",
];

function handleCompanionSimulation(user: UserSession) {
  const companionId = `comp_${generateRandomId()}`;
  const strangerNum = Math.floor(100 + Math.random() * 899);

  const idx = matchQueue.indexOf(user.id);
  if (idx !== -1) matchQueue.splice(idx, 1);

  user.partnerId = companionId;
  user.isSimulatedPartner = true;

  if (user.ws.readyState === WebSocket.OPEN) {
    user.ws.send(
      JSON.stringify({
        type: 'matched',
        strangerAlias: `Stranger #${strangerNum}`,
        partnerGender:
          user.seekingGender === 'female'
            ? 'female'
            : user.seekingGender === 'male'
            ? 'male'
            : 'nonbinary',
        topic: user.topic || 'Late-Night Whispers',
        isCompanion: true,
      })
    );

    setTimeout(() => {
      if (user.partnerId === companionId && user.ws.readyState === WebSocket.OPEN) {
        user.ws.send(JSON.stringify({ type: 'partner_typing', isTyping: true }));
        setTimeout(() => {
          if (user.partnerId === companionId && user.ws.readyState === WebSocket.OPEN) {
            user.ws.send(JSON.stringify({ type: 'partner_typing', isTyping: false }));
            const greeting = companionGreetings[Math.floor(Math.random() * companionGreetings.length)];
            user.ws.send(
              JSON.stringify({
                type: 'message',
                id: generateRandomId(),
                sender: 'stranger',
                content: greeting,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              })
            );
          }
        }, 1200);
      }
    }, 800);
  }
}

// WebSocket Server initialization on the same HTTP server
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  const sessionId = generateRandomId();
  const session: UserSession = {
    id: sessionId,
    ws,
    myGender: 'male',
    seekingGender: 'anyone',
    topic: 'late_night',
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
    })
  );

  broadcastOnlineCount();
  ws.send(
    JSON.stringify({
      type: 'groups_list',
      groups: getPublicGroupsList(),
    })
  );

  let queueTimer: NodeJS.Timeout | null = null;

  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data.toString());

      switch (msg.type) {
        // ----------------- 1-on-1 Matching -----------------
        case 'join_queue': {
          leaveCurrentGroup(session);
          dissolvePair(sessionId, true);
          session.myGender = msg.myGender || 'male';
          session.seekingGender = msg.seekingGender || 'anyone';
          session.topic = msg.topic || 'late_night';
          session.joinedQueueAt = Date.now();
          session.isSimulatedPartner = false;

          const matchedPeerId = findMatchFor(sessionId);
          if (matchedPeerId) {
            if (queueTimer) clearTimeout(queueTimer);
            pairUsers(sessionId, matchedPeerId);
          } else {
            if (!matchQueue.includes(sessionId)) {
              matchQueue.push(sessionId);
            }
            ws.send(JSON.stringify({ type: 'queue_status', status: 'searching' }));

            if (queueTimer) clearTimeout(queueTimer);
            queueTimer = setTimeout(() => {
              if (matchQueue.includes(sessionId) && !session.partnerId) {
                handleCompanionSimulation(session);
              }
            }, 4500);
          }
          break;
        }

        case 'cancel_queue': {
          if (queueTimer) clearTimeout(queueTimer);
          const qIdx = matchQueue.indexOf(sessionId);
          if (qIdx !== -1) matchQueue.splice(qIdx, 1);
          session.joinedQueueAt = null;
          ws.send(JSON.stringify({ type: 'queue_status', status: 'idle' }));
          break;
        }

        case 'next_stranger': {
          if (queueTimer) clearTimeout(queueTimer);
          dissolvePair(sessionId, true);
          session.joinedQueueAt = Date.now();
          session.isSimulatedPartner = false;
          const matchedPeerId = findMatchFor(sessionId);
          if (matchedPeerId) {
            pairUsers(sessionId, matchedPeerId);
          } else {
            if (!matchQueue.includes(sessionId)) {
              matchQueue.push(sessionId);
            }
            ws.send(JSON.stringify({ type: 'queue_status', status: 'searching' }));
            queueTimer = setTimeout(() => {
              if (matchQueue.includes(sessionId) && !session.partnerId) {
                handleCompanionSimulation(session);
              }
            }, 4000);
          }
          break;
        }

        case 'leave_chat': {
          if (queueTimer) clearTimeout(queueTimer);
          dissolvePair(sessionId, true);
          session.isSimulatedPartner = false;
          ws.send(JSON.stringify({ type: 'chat_terminated' }));
          break;
        }

        case 'send_message': {
          if (!session.partnerId) return;

          const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const messageId = generateRandomId();

          if (session.isSimulatedPartner) {
            ws.send(JSON.stringify({ type: 'message_ack', id: messageId }));

            setTimeout(() => {
              if (session.partnerId && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ type: 'partner_typing', isTyping: true }));
                setTimeout(() => {
                  if (session.partnerId && ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({ type: 'partner_typing', isTyping: false }));

                    let replyContent =
                      companionReplies[Math.floor(Math.random() * companionReplies.length)];
                    let mediaType = undefined;
                    let mediaUrl = undefined;
                    let sensitive = false;

                    if (msg.mediaType === 'image') {
                      replyContent = "Nice visual... here is mine, don't show anyone else 🙈";
                      mediaType = 'image';
                      mediaUrl =
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80';
                      sensitive = true;
                    }

                    ws.send(
                      JSON.stringify({
                        type: 'message',
                        id: generateRandomId(),
                        sender: 'stranger',
                        content: replyContent,
                        mediaType,
                        mediaUrl,
                        sensitive,
                        timestamp: new Date().toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        }),
                      })
                    );
                  }
                }, 1600);
              }
            }, 600);
            return;
          }

          const partner = sessions.get(session.partnerId);
          if (partner && partner.ws.readyState === WebSocket.OPEN) {
            partner.ws.send(
              JSON.stringify({
                type: 'message',
                id: messageId,
                sender: 'stranger',
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
          if (!session.isSimulatedPartner) {
            const partner = sessions.get(session.partnerId);
            if (partner && partner.ws.readyState === WebSocket.OPEN) {
              partner.ws.send(
                JSON.stringify({
                  type: 'partner_typing',
                  isTyping: !!msg.isTyping,
                })
              );
            }
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
          const topic = msg.topic || 'Late-Night Secrets';
          const description = msg.description?.trim() || 'A private ephemeral group lounge.';
          const isPrivate = !!msg.isPrivate;
          const passcode = msg.passcode?.trim() || undefined;

          if (msg.alias) session.groupAlias = msg.alias.trim();
          if (msg.color) session.groupColor = msg.color;

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
            isHost: true,
            joinedAt: Date.now(),
          });

          groupRooms.set(groupId, newGroup);
          session.currentGroupId = groupId;

          ws.send(
            JSON.stringify({
              type: 'group_joined',
              room: {
                id: newGroup.id,
                name: newGroup.name,
                topic: newGroup.topic,
                description: newGroup.description,
                isPrivate: newGroup.isPrivate,
                memberCount: newGroup.members.size,
                maxMembers: newGroup.maxMembers,
                tags: newGroup.tags,
                createdAt: newGroup.createdAt,
              },
              members: Array.from(newGroup.members.values()),
              messages: newGroup.recentMessages,
              myAlias: session.groupAlias,
              myColor: session.groupColor,
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

          if (group.members.size >= group.maxMembers) {
            ws.send(
              JSON.stringify({
                type: 'group_error',
                message: 'This lounge is at maximum capacity.',
              })
            );
            return;
          }

          if (msg.alias) session.groupAlias = msg.alias.trim();
          if (msg.color) session.groupColor = msg.color;

          const memberInfo: GroupMemberState = {
            id: session.id,
            alias: session.groupAlias || 'Stranger',
            color: session.groupColor || '#ec4899',
            isHost: group.createdBy === session.id,
            joinedAt: Date.now(),
          };

          group.members.set(session.id, memberInfo);
          session.currentGroupId = targetGroupId;

          const joinMsg = {
            id: `sys_join_${generateRandomId()}`,
            groupId: targetGroupId,
            senderId: 'sys',
            senderAlias: session.groupAlias || 'Stranger',
            senderColor: session.groupColor || '#ec4899',
            isMe: false,
            content: `${session.groupAlias} joined the lounge.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isSystem: true,
          };
          group.recentMessages.push(joinMsg);
          if (group.recentMessages.length > 40) group.recentMessages.shift();

          // Send confirmation to user
          ws.send(
            JSON.stringify({
              type: 'group_joined',
              room: {
                id: group.id,
                name: group.name,
                topic: group.topic,
                description: group.description,
                isPrivate: group.isPrivate,
                memberCount: group.members.size,
                maxMembers: group.maxMembers,
                tags: group.tags,
                createdAt: group.createdAt,
              },
              members: Array.from(group.members.values()),
              messages: group.recentMessages,
              myAlias: session.groupAlias,
              myColor: session.groupColor,
            })
          );

          // Broadcast to other members in the room
          broadcastToGroup(
            targetGroupId,
            JSON.stringify({
              type: 'group_member_joined',
              member: memberInfo,
              message: joinMsg,
              memberCount: group.members.size,
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
    if (queueTimer) clearTimeout(queueTimer);
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
      server: { middlewareMode: true },
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
