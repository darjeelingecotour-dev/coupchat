import React, { useState, useEffect } from 'react';
import { useCoupSocket } from './hooks/useCoupSocket';
import { Navbar } from './components/Navbar';
import { LandingHero } from './components/LandingHero';
import { MatchingRadar } from './components/MatchingRadar';
import { ChatRoom } from './components/ChatRoom';
import { GroupLounge } from './components/GroupLounge';
import { GroupChatRoom } from './components/GroupChatRoom';
import { SeoSections } from './components/SeoSections';
import { Footer } from './components/Footer';
import { ThemeModal } from './components/ThemeModal';
import { Gender, SeekingGender, ChatTopic, NavigationTab, ThemeConfig, THEME_PRESETS } from './types';
import { Sparkles, Users, Flame } from 'lucide-react';

const DEFAULT_THEME: ThemeConfig = {
  ...THEME_PRESETS.crimson_velvet,
  customImageUrl: '',
  overlayOpacity: 0.75,
  overlayBlur: 0,
};

export default function App() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('chat');
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [theme, setTheme] = useState<ThemeConfig>(() => {
    try {
      const saved = localStorage.getItem('coupchat_theme_v2');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      // ignore
    }
    return DEFAULT_THEME;
  });

  const handleSelectTheme = (newTheme: ThemeConfig) => {
    setTheme(newTheme);
    try {
      localStorage.setItem('coupchat_theme_v2', JSON.stringify(newTheme));
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.style.backgroundColor = theme.bgColor;
    }
  }, [theme.bgColor]);


  const [lastPreferences, setLastPreferences] = useState<{
    myGender: Gender;
    seekingGender: SeekingGender;
    topic: ChatTopic;
  }>({
    myGender: 'male',
    seekingGender: 'female',
    topic: 'late_night',
  });


  const {
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
    createGroup,
    joinGroup,
    leaveGroup,
    sendGroupMessage,
    sendGroupTyping,
    toggleRevealGroupMedia,
  } = useCoupSocket();

  const handleStartMatching = (
    myGender: Gender,
    seekingGender: SeekingGender,
    topic: ChatTopic
  ) => {
    setLastPreferences({ myGender, seekingGender, topic });
    setActiveTab('chat');
    joinQueue(myGender, seekingGender, topic);
  };

  const handleNavigateTab = (tab: NavigationTab) => {
    setActiveTab(tab);
    if (tab === 'groups') {
      setViewState('groups');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (tab === 'chat') {
      if (viewState !== 'chat' && viewState !== 'matching') {
        setViewState('landing');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      if (viewState === 'groups') {
        setViewState('landing');
      }
      setTimeout(() => {
        const el = document.getElementById(tab);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 50);
    }
  };

  const handleExitCurrent = () => {
    if (viewState === 'chat' || viewState === 'matching') {
      leaveChat();
      setViewState('landing');
    } else if (viewState === 'group_chat') {
      leaveGroup();
      setViewState('groups');
    }
  };

  return (
    <div
      className="min-h-screen text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] selection:bg-pink-500 selection:text-white relative transition-colors duration-500 overflow-x-hidden"
      style={{
        backgroundColor: theme.bgColor,
      }}
    >
      {/* Background Layer: Gradient or Custom Wallpaper */}
      {theme.customImageUrl ? (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <img
            src={theme.customImageUrl}
            alt="Theme Wallpaper"
            className="w-full h-full object-cover transition-opacity duration-700"
            style={{
              filter: `blur(${theme.overlayBlur || 0}px)`,
              transform: 'scale(1.05)',
            }}
          />
          {/* Tint overlay to keep text legible */}
          <div
            className="absolute inset-0 transition-colors duration-500"
            style={{
              backgroundColor: theme.bgColor,
              opacity: theme.overlayOpacity ?? 0.75,
            }}
          />
        </div>
      ) : (
        <div
          className="fixed inset-0 pointer-events-none z-0 transition-all duration-700"
          style={{
            background: theme.bgGradient,
          }}
        />
      )}

      {/* Floating Ambient Glow Orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute -top-32 left-1/4 w-[550px] h-[550px] rounded-full blur-[170px] opacity-30 animate-pulse transition-colors duration-700"
          style={{ backgroundColor: theme.previewColor }}
        />
        <div
          className="absolute top-1/2 -right-32 w-[450px] h-[450px] rounded-full blur-[170px] opacity-25 transition-colors duration-700"
          style={{ backgroundColor: theme.preset === 'crimson_velvet' ? '#f43f5e' : '#8b5cf6' }}
        />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <Navbar
          viewState={viewState}
          activeTab={activeTab}
          onlineCount={onlineCount}
          onNavigateTab={handleNavigateTab}
          onStartMatch={() =>
            handleStartMatching(
              lastPreferences.myGender,
              lastPreferences.seekingGender,
              lastPreferences.topic
            )
          }
          onEndChat={handleExitCurrent}
          currentTheme={theme}
          onOpenTheme={() => setIsThemeModalOpen(true)}
        />

        {/* Mode Switcher Banner (Visible on Landing & Groups Lobby) */}
        {(viewState === 'landing' || viewState === 'groups') && (
          <div className="w-full bg-[#0d071b]/80 backdrop-blur-md border-b border-white/5 py-2.5 px-4">
            <div className="max-w-6xl mx-auto flex items-center justify-center gap-3">
              <div className="inline-flex items-center p-1 rounded-2xl bg-white/[0.04] border border-white/10">
                <button
                  onClick={() => {
                    setActiveTab('chat');
                    setViewState('landing');
                  }}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    viewState === 'landing'
                      ? 'bg-gradient-to-r from-pink-600 to-rose-500 text-white shadow-[0_0_15px_rgba(255,42,133,0.35)]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5 fill-current" />
                  <span>1-on-1 Stranger Radar</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab('groups');
                    setViewState('groups');
                  }}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    viewState === 'groups'
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-[0_0_15px_rgba(139,92,246,0.35)]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Group Lounges</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col">
          {viewState === 'chat' ? (
            <ChatRoom
              messages={messages}
              strangerTyping={strangerTyping}
              partnerLeft={partnerLeft}
              matchInfo={matchInfo}
              onSendMessage={sendMessage}
              onSendTyping={sendTyping}
              onNextStranger={nextStranger}
              onEndChat={handleExitCurrent}
              onToggleRevealMedia={toggleRevealMedia}
              myAvatar={myAvatar}
              myAlias={myAlias}
              onUpdateAvatar={(avatarUrl) => updateProfile(myAlias, myColor, avatarUrl)}
            />
          ) : viewState === 'matching' ? (
            <div className="flex-1 flex items-center justify-center py-12">
              <MatchingRadar
                seekingGender={lastPreferences.seekingGender}
                topic={lastPreferences.topic}
                onCancel={cancelQueue}
                onlineCount={onlineCount}
              />
            </div>
          ) : viewState === 'group_chat' && activeGroup ? (
            <GroupChatRoom
              group={activeGroup}
              members={groupMembers}
              messages={groupMessages}
              typingUser={groupTypingUser}
              onSendMessage={sendGroupMessage}
              onSendTyping={sendGroupTyping}
              onLeaveGroup={handleExitCurrent}
              onToggleRevealMedia={toggleRevealGroupMedia}
              myAlias={myAlias}
              myColor={myColor}
              myAvatar={myAvatar}
              onUpdateAvatar={(avatarUrl) => updateProfile(myAlias, myColor, avatarUrl)}
            />
          ) : viewState === 'groups' ? (
            <GroupLounge
              groups={groups}
              onJoinGroup={joinGroup}
              onCreateGroup={createGroup}
              myAlias={myAlias}
              myColor={myColor}
              myAvatar={myAvatar}
              onUpdateAlias={(alias) => {
                setMyAlias(alias);
                updateProfile(alias, myColor, myAvatar);
              }}
              onUpdateColor={(color) => {
                setMyColor(color);
                updateProfile(myAlias, color, myAvatar);
              }}
              onUpdateAvatar={(avatarUrl) => {
                setMyAvatar(avatarUrl);
                updateProfile(myAlias, myColor, avatarUrl);
              }}
              groupError={groupError}
              onClearError={() => setGroupError(null)}
              onlineCount={onlineCount}
            />
          ) : (
            <div className="flex-1 flex flex-col">
              <LandingHero
                onStartMatching={handleStartMatching}
                onlineCount={onlineCount}
                currentTheme={theme}
                onSelectTheme={handleSelectTheme}
                onOpenThemeModal={() => setIsThemeModalOpen(true)}
              />
              <SeoSections
                onStartChat={() =>
                  handleStartMatching(
                    lastPreferences.myGender,
                    lastPreferences.seekingGender,
                    lastPreferences.topic
                  )
                }
              />
            </div>
          )}
        </main>

        {/* Footer */}
        {viewState !== 'chat' && viewState !== 'group_chat' && (
          <Footer onNavigateTab={handleNavigateTab} />
        )}
      </div>

      {/* Atmosphere & Theme Customizer Modal */}
      {isThemeModalOpen && (
        <ThemeModal
          currentTheme={theme}
          onSelectTheme={handleSelectTheme}
          onClose={() => setIsThemeModalOpen(false)}
        />
      )}
    </div>
  );
}
