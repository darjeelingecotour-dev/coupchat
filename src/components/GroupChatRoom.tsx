import React, { useState, useRef, useEffect } from 'react';
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
} from 'lucide-react';
import { GroupRoom, GroupMember, GroupMessage } from '../types';
import { GifPicker } from './GifPicker';
import { MediaModal } from './MediaModal';

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
}) => {
  const [inputText, setInputText] = useState('');
  const [isGifPickerOpen, setIsGifPickerOpen] = useState(false);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [isMembersDrawerOpen, setIsMembersDrawerOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

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
          <button
            onClick={handleCopyInvite}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-pink-600/20 border border-white/10 hover:border-pink-500/40 text-xs font-semibold text-pink-300 transition-all cursor-pointer"
            title="Copy room invite link/code"
          >
            {copiedCode ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Invite Code</span>
              </>
            )}
          </button>

          <button
            onClick={() => setIsMembersDrawerOpen(true)}
            className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer relative"
            title="View participants"
          >
            <Users className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-pink-600 text-[9px] font-bold text-white flex items-center justify-center">
              {members.length}
            </span>
          </button>
        </div>
      </div>

      {/* Ephemerality notice */}
      <div className="px-4 py-1.5 bg-violet-950/30 border-b border-violet-500/10 text-[11px] text-violet-300/80 flex items-center justify-center gap-2 shrink-0">
        <Flame className="w-3 h-3 text-pink-400 shrink-0" />
        <span>Group Lounge: Messages &amp; media vanish when members leave. Zero server history.</span>
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

      {/* Active Members Drawer */}
      {isMembersDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-80 max-w-full bg-[#110826] border-l border-white/10 h-full p-5 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-250">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-pink-400" />
                  <h3 className="text-sm font-bold text-white">
                    Night Owls in Lounge ({members.length})
                  </h3>
                </div>
                <button
                  onClick={() => setIsMembersDrawerOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 overflow-y-auto max-h-[70vh]">
                {members.map((member) => {
                  const isCurrent = member.alias === myAlias;
                  return (
                    <div
                      key={member.id}
                      className={`p-2.5 rounded-2xl border flex items-center justify-between gap-3 ${
                        isCurrent
                          ? 'bg-pink-600/15 border-pink-500/30'
                          : 'bg-white/[0.02] border-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm"
                          style={{ backgroundColor: member.color || '#ec4899' }}
                        >
                          {member.alias.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white flex items-center gap-1.5">
                            {member.alias}
                            {isCurrent && (
                              <span className="text-[10px] text-pink-400 font-semibold">
                                (You)
                              </span>
                            )}
                          </p>
                          <p className="text-[10px] text-slate-400">Anonymous</p>
                        </div>
                      </div>

                      {member.isHost && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                          Host
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-white/10">
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
