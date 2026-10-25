import React, { useState } from 'react';
import { useCoupSocket } from './hooks/useCoupSocket';
import { Navbar } from './components/Navbar';
import { LandingHero } from './components/LandingHero';
import { MatchingRadar } from './components/MatchingRadar';
import { ChatRoom } from './components/ChatRoom';
import { GroupLounge } from './components/GroupLounge';
import { GroupChatRoom } from './components/GroupChatRoom';
import { SeoSections } from './components/SeoSections';
import { Footer } from './components/Footer';
import { Gender, SeekingGender, ChatTopic, NavigationTab } from './types';
import { Sparkles, Users, Flame } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('chat');
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
    <div className="min-h-screen bg-[#07030e] text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] selection:bg-pink-500 selection:text-white">
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
      />

      {/* Mode Switcher Banner (Visible on Landing & Groups Lobby) */}
      {(viewState === 'landing' || viewState === 'groups') && (
        <div className="w-full bg-[#0d071b] border-b border-white/5 py-2.5 px-4">
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
          />
        ) : viewState === 'groups' ? (
          <GroupLounge
            groups={groups}
            onJoinGroup={joinGroup}
            onCreateGroup={createGroup}
            myAlias={myAlias}
            myColor={myColor}
            onUpdateAlias={setMyAlias}
            onUpdateColor={setMyColor}
            groupError={groupError}
            onClearError={() => setGroupError(null)}
            onlineCount={onlineCount}
          />
        ) : (
          <div className="flex-1 flex flex-col">
            <LandingHero
              onStartMatching={handleStartMatching}
              onlineCount={onlineCount}
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
  );
}
