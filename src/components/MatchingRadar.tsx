import React, { useState, useEffect } from 'react';
import { Flame, X, Sparkles, Compass } from 'lucide-react';
import { SeekingGender, ChatTopic } from '../types';

interface MatchingRadarProps {
  seekingGender: SeekingGender;
  topic: ChatTopic;
  onCancel: () => void;
  onlineCount: number;
}

const ICEBREAKER_TIPS = [
  "Hot tip: Flirty, specific intros get a 78% higher reply rate than just saying 'hey'.",
  "Late-night idea: Ask them 'What is one thing keeping you awake tonight?'",
  "Send an atmosphere teaser snapshot using the media tool to spark instant curiosity.",
  "100% Ephemeral: Tap NEXT anytime and this room vanishes from RAM forever.",
  "Truth or Dare is the quickest way to turn a lukewarm conversation electric.",
];

export const MatchingRadar: React.FC<MatchingRadarProps> = ({
  seekingGender,
  topic,
  onCancel,
  onlineCount,
}) => {
  const [tipIndex, setTipIndex] = useState(0);
  const [searchSeconds, setSearchSeconds] = useState(1);

  useEffect(() => {
    const tipInterval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % ICEBREAKER_TIPS.length);
    }, 2800);

    const timerInterval = setInterval(() => {
      setSearchSeconds((s) => s + 1);
    }, 1000);

    return () => {
      clearInterval(tipInterval);
      clearInterval(timerInterval);
    };
  }, []);

  const seekingLabel =
    seekingGender === 'female'
      ? 'Girls'
      : seekingGender === 'male'
      ? 'Guys'
      : 'Everyone';

  const topicLabel =
    topic === 'late_night'
      ? 'Late-Night Secrets'
      : topic === 'flirt'
      ? 'Flirting & Sparks'
      : topic === 'deep_talk'
      ? 'Deep Talks'
      : topic === 'wildcard'
      ? 'Wild Card'
      : 'Casual Banter';

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden min-h-[500px]">
      {/* Background radial glows */}
      <div className="absolute w-[360px] h-[360px] rounded-full bg-pink-600/15 blur-[100px] pointer-events-none" />
      <div className="absolute w-[300px] h-[300px] rounded-full bg-violet-600/15 blur-[90px] pointer-events-none" />

      {/* Radar Wave Graphic */}
      <div className="relative flex items-center justify-center w-64 h-64 mb-8">
        {/* Pulsing Concentric Neon Rings */}
        <span className="absolute w-64 h-64 rounded-full border border-pink-500/20 animate-ping [animation-duration:2.5s]" />
        <span className="absolute w-48 h-48 rounded-full border border-violet-500/30 animate-pulse [animation-duration:1.8s]" />
        <span className="absolute w-36 h-36 rounded-full border border-pink-500/40" />
        <span className="absolute w-24 h-24 rounded-full bg-gradient-to-tr from-pink-600/20 to-violet-600/20 blur-md" />

        {/* Center glowing heartbeat orb */}
        <div className="relative z-10 w-20 h-20 rounded-full bg-gradient-to-tr from-pink-600 via-rose-500 to-violet-600 flex items-center justify-center text-white shadow-[0_0_35px_rgba(255,42,133,0.7)] animate-pulse">
          <Flame className="w-9 h-9 fill-current animate-bounce [animation-duration:1.2s]" />
        </div>
      </div>

      {/* Headline & Filtering Info */}
      <div className="space-y-2 max-w-sm z-10">
        <h2 className="text-2xl font-black text-white tracking-tight">
          Chasing down a stranger for you...
        </h2>
        <div className="flex items-center justify-center gap-2 text-xs font-medium text-pink-300">
          <span>Seeking: <strong className="text-white">{seekingLabel}</strong></span>
          <span aria-hidden="true">·</span>
          <span>Vibe: <strong className="text-white">{topicLabel}</strong></span>
        </div>
        <p className="text-[11px] text-slate-400 tabular-nums">
          Scanning queue ({searchSeconds}s elapsed) · Average match: 2.1s
        </p>
      </div>

      {/* Dynamic Icebreaker Tip Box */}
      <div className="bg-[#120826]/80 border border-white/10 p-4 rounded-2xl max-w-xs mt-6 text-left relative overflow-hidden backdrop-blur-md">
        <div className="flex items-start gap-2.5">
          <span className="text-pink-400 shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4" />
          </span>
          <p className="text-xs text-slate-200 leading-relaxed italic">
            &ldquo;{ICEBREAKER_TIPS[tipIndex]}&rdquo;
          </p>
        </div>
      </div>

      {/* Cancel Action */}
      <div className="mt-8 z-10">
        <button
          onClick={onCancel}
          className="px-6 py-2.5 rounded-full border border-white/20 text-xs font-semibold text-slate-300 hover:text-white hover:border-pink-500/50 hover:bg-white/[0.04] transition-all cursor-pointer flex items-center gap-1.5"
        >
          <X className="w-3.5 h-3.5" />
          <span>Cancel Search</span>
        </button>
      </div>
    </div>
  );
};
