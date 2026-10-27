import React, { useState } from 'react';
import {
  Flame,
  Zap,
  ShieldCheck,
  EyeOff,
  Sparkles,
  Lock,
  Heart,
  Users,
  Compass,
  CheckCircle2,
  Palette,
  Image as ImageIcon,
} from 'lucide-react';
import { Gender, SeekingGender, ChatTopic, ThemeConfig, THEME_PRESETS, ThemePresetId } from '../types';

interface LandingHeroProps {
  onStartMatching: (myGender: Gender, seekingGender: SeekingGender, topic: ChatTopic) => void;
  onlineCount: number;
  currentTheme?: ThemeConfig;
  onSelectTheme?: (theme: ThemeConfig) => void;
  onOpenThemeModal?: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onStartMatching,
  onlineCount,
  currentTheme,
  onSelectTheme,
  onOpenThemeModal,
}) => {
  const [myGender, setMyGender] = useState<Gender>('male');
  const [seekingGender, setSeekingGender] = useState<SeekingGender>('female');
  const [topic, setTopic] = useState<ChatTopic>('late_night');

  const handleStart = () => {
    onStartMatching(myGender, seekingGender, topic);
  };

  const handleQuickTheme = (presetId: ThemePresetId) => {
    if (!onSelectTheme) return;
    if (presetId !== 'custom') {
      const p = THEME_PRESETS[presetId];
      onSelectTheme({
        ...p,
        customImageUrl: '',
        overlayOpacity: currentTheme?.overlayOpacity ?? 0.75,
        overlayBlur: currentTheme?.overlayBlur ?? 0,
      });
    } else if (onOpenThemeModal) {
      onOpenThemeModal();
    }
  };

  return (
    <section className="relative w-full py-6 md:py-14 overflow-hidden">
      {/* Permanent Crimson Velvet & Candlelight ambient background glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-rose-700/20 rounded-full blur-[150px] pointer-events-none animate-pulse-slow" />
      <div className="absolute top-1/3 right-1/4 w-[450px] h-[450px] bg-amber-600/15 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/3 w-[600px] h-[300px] bg-pink-900/25 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 space-y-6">
        
        {/* Visible On Main Page: Permanent Theme Banner & Quick Switcher */}
        <div className="w-full p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-rose-950/60 via-red-950/50 to-amber-950/40 border border-rose-500/30 backdrop-blur-xl shadow-[0_0_35px_rgba(225,29,72,0.2)] flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white shadow-[0_0_15px_rgba(225,29,72,0.5)] shrink-0">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
                <span className="text-xs font-black tracking-wider uppercase text-rose-300">
                  Permanent Screen Theme
                </span>
                <span className="px-2 py-0.5 rounded-full bg-rose-500/25 text-rose-200 border border-rose-400/40 text-[10px] font-bold shadow-sm">
                  🔥 {currentTheme?.name || 'Crimson Velvet & Passion'}
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Intimate deep ruby velvet, romantic candlelight warmth &amp; dusk embers active across the site
              </p>
            </div>
          </div>

          {/* Quick 1-tap Theme Switchers right on Main Page */}
          <div className="flex items-center gap-1.5 flex-wrap justify-center">
            <button
              onClick={() => handleQuickTheme('crimson_velvet')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                currentTheme?.preset === 'crimson_velvet'
                  ? 'bg-rose-600 text-white shadow-[0_0_15px_rgba(225,29,72,0.6)] ring-1 ring-white/30'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10'
              }`}
            >
              <span>🍷 Crimson Velvet</span>
            </button>

            <button
              onClick={() => handleQuickTheme('sunset_romance')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                currentTheme?.preset === 'sunset_romance'
                  ? 'bg-amber-600 text-white shadow-[0_0_15px_rgba(245,158,11,0.5)] ring-1 ring-white/30'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10'
              }`}
            >
              <span>🕯️ Candlelit Sunset</span>
            </button>

            <button
              onClick={() => handleQuickTheme('midnight_noir')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                currentTheme?.preset === 'midnight_noir'
                  ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)] ring-1 ring-white/30'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10'
              }`}
            >
              <span>🌌 Midnight Noir</span>
            </button>

            <button
              onClick={onOpenThemeModal}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/15 text-white border border-white/20 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
              title="Add custom wallpaper image URL or adjust darkness"
            >
              <ImageIcon className="w-3.5 h-3.5 text-rose-400" />
              <span>Wallpaper URL</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Column: Brand Story & Live Pulse */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Live Indicator */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs font-semibold shadow-[0_0_15px_rgba(225,29,72,0.25)]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{onlineCount.toLocaleString()} Strangers Live Right Now</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1] text-balance">
              Sparks Fly in the{' '}
              <span className="bg-gradient-to-r from-rose-500 via-pink-500 to-amber-400 bg-clip-text text-transparent">
                Crimson Velvet Dark.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-rose-100/90 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
              No profiles, no histories, no fake bios. Match instantly 1-on-1 with an attractive stranger in an intimate, candlelit velvet lounge where whispers live for a moment and vanish forever.
            </p>


            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-left">
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-md">
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1 rounded-lg bg-pink-500/20 text-pink-400">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-white">Zero Digital Logs</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Instant RAM-only relay. No chat history or media saved.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-md">
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1 rounded-lg bg-violet-500/20 text-violet-400">
                    <EyeOff className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-white">Tap-To-Reveal</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Photos and video clips stay blurred until you tap them.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-md">
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1 rounded-lg bg-rose-500/20 text-rose-400">
                    <Zap className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-white">Instant NEXT</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Skip unwanted vibes in a millisecond with one tap.
                </p>
              </div>
            </div>

            {/* Unboxed Editorial Proof */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 text-xs text-slate-400 pt-2">
              <span>Strictly 18+ Lounge</span>
              <span aria-hidden="true">·</span>
              <span>Subichat Alternative</span>
              <span aria-hidden="true">·</span>
              <span>Encrypted WebSockets</span>
              <span aria-hidden="true">·</span>
              <span>100% Free &amp; Anonymous</span>
            </div>
          </div>

          {/* Right Column: Match Intent Terminal */}
          <div className="lg:col-span-5 w-full max-w-md mx-auto">
            <div className="relative p-6 sm:p-7 rounded-3xl bg-[#0f0722]/90 border border-white/[0.08] shadow-[0_0_40px_rgba(255,42,133,0.18)] backdrop-blur-2xl">
              
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-ping" />
                  <span className="text-xs font-extrabold tracking-wider text-white">
                    INTENT RADAR
                  </span>
                </div>
                <span className="text-[11px] text-pink-300 font-semibold">
                  Step 1 of 1 · Instant
                </span>
              </div>

              {/* Step 1: My Gender */}
              <div className="space-y-2 mb-5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
                  <span>1. I Am A</span>
                  <span className="text-[11px] text-slate-400 font-normal">Choose your avatar</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'male' as Gender, label: '👨 Guy' },
                    { key: 'female' as Gender, label: '👩 Girl' },
                    { key: 'nonbinary' as Gender, label: '✨ Any' },
                  ].map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setMyGender(item.key)}
                      className={`py-3 px-2 rounded-2xl text-xs font-bold transition-all border cursor-pointer ${
                        myGender === item.key
                          ? 'bg-pink-600/30 border-pink-500 text-pink-200 shadow-[0_0_15px_rgba(255,42,133,0.35)]'
                          : 'bg-white/[0.02] border-white/10 text-slate-400 hover:border-white/20 hover:text-white'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Seeking Gender */}
              <div className="space-y-2 mb-5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
                  <span>2. Seeking To Meet</span>
                  <span className="text-[11px] text-slate-400 font-normal">Preference filter</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'female' as SeekingGender, label: '👩 Girls' },
                    { key: 'male' as SeekingGender, label: '👨 Guys' },
                    { key: 'anyone' as SeekingGender, label: '🎲 Anyone' },
                  ].map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setSeekingGender(item.key)}
                      className={`py-3 px-2 rounded-2xl text-xs font-bold transition-all border cursor-pointer ${
                        seekingGender === item.key
                          ? 'bg-violet-600/30 border-violet-500 text-violet-200 shadow-[0_0_15px_rgba(139,92,246,0.35)]'
                          : 'bg-white/[0.02] border-white/10 text-slate-400 hover:border-white/20 hover:text-white'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 3: Conversation Vibe */}
              <div className="space-y-2 mb-6">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
                  <span>3. Late-Night Vibe</span>
                  <span className="text-[11px] text-pink-400 font-medium">Topic Filter</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: 'late_night' as ChatTopic, label: '🌙 Late-Night Secrets' },
                    { key: 'flirt' as ChatTopic, label: '💋 Flirting & Sparks' },
                    { key: 'deep_talk' as ChatTopic, label: '🌌 Deep Talks' },
                    { key: 'wildcard' as ChatTopic, label: '🎲 Wild Card' },
                  ].map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setTopic(item.key)}
                      className={`py-2 px-2.5 rounded-xl text-[11px] font-semibold transition-all border text-left cursor-pointer truncate ${
                        topic === item.key
                          ? 'bg-pink-600/25 border-pink-500/60 text-white'
                          : 'bg-white/[0.02] border-white/5 text-slate-400 hover:text-white hover:border-white/15'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Glowing Heartbeat Pulsing CTA */}
              <button
                type="button"
                onClick={handleStart}
                className="w-full relative group overflow-hidden py-4 px-6 rounded-2xl bg-gradient-to-r from-pink-600 via-rose-500 to-violet-600 font-extrabold text-white text-base tracking-wide shadow-[0_0_25px_rgba(255,42,133,0.55)] hover:shadow-[0_0_35px_rgba(255,42,133,0.75)] active:scale-[0.98] transition-all cursor-pointer"
              >
                <div className="flex items-center justify-center gap-2">
                  <Flame className="w-5 h-5 fill-current text-white animate-pulse" />
                  <span>FIND MY STRANGER</span>
                </div>
              </button>

              <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-pink-400" />
                <span>Zero registration required · Incinerated on exit</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
