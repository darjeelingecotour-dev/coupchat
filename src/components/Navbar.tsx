import React from 'react';
import { Flame, Sparkles, Users, Palette } from 'lucide-react';
import { ViewState, NavigationTab, ThemeConfig } from '../types';

interface NavbarProps {
  viewState: ViewState;
  onNavigateTab: (tab: NavigationTab) => void;
  onStartMatch: () => void;
  onEndChat: () => void;
  activeTab: NavigationTab;
  onlineCount: number;
  currentTheme?: ThemeConfig;
  onOpenTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  viewState,
  onNavigateTab,
  onStartMatch,
  onEndChat,
  activeTab,
  onlineCount,
  currentTheme,
  onOpenTheme,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-rose-500/15 bg-[#0c0207]/85 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 sm:gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => {
              if (viewState === 'chat' || viewState === 'group_chat') {
                if (window.confirm('Leave current conversation and return to lobby?')) {
                  onEndChat();
                  onNavigateTab('chat');
                }
              } else {
                onNavigateTab('chat');
              }
            }}
            className="flex items-center gap-2 group text-left cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-pink-600 to-rose-500 flex items-center justify-center text-white shadow-[0_0_15px_rgba(255,42,133,0.45)] group-hover:scale-105 transition-transform">
              <Flame className="w-5 h-5 fill-current" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-wider bg-gradient-to-r from-pink-500 via-rose-400 to-violet-400 bg-clip-text text-transparent whitespace-nowrap">
                COUPCHAT
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Clean 4 Nav Links with single-line labels */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
          <button
            onClick={() => onNavigateTab('chat')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              activeTab === 'chat' ? 'text-pink-400 font-semibold' : 'hover:text-white'
            }`}
          >
            1-on-1 Match
          </button>
          <button
            onClick={() => onNavigateTab('groups')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'groups' ? 'text-pink-400 font-semibold' : 'hover:text-white'
            }`}
          >
            <span>Group Lounges</span>
            <span className="px-1.5 py-0.2 rounded-full bg-pink-500/20 text-pink-300 text-[10px] font-bold">
              HOT
            </span>
          </button>
          <button
            onClick={() => onNavigateTab('safety')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              activeTab === 'safety' ? 'text-pink-400 font-semibold' : 'hover:text-white'
            }`}
          >
            Safety &amp; Rules
          </button>
          <button
            onClick={() => onNavigateTab('faq')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              activeTab === 'faq' ? 'text-pink-400 font-semibold' : 'hover:text-white'
            }`}
          >
            FAQ
          </button>
        </nav>

        {/* Zone 3: Actions + Theme Picker */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Theme customizer button */}
          <button
            onClick={onOpenTheme}
            title="Customize Atmosphere & Theme"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-white/[0.05] border border-white/10 hover:border-pink-500/50 hover:bg-white/[0.08] text-slate-200 transition-all cursor-pointer shadow-sm group"
          >
            <Palette className="w-3.5 h-3.5 text-pink-400 group-hover:rotate-12 transition-transform" />
            <span className="hidden sm:inline">Theme</span>
            {currentTheme?.preset === 'crimson_velvet' && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse hidden sm:inline" />
            )}
          </button>

          {viewState === 'chat' || viewState === 'group_chat' ? (
            <button
              onClick={onEndChat}
              className="px-4 py-2 text-xs font-semibold text-rose-300 bg-rose-500/15 border border-rose-500/30 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-[0_0_12px_rgba(244,63,94,0.25)] whitespace-nowrap shrink-0 cursor-pointer"
            >
              Exit Room
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigateTab('groups')}
                className="hidden sm:flex px-3 py-2 text-xs font-semibold text-slate-300 bg-white/[0.04] border border-white/10 rounded-xl hover:text-white hover:border-white/20 transition-all cursor-pointer whitespace-nowrap shrink-0 items-center gap-1.5"
              >
                <Users className="w-3.5 h-3.5 text-pink-400" />
                <span>Groups</span>
              </button>
              <button
                onClick={() => {
                  onNavigateTab('chat');
                  onStartMatch();
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-pink-600 to-rose-500 rounded-xl hover:brightness-110 shadow-[0_0_15px_rgba(255,42,133,0.4)] active:scale-[0.98] transition-all whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Match Stranger</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

