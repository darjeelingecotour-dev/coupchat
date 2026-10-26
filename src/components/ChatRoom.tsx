import React, { useState, useRef, useEffect } from 'react';
import {
  RotateCw,
  Send,
  Image as ImageIcon,
  Smile,
  Eye,
  EyeOff,
  Flame,
  Volume2,
  VolumeX,
  Flag,
  Sparkles,
  Zap,
  Lock,
  Play,
  ArrowRight,
  Users,
  X,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { ChatMessage, MatchInfo } from '../types';
import { GifPicker } from './GifPicker';
import { MediaModal } from './MediaModal';
import { AvatarPickerModal } from './AvatarPickerModal';

interface ChatRoomProps {
  messages: ChatMessage[];
  strangerTyping: boolean;
  partnerLeft: boolean;
  matchInfo: MatchInfo | null;
  onSendMessage: (payload: {
    content?: string;
    mediaType?: 'text' | 'image' | 'video' | 'gif';
    mediaUrl?: string;
    caption?: string;
    sensitive?: boolean;
  }) => void;
  onSendTyping: (isTyping: boolean) => void;
  onNextStranger: () => void;
  onEndChat: () => void;
  onToggleRevealMedia: (id: string) => void;
  myAvatar: string;
  myAlias: string;
  onUpdateAvatar?: (avatarUrl: string) => void;
}

const QUICK_ICEBREAKERS = [
  "What's your 2 AM secret?",
  "Rate my vibe 1-10 😈",
  "Truth or Dare?",
  "What keeps you awake tonight?",
  "Tell me a confession.",
];

export const ChatRoom: React.FC<ChatRoomProps> = ({
  messages,
  strangerTyping,
  partnerLeft,
  matchInfo,
  onSendMessage,
  onSendTyping,
  onNextStranger,
  onEndChat,
  onToggleRevealMedia,
  myAvatar,
  myAlias,
  onUpdateAvatar,
}) => {
  const [inputText, setInputText] = useState('');
  const [isUsersPanelOpen, setIsUsersPanelOpen] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isGifPickerOpen, setIsGifPickerOpen] = useState(false);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isReported, setIsReported] = useState(false);
  const [durationSeconds, setDurationSeconds] = useState(0);

  const strangerAvatar =
    matchInfo?.partnerAvatarUrl ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80';
  const isStrangerOnline = !partnerLeft;

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, strangerTyping]);

  // Duration counter
  useEffect(() => {
    const timer = setInterval(() => {
      setDurationSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDuration = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);

    // Typing debounce
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

  const handleSelectIcebreaker = (icebreaker: string) => {
    onSendMessage({
      content: icebreaker,
      mediaType: 'text',
    });
  };

  const handleSelectGif = (url: string) => {
    onSendMessage({
      mediaType: 'gif',
      mediaUrl: url,
      caption: 'Sent a GIF reaction',
    });
  };

  const handleSendMediaPayload = (payload: {
    mediaType: 'image' | 'video';
    mediaUrl: string;
    caption?: string;
    sensitive: boolean;
  }) => {
    onSendMessage(payload);
  };

  const handleReport = () => {
    if (window.confirm('Report this stranger for inappropriate behavior and disconnect immediately?')) {
      setIsReported(true);
      setTimeout(() => {
        onNextStranger();
        setIsReported(false);
      }, 800);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-64px)] max-h-[calc(100vh-64px)] bg-[#07030e] text-slate-100 overflow-hidden relative">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-pink-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Sticky Header Bar */}
      <div className="px-3 sm:px-5 py-3 border-b border-white/10 bg-[#0d071b]/95 backdrop-blur-xl flex items-center justify-between gap-2 z-30 shrink-0">
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Sticky NEXT Button */}
          <button
            onClick={onNextStranger}
            className="group flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white rounded-xl text-xs font-bold transition-all shadow-[0_0_15px_rgba(244,63,94,0.4)] active:scale-95 cursor-pointer whitespace-nowrap"
            title="Skip to next stranger"
          >
            <RotateCw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-300" />
            <span>NEXT</span>
          </button>

          {/* Stranger Avatar & Details */}
          <div className="flex items-center gap-2.5">
            <div className="relative shrink-0">
              <img
                src={strangerAvatar}
                alt={matchInfo?.strangerAlias || 'Stranger'}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover transition-all ${
                  isStrangerOnline
                    ? 'ring-2 ring-emerald-400/80 shadow-[0_0_10px_rgba(52,211,153,0.3)]'
                    : 'ring-2 ring-slate-600 grayscale'
                }`}
              />
              <span
                className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-[#0d071b] ${
                  isStrangerOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                }`}
                title={isStrangerOnline ? 'Status: Online' : 'Status: Offline (Left chat)'}
              />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                  <span>{matchInfo?.strangerAlias || 'Stranger'}</span>
                  {isStrangerOnline ? (
                    <span className="text-[10px] text-emerald-400 font-bold hidden sm:inline">
                      ● Online
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-bold hidden sm:inline">
                      ● Offline
                    </span>
                  )}
                </h3>
                {matchInfo?.partnerGender && (
                  <span className="text-[10px] text-pink-300/80 capitalize">
                    ({matchInfo.partnerGender})
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                <span className="tabular-nums font-mono text-pink-400">
                  {formatDuration(durationSeconds)}
                </span>
                <span aria-hidden="true">·</span>
                <span className="truncate max-w-[100px] sm:max-w-none">
                  {matchInfo?.topic || 'Late-Night Whispers'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Entered Users Panel Toggle */}
          <button
            onClick={() => setIsUsersPanelOpen(!isUsersPanelOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-pink-600/15 hover:bg-pink-600/25 border border-pink-500/30 text-xs font-semibold text-pink-300 transition-all cursor-pointer"
            title="Open Entered Users Panel"
          >
            <Users className="w-3.5 h-3.5 text-pink-400" />
            <span className="hidden sm:inline font-bold">Entered Users</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-pink-500/20 text-white font-mono">
              2
            </span>
            <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold bg-emerald-500/15 px-1.5 py-0.2 rounded-md">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isStrangerOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'
                }`}
              />
              {isStrangerOnline ? '2 Online' : '1 Online'}
            </span>
          </button>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors"
            title={soundEnabled ? 'Mute audio' : 'Unmute audio'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={handleReport}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-white/[0.05] transition-colors"
            title="Report & skip stranger"
          >
            <Flag className="w-4 h-4" />
          </button>

          <button
            onClick={onEndChat}
            className="text-xs font-medium text-slate-400 hover:text-rose-300 px-2 py-1.5 rounded-lg hover:bg-white/[0.05] transition-colors"
          >
            End
          </button>
        </div>
      </div>

      {/* Ephemerality Notice Pill */}
      <div className="px-4 py-1.5 bg-pink-950/30 border-b border-pink-500/10 text-[11px] text-pink-300/80 flex items-center justify-center gap-2 shrink-0">
        <Lock className="w-3 h-3 text-pink-400 shrink-0" />
        <span>100% Ephemeral: Messages & media vanish the second you hit NEXT or close the tab.</span>
      </div>

      {/* Partner Left Alert Banner */}
      {partnerLeft && (
        <div className="p-4 bg-gradient-to-r from-rose-950/80 to-[#190928] border-b border-rose-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-300 z-20">
          <div className="text-center sm:text-left">
            <p className="text-sm font-bold text-white">Stranger has disconnected</p>
            <p className="text-xs text-rose-300/80">
              The conversation has ended and all memories were incinerated.
            </p>
          </div>
          <button
            onClick={onNextStranger}
            className="px-5 py-2.5 bg-gradient-to-r from-pink-600 to-rose-500 text-white rounded-xl text-xs font-extrabold shadow-[0_0_20px_rgba(255,42,133,0.5)] active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Zap className="w-4 h-4 fill-current text-yellow-300" />
            <span>FIND NEXT STRANGER</span>
          </button>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((msg) => {
          if (msg.sender === 'system') {
            return (
              <div key={msg.id} className="flex justify-center my-2">
                <div className="text-center text-[11px] text-slate-400 bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-2 max-w-md">
                  {msg.content}
                </div>
              </div>
            );
          }

          const isUser = msg.sender === 'user';

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} group`}
            >
              {/* Text Message Bubble */}
              {msg.content && msg.mediaType === 'text' && (
                <div
                  className={`max-w-[85%] sm:max-w-[70%] px-4 py-3 rounded-2xl text-sm leading-relaxed transition-all ${
                    isUser
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
                    isUser ? 'border-pink-500/40' : 'border-violet-500/30'
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

              {/* Image Media with Tap-To-Reveal Sensitive Filter */}
              {msg.mediaType === 'image' && msg.mediaUrl && (
                <div
                  className={`relative rounded-2xl overflow-hidden border max-w-[260px] sm:max-w-[300px] shadow-xl group ${
                    isUser ? 'border-pink-500/40' : 'border-violet-500/35'
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

                  {/* Sensitive blur overlay */}
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
                      <span className="text-[10px] text-pink-300">
                        Tap to reveal
                      </span>
                    </button>
                  )}

                  {/* Re-blur option when revealed */}
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
                    isUser ? 'border-pink-500/40' : 'border-violet-500/35'
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

        {/* Real-time Typing Indicator */}
        {strangerTyping && (
          <div className="flex items-center gap-2 text-violet-400 text-xs italic pl-1 animate-in fade-in duration-200">
            <span className="text-[11px] font-medium">
              {matchInfo?.strangerAlias || 'Stranger'} is typing
            </span>
            <span className="flex gap-1 items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-bounce [animation-delay:0.4s]" />
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Icebreaker Suggestions */}
      {!partnerLeft && (
        <div className="px-3 sm:px-4 py-1.5 bg-[#0b0518] border-t border-white/5 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
          <span className="text-[10px] text-pink-400 font-bold uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Quick:
          </span>
          {QUICK_ICEBREAKERS.map((tip, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectIcebreaker(tip)}
              className="text-[11px] px-2.5 py-1 rounded-full bg-white/[0.03] hover:bg-pink-600/20 border border-white/5 hover:border-pink-500/30 text-slate-300 hover:text-pink-200 whitespace-nowrap transition-all cursor-pointer"
            >
              {tip}
            </button>
          ))}
        </div>
      )}

      {/* Input Bar & Controls */}
      <div className="p-3 sm:p-4 border-t border-white/10 bg-[#0d071b] relative shrink-0">
        <div className="max-w-4xl mx-auto flex items-center gap-2">
          {/* Media tools */}
          <button
            onClick={() => setIsMediaModalOpen(true)}
            className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-pink-400 hover:bg-pink-500/20 hover:text-pink-300 transition-colors cursor-pointer"
            title="Send photo or video clip"
          >
            <ImageIcon className="w-4 h-4" />
          </button>

          {/* GIF Picker Trigger */}
          <button
            onClick={() => setIsGifPickerOpen(!isGifPickerOpen)}
            className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-black transition-colors cursor-pointer ${
              isGifPickerOpen
                ? 'bg-violet-600 text-white border-violet-500'
                : 'bg-white/[0.04] border-white/10 text-violet-400 hover:bg-violet-500/20 hover:text-violet-300'
            }`}
            title="Reaction GIF drawer"
          >
            GIF
          </button>

          {/* Input field */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputText}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              disabled={partnerLeft}
              placeholder={
                partnerLeft
                  ? 'Stranger left the chat. Tap NEXT above.'
                  : 'Whisper something bold...'
              }
              className="w-full bg-white/[0.05] border border-white/10 text-white placeholder-slate-500 text-xs sm:text-sm rounded-xl py-2.5 pl-3.5 pr-9 focus:outline-none focus:border-pink-500 transition-colors disabled:opacity-50"
            />
            <button
              onClick={() => handleSelectIcebreaker("Hey, what are you doing right now? 😉")}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-pink-400 transition-colors"
              title="Quick playful emoji"
            >
              <Smile className="w-4 h-4" />
            </button>
          </div>

          {/* Send Button */}
          <button
            disabled={!inputText.trim() || partnerLeft}
            onClick={handleSend}
            className={`p-2.5 rounded-xl text-white shadow-md transition-all active:scale-95 ${
              inputText.trim() && !partnerLeft
                ? 'bg-gradient-to-r from-pink-600 to-rose-500 shadow-[0_0_15px_rgba(255,42,133,0.45)] cursor-pointer hover:brightness-110'
                : 'bg-white/5 text-slate-500 cursor-not-allowed'
            }`}
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        {/* Embedded GIF Picker Drawer */}
        <GifPicker
          isOpen={isGifPickerOpen}
          onClose={() => setIsGifPickerOpen(false)}
          onSelectGif={handleSelectGif}
        />
      </div>

      {/* Ephemeral Media Modal */}
      <MediaModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onSendMedia={handleSendMediaPayload}
      />

      {/* Entered Users Panel (Real-Time Presence & Status) */}
      {isUsersPanelOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => setIsUsersPanelOpen(false)}
          />

          {/* Drawer Sidebar */}
          <div className="relative z-10 w-full max-w-sm bg-[#0e071c] border-l border-white/10 p-5 flex flex-col justify-between shadow-2xl h-full animate-in slide-in-from-right duration-200">
            <div className="space-y-5">
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-xl bg-pink-500/10 text-pink-400">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                      <span>Entered Users</span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-mono">
                        2
                      </span>
                    </h3>
                    <p className="text-[10px] text-slate-400">
                      Real humans joined in this session
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsUsersPanelOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Verified Zero-Bots Guarantee Banner */}
              <div className="p-3 rounded-2xl bg-emerald-950/30 border border-emerald-500/20 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-[11px] text-emerald-300/90 leading-tight">
                  <p className="font-bold text-white mb-0.5">100% Real Humans Verified</p>
                  <span>Zero bots or automated chat. Every user shown here is an active connected human peer.</span>
                </div>
              </div>

              {/* Roster of Entered Users */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">
                  <span>Room Participants</span>
                  <span className="text-emerald-400">
                    {isStrangerOnline ? '2 of 2 Online' : '1 of 2 Online'}
                  </span>
                </div>

                {/* User 1: You */}
                <div className="p-3.5 rounded-2xl bg-pink-600/15 border border-pink-500/40 flex items-center justify-between gap-3 shadow-md">
                  <div className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      <img
                        src={myAvatar}
                        alt={myAlias}
                        className="w-11 h-11 rounded-full object-cover ring-2 ring-emerald-400 shadow-sm"
                      />
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-400 ring-2 ring-[#0e071c] animate-pulse" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
                        <span className="truncate">{myAlias}</span>
                        <span className="text-[10px] text-pink-400 font-semibold shrink-0">
                          (You)
                        </span>
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Chat Participant
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 border border-emerald-500/40 text-emerald-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      Online
                    </span>
                    <button
                      onClick={() => setIsAvatarModalOpen(true)}
                      className="text-[10px] text-pink-300 hover:text-white underline cursor-pointer"
                    >
                      Change Pic
                    </button>
                  </div>
                </div>

                {/* User 2: Matched Stranger */}
                <div
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    isStrangerOnline
                      ? 'bg-white/[0.04] border-white/10 hover:border-pink-500/30'
                      : 'bg-white/[0.01] border-white/5 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      <img
                        src={strangerAvatar}
                        alt={matchInfo?.strangerAlias || 'Stranger'}
                        className={`w-11 h-11 rounded-full object-cover shadow-sm ${
                          isStrangerOnline
                            ? 'ring-2 ring-emerald-400/80'
                            : 'ring-2 ring-slate-600 grayscale'
                        }`}
                      />
                      <span
                        className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full ring-2 ring-[#0e071c] ${
                          isStrangerOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                        }`}
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
                        <span className="truncate">{matchInfo?.strangerAlias || 'Stranger'}</span>
                        <span className="text-[10px] text-slate-400 font-medium shrink-0">
                          (Matched Stranger)
                        </span>
                      </p>
                      <p className="text-[10px] text-slate-400 capitalize">
                        {matchInfo?.partnerGender ? `${matchInfo.partnerGender} · Anonymous Human` : 'Anonymous Human'}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-1.5">
                    {isStrangerOnline ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 border border-emerald-500/40 text-emerald-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        Online
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/5 border border-white/10 text-slate-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                        Offline (Left)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-white/10 space-y-2">
              <button
                onClick={onNextStranger}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-500 text-white font-bold text-xs shadow-md hover:brightness-110 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Next Stranger</span>
              </button>
              <button
                onClick={onEndChat}
                className="w-full py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold hover:bg-white/5 transition-colors cursor-pointer"
              >
                Disconnect &amp; Return Home
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Avatar Picker Modal */}
      <AvatarPickerModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        currentAvatar={myAvatar}
        currentAlias={myAlias}
        onSelectAvatar={(avatarUrl) => {
          if (onUpdateAvatar) {
            onUpdateAvatar(avatarUrl);
          }
        }}
      />
    </div>
  );
};
