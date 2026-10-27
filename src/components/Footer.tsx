import React from 'react';
import { Flame, ShieldAlert, Heart } from 'lucide-react';
import { NavigationTab } from '../types';

interface FooterProps {
  onNavigateTab: (tab: NavigationTab) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigateTab }) => {
  return (
    <footer className="w-full border-t border-white/[0.08] bg-[#060104]/80 backdrop-blur-md py-10 text-slate-400 text-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-pink-600/30 border border-pink-500/40 flex items-center justify-center text-pink-400">
              <Flame className="w-4 h-4 fill-current" />
            </div>
            <span className="font-extrabold text-white tracking-wider text-sm">
              COUPCHAT
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-slate-400">
            <button
              onClick={() => onNavigateTab('chat')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Matchmaker
            </button>
            <button
              onClick={() => onNavigateTab('groups')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Group Lounges
            </button>
            <button
              onClick={() => onNavigateTab('safety')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Safety Standards
            </button>
            <button
              onClick={() => onNavigateTab('faq')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              FAQ
            </button>
          </div>
        </div>

        <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <p>
            &copy; {new Date().getFullYear()} Coupchat. 100% Ephemeral stranger chat.
          </p>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-slate-400">
              <ShieldAlert className="w-3.5 h-3.5 text-pink-500" />
              Strictly 18+ Adults Only
            </span>
            <span aria-hidden="true">·</span>
            <span>Zero Data Logs</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
