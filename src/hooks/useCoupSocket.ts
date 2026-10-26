import { useState, useEffect, useRef, useCallback } from 'react';
import {
  ChatMessage,
  Gender,
  SeekingGender,
  ChatTopic,
  MatchInfo,
  ViewState,
  GroupRoom,
  GroupMember,
  GroupMessage,
} from '../types';

export function useCoupSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [onlineCount, setOnlineCount] = useState(14820);
  const [viewState, setViewState] = useState<ViewState>('landing');
  
  // 1-on-1 state
  const [matchInfo, setMatchInfo] = useState<MatchInfo | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [strangerTyping, setStrangerTyping] = useState(false);
  const [partnerLeft, setPartnerLeft] = useState(false);

  // Group Lounges state
  const [groups, setGroups] = useState<GroupRoom[]>([]);
  const [activeGroup, setActiveGroup] = useState<GroupRoom | null>(null);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [groupMessages, setGroupMessages] = useState<GroupMessage[]>([]);
  const [groupTypingUser, setGroupTypingUser] = useState<string | null>(null);
  const [groupError, setGroupError] = useState<string | null>(null);
  const [myAlias, setMyAlias] = useState<string>('Velvet Stranger');
  const [myColor, setMyColor] = useState<string>('#ec4899');
  const [myAvatar, setMyAvatar] = useState<string>(
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80'
  );

  const socketRef = useRef<WebSocket | null>(null);
  const groupTypingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentPrefRef = useRef<{
    myGender: Gender;
    seekingGender: SeekingGender;
    topic: ChatTopic;
  }>({
    myGender: 'male',
    seekingGender: 'female',
    topic: 'late_night',
  });

  const connect = useCallback(() => {
    if (
      socketRef.current &&
      (socketRef.current.readyState === WebSocket.OPEN ||
        socketRef.current.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      setIsConnected(true);
      // Fetch public groups
      ws.send(JSON.stringify({ type: 'get_groups' }));
    };

    ws.onclose = () => {
      setIsConnected(false);
      setTimeout(() => {
        if (!socketRef.current || socketRef.current.readyState === WebSocket.CLOSED) {
          connect();
        }
      }, 2000);
    };

    ws.onerror = (err) => {
      console.warn('Coupchat WS error:', err);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case 'session_init':
            if (data.defaultAlias) setMyAlias(data.defaultAlias);
            if (data.defaultColor) setMyColor(data.defaultColor);
            if (data.defaultAvatar) setMyAvatar(data.defaultAvatar);
            break;

          case 'online_stats':
            setOnlineCount(data.onlineCount || 1);
            break;

          case 'queue_status':
            if (data.status === 'searching') {
              setViewState('matching');
            } else if (data.status === 'idle') {
              setViewState('landing');
            }
            break;

          // 1-on-1 events
          case 'matched':
            setMatchInfo({
              strangerAlias: data.strangerAlias || 'Stranger',
              partnerGender: data.partnerGender,
              partnerAvatarUrl: data.partnerAvatarUrl,
              partnerStatus: data.partnerStatus || 'online',
              topic: data.topic,
            });
            setMessages([
              {
                id: 'sys_' + Date.now(),
                sender: 'system',
                content: `You're connected with ${data.strangerAlias || 'a stranger'}. Say hi! Remember: chats disappear the moment either of you taps NEXT.`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
            ]);
            setPartnerLeft(false);
            setStrangerTyping(false);
            setViewState('chat');
            break;

          case 'partner_left':
            setPartnerLeft(true);
            setStrangerTyping(false);
            setMatchInfo((prev) => (prev ? { ...prev, partnerStatus: 'offline' } : null));
            setMessages((prev) => [
              ...prev,
              {
                id: 'sys_left_' + Date.now(),
                sender: 'system',
                content: data.reason || 'Stranger has disconnected or moved to the next chat.',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
            ]);
            break;

          case 'partner_typing':
            setStrangerTyping(!!data.isTyping);
            break;

          case 'message':
            setMessages((prev) => [
              ...prev,
              {
                id: data.id || 'msg_' + Date.now(),
                sender: 'stranger',
                content: data.content,
                mediaType: data.mediaType || 'text',
                mediaUrl: data.mediaUrl,
                caption: data.caption,
                sensitive: data.sensitive ?? (data.mediaType === 'image' || data.mediaType === 'video'),
                revealed: false,
                timestamp: data.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
            ]);
            break;

          case 'chat_terminated':
            setViewState('landing');
            setMessages([]);
            setMatchInfo(null);
            setPartnerLeft(false);
            break;

          // Group events
          case 'groups_list':
            if (data.groups) {
              setGroups(data.groups);
            }
            break;

          case 'group_joined':
            setActiveGroup(data.room);
            setGroupMembers(data.members || []);
            setGroupMessages(data.messages || []);
            if (data.myAlias) setMyAlias(data.myAlias);
            if (data.myColor) setMyColor(data.myColor);
            if (data.myAvatar) setMyAvatar(data.myAvatar);
            setGroupError(null);
            setViewState('group_chat');
            break;

          case 'group_member_joined':
            if (data.members) {
              setGroupMembers(data.members);
            } else if (data.member) {
              setGroupMembers((prev) => {
                const idx = prev.findIndex((m) => m.id === data.member.id);
                if (idx !== -1) {
                  const updated = [...prev];
                  updated[idx] = data.member;
                  return updated;
                }
                return [...prev, data.member];
              });
            }
            if (data.message) {
              setGroupMessages((prev) => [...prev, data.message]);
            }
            if (data.memberCount && activeGroup) {
              setActiveGroup((prev) => (prev ? { ...prev, memberCount: data.memberCount } : null));
            }
            break;

          case 'group_member_status':
            if (data.members) {
              setGroupMembers(data.members);
            } else if (data.memberId && data.status) {
              setGroupMembers((prev) =>
                prev.map((m) => (m.id === data.memberId ? { ...m, status: data.status } : m))
              );
            }
            if (data.message) {
              setGroupMessages((prev) => [...prev, data.message]);
            }
            if (data.memberCount !== undefined && activeGroup) {
              setActiveGroup((prev) => (prev ? { ...prev, memberCount: data.memberCount } : null));
            }
            break;

          case 'group_members_updated':
            if (data.members) {
              setGroupMembers(data.members);
            }
            break;

          case 'group_message':
            if (data.message) {
              setGroupMessages((prev) => [...prev, data.message]);
            }
            break;

          case 'group_member_typing':
            if (data.isTyping) {
              setGroupTypingUser(data.senderAlias || 'Someone');
              if (groupTypingTimerRef.current) clearTimeout(groupTypingTimerRef.current);
              groupTypingTimerRef.current = setTimeout(() => {
                setGroupTypingUser(null);
              }, 1800);
            } else {
              setGroupTypingUser(null);
            }
            break;

          case 'group_error':
            setGroupError(data.message || 'Group action failed.');
            break;

          case 'group_left':
            setActiveGroup(null);
            setGroupMembers([]);
            setGroupMessages([]);
            setGroupError(null);
            setViewState('groups');
            break;
        }
      } catch (err) {
        console.error('Failed to parse WS incoming message:', err);
      }
    };

    socketRef.current = ws;
  }, [activeGroup]);

  useEffect(() => {
    connect();

    const handleBeforeUnload = () => {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({ type: 'leave_chat' }));
        socketRef.current.send(JSON.stringify({ type: 'leave_group' }));
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [connect]);

  // 1-on-1 actions
  const joinQueue = useCallback(
    (myGender: Gender, seekingGender: SeekingGender, topic: ChatTopic) => {
      currentPrefRef.current = { myGender, seekingGender, topic };
      setViewState('matching');
      setPartnerLeft(false);
      setMessages([]);
      setMatchInfo(null);

      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(
          JSON.stringify({
            type: 'join_queue',
            myGender,
            seekingGender,
            topic,
            avatarUrl: myAvatar,
          })
        );
      } else {
        connect();
      }
    },
    [connect, myAvatar]
  );

  const cancelQueue = useCallback(() => {
    setViewState('landing');
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: 'cancel_queue' }));
    }
  }, []);

  const nextStranger = useCallback(() => {
    setViewState('matching');
    setPartnerLeft(false);
    setMessages([]);
    setStrangerTyping(false);
    setMatchInfo(null);

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: 'next_stranger' }));
    }
  }, []);

  const leaveChat = useCallback(() => {
    setViewState('landing');
    setMessages([]);
    setMatchInfo(null);
    setPartnerLeft(false);
    setStrangerTyping(false);

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: 'leave_chat' }));
    }
  }, []);

  const sendMessage = useCallback(
    (params: {
      content?: string;
      mediaType?: 'text' | 'image' | 'video' | 'gif';
      mediaUrl?: string;
      caption?: string;
      sensitive?: boolean;
    }) => {
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const localMsg: ChatMessage = {
        id: 'user_' + Date.now(),
        sender: 'user',
        content: params.content,
        mediaType: params.mediaType || 'text',
        mediaUrl: params.mediaUrl,
        caption: params.caption,
        sensitive: params.sensitive ?? false,
        revealed: true,
        timestamp: nowStr,
      };

      setMessages((prev) => [...prev, localMsg]);

      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(
          JSON.stringify({
            type: 'send_message',
            ...params,
          })
        );
      }
    },
    []
  );

  const sendTyping = useCallback((isTyping: boolean) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          type: 'typing',
          isTyping,
        })
      );
    }
  }, []);

  const toggleRevealMedia = useCallback((messageId: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, revealed: !msg.revealed } : msg
      )
    );
  }, []);

  // Profile actions
  const updateProfile = useCallback(
    (alias?: string, color?: string, avatarUrl?: string) => {
      if (alias) setMyAlias(alias);
      if (color) setMyColor(color);
      if (avatarUrl) setMyAvatar(avatarUrl);

      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(
          JSON.stringify({
            type: 'update_profile',
            alias: alias || myAlias,
            color: color || myColor,
            avatarUrl: avatarUrl || myAvatar,
          })
        );
      }
    },
    [myAlias, myColor, myAvatar]
  );

  // Group actions
  const fetchGroups = useCallback(() => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: 'get_groups' }));
    }
  }, []);

  const createGroup = useCallback(
    (options: {
      name: string;
      topic: string;
      description?: string;
      isPrivate?: boolean;
      passcode?: string;
      alias?: string;
      color?: string;
      avatarUrl?: string;
      tags?: string[];
    }) => {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(
          JSON.stringify({
            type: 'create_group',
            avatarUrl: options.avatarUrl || myAvatar,
            ...options,
          })
        );
      }
    },
    [myAvatar]
  );

  const joinGroup = useCallback(
    (groupId: string, options?: { passcode?: string; alias?: string; color?: string; avatarUrl?: string }) => {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(
          JSON.stringify({
            type: 'join_group',
            groupId,
            avatarUrl: options?.avatarUrl || myAvatar,
            ...options,
          })
        );
      }
    },
    [myAvatar]
  );

  const leaveGroup = useCallback(() => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: 'leave_group' }));
    }
    setActiveGroup(null);
    setGroupMembers([]);
    setGroupMessages([]);
    setViewState('groups');
  }, []);

  const sendGroupMessage = useCallback(
    (params: {
      content?: string;
      mediaType?: 'text' | 'image' | 'video' | 'gif';
      mediaUrl?: string;
      caption?: string;
      sensitive?: boolean;
    }) => {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(
          JSON.stringify({
            type: 'group_send_message',
            ...params,
          })
        );
      }
    },
    []
  );

  const sendGroupTyping = useCallback((isTyping: boolean) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          type: 'group_typing',
          isTyping,
        })
      );
    }
  }, []);

  const toggleRevealGroupMedia = useCallback((messageId: string) => {
    setGroupMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, revealed: !msg.revealed } : msg
      )
    );
  }, []);

  return {
    isConnected,
    onlineCount,
    viewState,
    setViewState,
    // 1-on-1
    matchInfo,
    messages,
    strangerTyping,
    partnerLeft,
    joinQueue,
    cancelQueue,
    nextStranger,
    leaveChat,
    sendMessage,
    sendTyping,
    toggleRevealMedia,
    currentPreferences: currentPrefRef.current,
    // Groups
    groups,
    activeGroup,
    groupMembers,
    groupMessages,
    groupTypingUser,
    groupError,
    setGroupError,
    myAlias,
    setMyAlias,
    myColor,
    setMyColor,
    myAvatar,
    setMyAvatar,
    updateProfile,
    fetchGroups,
    createGroup,
    joinGroup,
    leaveGroup,
    sendGroupMessage,
    sendGroupTyping,
    toggleRevealGroupMedia,
  };
}
