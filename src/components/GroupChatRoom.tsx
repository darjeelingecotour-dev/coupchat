import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Users,
  Send,
  Image as ImageIcon,
  Smile,
  Eye,
  EyeOff,
  Flame,
  ArrowLeft,
  Share2,
  Lock,
  Play,
  Sparkles,
  Check,
  X,
  Camera,
  Circle,
} from 'lucide-react';
import { GroupRoom, GroupMember, GroupMessage } from '../types';
import { GifPicker } from './GifPicker';
import { MediaModal } from './MediaModal';
import { AvatarPickerModal } from './AvatarPickerModal';

interface GroupChatRoomProps {
  group: GroupRoom;
  members: GroupMember[];
  messages: GroupMessage[];
  typingUser: string | null;
  onSendMessage: (payload: {
    content?: string;
    mediaType?: 'text' | 'image' | 'video' | 'gif';
    mediaUrl?: string;
    caption?: string;
    sensitive?: boolean;
  }) => void;
  onSendTyping: (isTyping: boolean) => void;
  onLeaveGroup: () => void;
  onToggleRevealMedia: (messageId: string) => void;
  myAlias: string;
  myColor: string;
  myAvatar: string;
  onUpdateAvatar: (avatarUrl: string) => void;
}

const GROUP_ICEBREAKERS = [
  '🎲 Truth or Dare for the room?',
  '🍷 What is everyone up to tonight?',
  '🌙 What is one secret you would never tell anyone in real life?',
  '📍 What city/timezone is everyone in right now?',
  '🎶 Drop the song you are currently looping',
];

export const GroupChatRoom: React.FC<GroupChatRoomProps> = ({
  group,
  members,
  messages,
  typingUser,
  onSendMessage,
  onSendTyping,
  onLeaveGroup,
  onToggleRevealMedia,
  myAlias,
  myColor,
  myAvatar,
  onUpdateAvatar,
}) => {
  const [inputText, setInputText] = useState('');
  const [isGifPickerOpen, setIsGifPickerOpen] = useState(false);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [isMembersDrawerOpen, setIsMembersDrawerOpen] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const onlineMembersCount = useMemo(() => {
    return members.filter((m) => m.status === 'online').length;
  }, [members]);

  const offlineMembersCount = useMemo(() => {
    return members.filter((m) => m.status === 'offline').length;
  }, [members]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUser]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    onSendTyping(true);

    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      onSendTyping(false);
    }, 1200);
  };

  const handleSend = () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;

    onSendMessage({
      content: trimmed,
      mediaType: 'text',
    });

    setInputText('');
    onSendTyping(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopyInvite = () => {
    const textToCopy = `Join my anonymous lounge "${group.name}" on Coupchat! Room Code: ${group.id}`;
    navigator.clipboard?.writeText(textToCopy);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-64px)] max-h-[calc(100vh-64px)] bg-[#07030e] text-slate-100 overflow-hidden relative">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-violet-600/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-pink-600/10 rounded-full blur-[130px] pointer-events-none" />

      {/* Group Header Bar */}
      <div className="px-3 sm:px-5 py-3 border-b border-white/10 bg-[#0d071b]/95 backdrop-blur-xl flex items-center justify-between gap-2 z-30 shrink-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onLeaveGroup}
            className="p-1.5 rounded-xl bg-white/[0.04] hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Leave Lounge"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs sm:text-sm font-extrabold text-white truncate max-w-[140px] sm:max-w-xs">
                {group.name}
              </h2>
              {group.isPrivate && (
                <Lock className="w-3 h-3 text-amber-400 shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-2 text-[10px] text-slate-400">
              <span className="text-pink-400 font-semibold">{group.topic}</span>
              <span aria-hidden="true">·</span>
              <button
                onClick={() => setIsMembersDrawerOpen(true)}
                className="hover:text-white underline cursor-pointer"
              >
                {members.length} night owls in room
              </button>
            </div>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2">
          {/* Quick Profile Pic Button */}
          <button
            onClick={() => setIsAvatarModalOpen(true)}
            className="flex items-center gap-1.5 p-1 sm:px-2.5 sm:py-1 rounded-xl bg-white/[0.04] hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 transition-all cursor-pointer"
            title="Change your profile picture"
          >
            <img
              src={myAvatar}
              alt="My Avatar"
              className="w-5 h-5 rounded-full object-cover ring-1 ring-pink-500"
            />
            <span className="hidden sm:inline text-[11px]">My Pic</span>
          </button>

          {/* Entered Users Panel Toggle */}
          <button
            onClick={() => setIsMembersDrawerOpen(!isMembersDrawerOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-pink-600/15 hover:bg-pink-600/25 border border-pink-500/30 text-xs font-semibold text-pink-300 transition-all cursor-pointer"
            title="Open Entered Users Panel"
          >
            <Users className="w-3.5 h-3.5 text-pink-400" />
            <span className="hidden sm:inline font-bold">Entered Users</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-pink-500/20 text-white font-mono">
              {members.length}
            </span>
            <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold bg-emerald-500/15 px-1.5 py-0.2 rounded-md">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {onlineMembersCount}
            </span>
          </button>

          <button
            onClick={handleCopyInvite}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 transition-all cursor-pointer"
            title="Copy room invite link/code"
          >
            {copiedCode ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Invite</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Real Humans Notice Pill */}
      <div className="px-4 py-1.5 bg-violet-950/30 border-b border-violet-500/10 text-[11px] text-violet-300/80 flex items-center justify-between px-4 sm:px-6 shrink-0">
        <div className="flex items-center gap-1.5">
          <Flame className="w-3 h-3 text-pink-400 shrink-0" />
          <span>100% Real Users • Zero Bots • Anonymous Ephemeral Lounge</span>
        </div>
        <button
          onClick={() => setIsMembersDrawerOpen(true)}
          className="text-pink-300 hover:text-white underline cursor-pointer text-[10px] font-semibold"
        >
          View Entered Users ({onlineMembersCount} Online, {offlineMembersCount} Offline)
        </button>
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((msg) => {
          if (msg.isSystem) {
            return (
              <div key={msg.id} className="flex justify-center my-2">
                <div className="text-center text-[11px] text-slate-400 bg-white/[0.03] border border-white/5 rounded-xl px-4 py-1.5 max-w-md">
                  {msg.content}
                </div>
              </div>
            );
          }

          const isMe = msg.isMe;

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group`}
            >
              {/* Sender Name tag if not me */}
              {!isMe && (
                <div className="flex items-center gap-1.5 mb-1 px-1">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: msg.senderColor || '#ec4899' }}
                  />
                  <span
                    className="text-xs font-bold"
                    style={{ color: msg.senderColor || '#f43f5e' }}
                  >
                    {msg.senderAlias}
                  </span>
                </div>
              )}

              {/* Text Message Bubble */}
              {msg.content && msg.mediaType === 'text' && (
                <div
                  className={`max-w-[85%] sm:max-w-[70%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed transition-all ${
                    isMe
                      ? 'bg-gradient-to-r from-pink-600 via-rose-500 to-pink-500 text-white rounded-br-none shadow-[0_4px_20px_rgba(255,42,133,0.35)]'
                      : 'bg-[#180e2b] border border-violet-500/25 text-slate-100 rounded-bl-none shadow-[0_4px_20px_rgba(139,92,246,0.15)]'
                  }`}
                >
                  <p className="break-words select-text">{msg.content}</p>
                </div>
              )}

              {/* GIF Reaction */}
              {msg.mediaType === 'gif' && msg.mediaUrl && (
                <div
                  className={`max-w-[260px] rounded-2xl overflow-hidden border ${
                    isMe ? 'border-pink-500/40' : 'border-violet-500/30'
                  } bg-black/40 shadow-lg`}
                >
                  <img
                    src={msg.mediaUrl}
                    alt="GIF Reaction"
                    className="w-full h-auto max-h-56 object-cover"
                  />
                  {msg.caption && (
                    <div className="p-2 text-[11px] text-slate-300 bg-[#0e071c]/90">
                      {msg.caption}
                    </div>
                  )}
                </div>
              )}

              {/* Image Media with Tap-To-Reveal */}
              {msg.mediaType === 'image' && msg.mediaUrl && (
                <div
                  className={`relative rounded-2xl overflow-hidden border max-w-[260px] sm:max-w-[300px] shadow-xl group ${
                    isMe ? 'border-pink-500/40' : 'border-violet-500/35'
                  }`}
                >
                  <img
                    src={msg.mediaUrl}
                    alt="Media preview"
                    className={`w-full max-h-64 object-cover transition-all duration-300 ${
                      msg.sensitive && !msg.revealed
                        ? 'blur-2xl scale-110 brightness-75'
                        : 'blur-0 scale-100'
                    }`}
                  />

                  {msg.sensitive && !msg.revealed && (
                    <button
                      onClick={() => onToggleRevealMedia(msg.id)}
                      className="absolute inset-0 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center gap-2 p-4 text-center cursor-pointer hover:bg-black/50 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center animate-pulse">
                        <Eye className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold text-white tracking-wide">
                        Sensitive Media
                      </span>
                      <span className="text-[10px] text-pink-300">Tap to reveal</span>
                    </button>
                  )}

                  {msg.sensitive && msg.revealed && (
                    <button
                      onClick={() => onToggleRevealMedia(msg.id)}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-slate-300 hover:text-white hover:bg-black transition-colors"
                      title="Hide / Re-blur image"
                    >
                      <EyeOff className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {msg.caption && (
                    <div className="p-2.5 text-xs text-white bg-[#0e071c]/95 border-t border-white/5">
                      {msg.caption}
                    </div>
                  )}
                </div>
              )}

              {/* Video Media with Tap-To-Reveal */}
              {msg.mediaType === 'video' && msg.mediaUrl && (
                <div
                  className={`relative rounded-2xl overflow-hidden border max-w-[280px] shadow-xl ${
                    isMe ? 'border-pink-500/40' : 'border-violet-500/35'
                  }`}
                >
                  {msg.sensitive && !msg.revealed ? (
                    <div className="w-full h-52 bg-slate-900 flex flex-col items-center justify-center p-4 text-center">
                      <div className="w-10 h-10 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center mb-2 animate-pulse">
                        <Play className="w-5 h-5 fill-current" />
                      </div>
                      <p className="text-xs font-bold text-white">Sensitive Video Clip</p>
                      <button
                        onClick={() => onToggleRevealMedia(msg.id)}
                        className="mt-2 px-3 py-1 bg-pink-600 text-white rounded-lg text-[11px] font-semibold cursor-pointer"
                      >
                        Tap to Play
                      </button>
                    </div>
                  ) : (
                    <div>
                      <video
                        src={msg.mediaUrl}
                        controls
                        autoPlay
                        className="w-full max-h-60 object-contain bg-black"
                      />
                      {msg.sensitive && (
                        <button
                          onClick={() => onToggleRevealMedia(msg.id)}
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-slate-300 hover:text-white"
                          title="Re-blur video"
                        >
                          <EyeOff className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}

                  {msg.caption && (
                    <div className="p-2.5 text-xs text-white bg-[#0e071c]/95 border-t border-white/5">
                      {msg.caption}
                    </div>
                  )}
                </div>
              )}

              <span className="text-[10px] text-slate-500 mt-1 px-1">
                {msg.timestamp}
              </span>
            </div>
          );
        })}

        {/* Real-time Group Typing Indicator */}
        {typingUser && (
          <div className="flex items-center gap-2 text-violet-400 text-xs italic pl-1 animate-in fade-in duration-200">
            <span className="text-[11px] font-medium">{typingUser} is typing</span>
            <span className="flex gap-1 items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-bounce [animation-delay:0.4s]" />
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Group Icebreakers */}
      <div className="px-3 sm:px-4 py-1.5 bg-[#0b0518] border-t border-white/5 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
        <span className="text-[10px] text-pink-400 font-bold uppercase tracking-wider shrink-0 flex items-center gap-1">
          <Sparkles className="w-3 h-3" /> Sparks:
        </span>
        {GROUP_ICEBREAKERS.map((tip, idx) => (
          <button
            key={idx}
            onClick={() => onSendMessage({ content: tip, mediaType: 'text' })}
            className="text-[11px] px-2.5 py-1 rounded-full bg-white/[0.03] hover:bg-pink-600/20 border border-white/5 hover:border-pink-500/30 text-slate-300 hover:text-pink-200 whitespace-nowrap transition-all cursor-pointer"
          >
            {tip}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div className="p-3 sm:p-4 border-t border-white/10 bg-[#0d071b] relative shrink-0">
        <div className="max-w-4xl mx-auto flex items-center gap-2">
          <button
            onClick={() => setIsMediaModalOpen(true)}
            className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-pink-400 hover:bg-pink-500/20 transition-colors cursor-pointer"
            title="Send photo or video"
          >
            <ImageIcon className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsGifPickerOpen(!isGifPickerOpen)}
            className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-black transition-colors cursor-pointer ${
              isGifPickerOpen
                ? 'bg-violet-600 text-white border-violet-500'
                : 'bg-white/[0.04] border-white/10 text-violet-400 hover:bg-violet-500/20'
            }`}
            title="GIF reaction drawer"
          >
            GIF
          </button>

          <div className="flex-1 relative">
            <input
              type="text"
              value={inputText}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={`Send to ${group.name}...`}
              className="w-full bg-white/[0.05] border border-white/10 text-white placeholder-slate-500 text-xs sm:text-sm rounded-xl py-2.5 pl-3.5 pr-9 focus:outline-none focus:border-pink-500 transition-colors"
            />
            <button
              onClick={() => onSendMessage({ content: 'Hey everyone! 👋', mediaType: 'text' })}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-pink-400 transition-colors"
              title="Quick wave"
            >
              <Smile className="w-4 h-4" />
            </button>
          </div>

          <button
            disabled={!inputText.trim()}
            onClick={handleSend}
            className={`p-2.5 rounded-xl text-white shadow-md transition-all active:scale-95 ${
              inputText.trim()
                ? 'bg-gradient-to-r from-pink-600 to-rose-500 shadow-[0_0_15px_rgba(255,42,133,0.45)] cursor-pointer hover:brightness-110'
                : 'bg-white/5 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        {/* Embedded GIF Picker */}
        <GifPicker
          isOpen={isGifPickerOpen}
          onClose={() => setIsGifPickerOpen(false)}
          onSelectGif={(url) => {
            onSendMessage({ mediaType: 'gif', mediaUrl: url, caption: 'Sent a GIF reaction' });
          }}
        />
      </div>

      {/* Ephemeral Media Modal */}
      <MediaModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onSendMedia={(payload) => onSendMessage(payload)}
      />

      {/* Avatar Customization Modal */}
      <AvatarPickerModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        currentAvatar={myAvatar}
        onSelectAvatar={onUpdateAvatar}
        currentAlias={myAlias}
      />

      {/* ENTERED USERS PANEL: Shows all entered users with profile pic and status (online or offline) */}
      {isMembersDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-88 max-w-full bg-[#100724] border-l border-white/10 h-full p-5 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-250">
            <div className="space-y-4">
              {/* Panel Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-xl bg-pink-500/20 text-pink-400">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-white">
                      Entered Users ({members.length})
                    </h3>
                    <p className="text-[10px] text-slate-400">100% Real Humans • Zero Bots</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsMembersDrawerOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
                  title="Close panel"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Status Summary Counts */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <div>
                    <span className="text-xs font-bold text-white block">{onlineMembersCount} Online</span>
                    <span className="text-[9px] text-emerald-300">Active right now</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
                  <div>
                    <span className="text-xs font-bold text-slate-300 block">{offlineMembersCount} Offline</span>
                    <span className="text-[9px] text-slate-400">Left lounge</span>
                  </div>
                </div>
              </div>

              {/* My Profile Capsule in Panel */}
              <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    <img
                      src={myAvatar}
                      alt={myAlias}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-pink-500"
                    />
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-[#100724]" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">{myAlias} (You)</span>
                    <span className="text-[10px] text-emerald-400 font-semibold">● Status: Online</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsAvatarModalOpen(true)}
                  className="px-2.5 py-1 rounded-lg bg-pink-600/30 hover:bg-pink-600 border border-pink-500/40 text-pink-200 hover:text-white text-[10px] font-bold transition-all cursor-pointer"
                >
                  Change Pic
                </button>
              </div>

              {/* Roster of All Entered Users */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">
                  <span>All Entered Users</span>
                  <span>{members.length} Total</span>
                </div>

                <div className="space-y-2 overflow-y-auto max-h-[50vh] pr-1 scrollbar-thin">
                  {members.map((member) => {
                    const isCurrent = member.alias === myAlias;
                    const isOnline = member.status === 'online';

                    return (
                      <div
                        key={member.id}
                        className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                          isOnline
                            ? isCurrent
                              ? 'bg-pink-600/15 border-pink-500/40'
                              : 'bg-white/[0.04] border-white/10 hover:border-pink-500/30'
                            : 'bg-white/[0.01] border-white/5 opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {/* Profile Picture with Online Status Ring */}
                          <div className="relative shrink-0">
                            <img
                              src={member.avatarUrl || myAvatar}
                              alt={member.alias}
                              className={`w-10 h-10 rounded-full object-cover shadow-sm ${
                                isOnline
                                  ? 'ring-2 ring-emerald-400/80'
                                  : 'ring-2 ring-slate-600 grayscale'
                              }`}
                            />
                            {/* Status indicator on avatar */}
                            <span
                              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ring-2 ring-[#100724] ${
                                isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                              }`}
                            />
                          </div>

                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
                              <span className="truncate">{member.alias}</span>
                              {isCurrent && (
                                <span className="text-[10px] text-pink-400 font-semibold shrink-0">
                                  (You)
                                </span>
                              )}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {member.isHost ? '👑 Lounge Host' : 'Anonymous Human'}
                            </p>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="shrink-0 flex items-center gap-1.5">
                          {isOnline ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 border border-emerald-500/40 text-emerald-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              Online
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/5 border border-white/10 text-slate-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                              Offline
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 space-y-2">
              <button
                onClick={onLeaveGroup}
                className="w-full py-2.5 rounded-xl border border-rose-500/40 text-rose-300 hover:bg-rose-500 hover:text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Leave Group Lounge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
