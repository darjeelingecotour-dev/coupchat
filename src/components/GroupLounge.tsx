import React, { useState, useMemo } from 'react';
import {
  Users,
  Plus,
  Lock,
  Globe,
  Search,
  Sparkles,
  Flame,
  ArrowRight,
  TrendingUp,
  KeyRound,
  X,
  Radio,
  SlidersHorizontal,
  Clock,
  Compass,
  MessageSquare,
  MessageCircle,
} from 'lucide-react';
import { GroupRoom } from '../types';

interface GroupLoungeProps {
  groups: GroupRoom[];
  onJoinGroup: (groupId: string, options?: { passcode?: string; alias?: string; color?: string }) => void;
  onCreateGroup: (options: {
    name: string;
    topic: string;
    description?: string;
    isPrivate?: boolean;
    passcode?: string;
    alias?: string;
    color?: string;
    tags?: string[];
  }) => void;
  myAlias: string;
  myColor: string;
  onUpdateAlias: (alias: string) => void;
  onUpdateColor: (color: string) => void;
  groupError: string | null;
  onClearError: () => void;
  onlineCount: number;
}

const CATEGORIES = [
  { key: 'All', label: 'All', icon: '✨' },
  { key: 'General', label: 'General', icon: '🍸' },
  { key: 'Late Night', label: 'Late Night', icon: '🌙' },
  { key: 'Chill', label: 'Chill', icon: '🎶' },
  { key: 'Gaming', label: 'Gaming', icon: '🎲' },
  { key: 'Flirting & Sparks', label: 'Flirting & Sparks', icon: '💋' },
  { key: 'Deep Talks', label: 'Deep Talks', icon: '🌌' },
];

function matchesCategory(roomTopic: string, selectedCat: string): boolean {
  if (selectedCat === 'All') return true;
  const t = (roomTopic || '').toLowerCase();
  const s = selectedCat.toLowerCase();

  if (s === 'general') {
    return t.includes('general') || t.includes('casual') || t.includes('bar') || t.includes('plaza');
  }
  if (s === 'late night') {
    return t.includes('late') || t.includes('night') || t.includes('secret') || t.includes('confession');
  }
  if (s === 'chill') {
    return t.includes('chill') || t.includes('lo-fi') || t.includes('music') || t.includes('relax');
  }
  if (s === 'gaming') {
    return t.includes('gaming') || t.includes('game') || t.includes('dare') || t.includes('party') || t.includes('squad');
  }
  if (s === 'flirting & sparks') {
    return t.includes('flirt') || t.includes('spark') || t.includes('romance');
  }
  if (s === 'deep talks') {
    return t.includes('deep') || t.includes('philosoph') || t.includes('star');
  }
  return t === s;
}

const PRESET_COLORS = [
  { key: '#ec4899', label: 'Neon Pink' },
  { key: '#f43f5e', label: 'Rose Red' },
  { key: '#a855f7', label: 'Purple' },
  { key: '#6366f1', label: 'Indigo' },
  { key: '#06b6d4', label: 'Cyan' },
  { key: '#10b981', label: 'Emerald' },
  { key: '#f59e0b', label: 'Amber' },
];

export const GroupLounge: React.FC<GroupLoungeProps> = ({
  groups,
  onJoinGroup,
  onCreateGroup,
  myAlias,
  myColor,
  onUpdateAlias,
  onUpdateColor,
  groupError,
  onClearError,
  onlineCount,
}) => {
  const [activeViewTab, setActiveViewTab] = useState<'trending' | 'all' | 'newest' | 'private'>('trending');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'members' | 'newest' | 'name'>('members');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [passcodeModalGroup, setPasscodeModalGroup] = useState<GroupRoom | null>(null);
  const [enteredPasscode, setEnteredPasscode] = useState('');
  const [quickCodeInput, setQuickCodeInput] = useState('');

  // Create group form state
  const [newName, setNewName] = useState('');
  const [newTopic, setNewTopic] = useState('General');
  const [newDesc, setNewDesc] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [newPasscode, setNewPasscode] = useState('');

  // Category counts calculation
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: groups.length };
    for (const cat of CATEGORIES) {
      if (cat.key !== 'All') {
        counts[cat.key] = groups.filter((g) => matchesCategory(g.topic, cat.key)).length;
      }
    }
    return counts;
  }, [groups]);

  // Top 3 Trending Spotlight Rooms
  const trendingSpotlight = useMemo(() => {
    return [...groups].sort((a, b) => b.memberCount - a.memberCount).slice(0, 3);
  }, [groups]);

  // Filtered & Sorted Lounges
  const filteredAndSortedGroups = useMemo(() => {
    let result = [...groups];

    // Filter by View Tab
    if (activeViewTab === 'private') {
      result = result.filter((g) => g.isPrivate);
    } else if (activeViewTab === 'trending') {
      // Trending view sorts by memberCount
    } else if (activeViewTab === 'newest') {
      // Newest view sorts by createdAt
    }

    // Filter by Category using matchesCategory
    if (selectedCategory !== 'All') {
      result = result.filter((g) => matchesCategory(g.topic, selectedCategory));
    }

    // Filter by Search Query (specifically check group names and metadata)
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      result = result.filter(
        (g) =>
          g.name.toLowerCase().includes(q) ||
          g.topic.toLowerCase().includes(q) ||
          g.description.toLowerCase().includes(q) ||
          g.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Apply Sorting
    if (activeViewTab === 'trending' || sortBy === 'members') {
      result.sort((a, b) => b.memberCount - a.memberCount);
    } else if (activeViewTab === 'newest' || sortBy === 'newest') {
      result.sort((a, b) => b.createdAt - a.createdAt);
    } else if (sortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [groups, activeViewTab, selectedCategory, searchTerm, sortBy]);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    onCreateGroup({
      name: newName.trim(),
      topic: newTopic,
      description: newDesc.trim() || undefined,
      isPrivate,
      passcode: isPrivate && newPasscode.trim() ? newPasscode.trim() : undefined,
      alias: myAlias,
      color: myColor,
      tags: [newTopic, isPrivate ? 'Private' : 'Public'],
    });

    setIsCreateModalOpen(false);
    setNewName('');
    setNewDesc('');
    setIsPrivate(false);
    setNewPasscode('');
  };

  const handleJoinClick = (group: GroupRoom) => {
    if (group.isPrivate && group.passcode) {
      setPasscodeModalGroup(group);
      setEnteredPasscode('');
    } else {
      onJoinGroup(group.id, { alias: myAlias, color: myColor });
    }
  };

  const handlePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcodeModalGroup) return;
    onJoinGroup(passcodeModalGroup.id, {
      passcode: enteredPasscode.trim(),
      alias: myAlias,
      color: myColor,
    });
    setPasscodeModalGroup(null);
  };

  const handleQuickCodeJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const code = quickCodeInput.trim();
    if (!code) return;
    onJoinGroup(code, { alias: myAlias, color: myColor });
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Hero Marquee & Persona Banner */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#170a2f] via-[#100624] to-[#1f0b35] border border-white/10 shadow-[0_0_40px_rgba(255,42,133,0.15)] overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-pink-600/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-violet-600/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-300 text-xs font-semibold">
              <Radio className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
              <span>Multi-User Ephemeral Lounges · {groups.length} Active Public Circles</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Trending &amp; Public{' '}
              <span className="bg-gradient-to-r from-pink-500 via-rose-400 to-violet-400 bg-clip-text text-transparent">
                Late-Night Lounges
              </span>
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Explore buzzing anonymous circles or start your own late-night room in seconds. Filter by your current vibe, share tap-to-reveal photos, and chat with night owls worldwide.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-5 py-3.5 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-500 hover:brightness-110 text-white font-extrabold text-sm shadow-[0_0_20px_rgba(255,42,133,0.4)] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>CREATE A GROUP</span>
            </button>
          </div>
        </div>

        {/* Persona quick switch strip */}
        <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Your Anonymous Persona:</span>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.05] border border-white/10">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: myColor }}
              />
              <input
                type="text"
                value={myAlias}
                onChange={(e) => onUpdateAlias(e.target.value)}
                maxLength={24}
                className="bg-transparent text-white font-bold text-xs focus:outline-none w-28 sm:w-36"
                title="Edit your alias"
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Color:</span>
            <div className="flex items-center gap-1.5">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c.key}
                  onClick={() => onUpdateColor(c.key)}
                  className={`w-5 h-5 rounded-full transition-transform cursor-pointer ${
                    myColor === c.key ? 'scale-125 ring-2 ring-white shadow-sm' : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c.key }}
                  title={c.label}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Error alert if any */}
      {groupError && (
        <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-500/40 text-xs text-rose-200 flex items-center justify-between animate-in fade-in">
          <span>{groupError}</span>
          <button
            onClick={onClearError}
            className="p-1 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Quick Invite Code Join Strip */}
      <div className="p-4 rounded-2xl bg-[#0c051a] border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <KeyRound className="w-4 h-4 text-pink-400 shrink-0" />
          <span>Have an invite code or private link?</span>
          <span className="text-[11px] text-slate-500 hidden md:inline">
            (e.g., enter room code to jump straight into a friend&apos;s circle)
          </span>
        </div>
        <form onSubmit={handleQuickCodeJoin} className="w-full sm:w-auto flex items-center gap-2">
          <input
            type="text"
            value={quickCodeInput}
            onChange={(e) => setQuickCodeInput(e.target.value)}
            placeholder="Paste code: room_..."
            className="bg-white/[0.05] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 flex-1 sm:w-44"
          />
          <button
            type="submit"
            disabled={!quickCodeInput.trim()}
            className="px-4 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-500 disabled:opacity-50 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            Enter Room
          </button>
        </form>
      </div>

      {/* SECTION 1: TOP TRENDING SPOTLIGHT (Top 3 Hottest Rooms) */}
      {trendingSpotlight.length > 0 && !searchTerm && selectedCategory === 'All' && activeViewTab === 'trending' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-pink-500/20 text-pink-400">
                <Flame className="w-4 h-4 fill-current" />
              </span>
              <h2 className="text-base font-extrabold text-white tracking-wide">
                Top Trending Lounges Right Now
              </h2>
            </div>
            <span className="text-xs text-pink-300 font-semibold">
              Live Real-Time Activity
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {trendingSpotlight.map((room, idx) => (
              <div
                key={`spotlight_${room.id}`}
                className="relative rounded-3xl p-5 bg-gradient-to-b from-[#180e33] to-[#0e071e] border border-pink-500/30 hover:border-pink-500/60 shadow-[0_4px_25px_rgba(255,42,133,0.15)] flex flex-col justify-between transition-all group cursor-pointer"
                onClick={() => handleJoinClick(room)}
              >
                {/* Ranking Tag & Active Member Count */}
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-0.5 rounded-full bg-pink-500 text-white text-[10px] font-black uppercase tracking-wider shadow-[0_0_10px_rgba(255,42,133,0.5)]">
                    #{idx + 1} Hottest Lounge
                  </span>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{room.memberCount} Active Members</span>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div>
                    <h3 className="text-base font-extrabold text-white group-hover:text-pink-300 transition-colors line-clamp-1">
                      {room.name}
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-2 mt-1">
                      {room.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-pink-300/90 font-medium">
                    <span>{room.topic}</span>
                    <span aria-hidden="true">·</span>
                    <span>Max {room.maxMembers || 50} peers</span>
                  </div>

                  {/* Real-time Quick Message Snippet */}
                  {room.lastMessageSnippet ? (
                    <div className="p-3 rounded-2xl bg-black/40 border border-white/10 space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="flex items-center gap-1.5 text-slate-300 font-semibold truncate max-w-[170px]">
                          <MessageSquare className="w-3 h-3 text-pink-400 shrink-0" />
                          <span className="text-slate-400">Latest Whisper:</span>
                          <span style={{ color: room.lastMessageSnippet.senderColor || '#ec4899' }}>
                            {room.lastMessageSnippet.senderAlias}
                          </span>
                        </span>
                        <span className="text-[10px] text-slate-500 shrink-0 tabular-nums">
                          {room.lastMessageSnippet.timestamp}
                        </span>
                      </div>
                      <p className="text-xs text-pink-100 italic line-clamp-2">
                        &ldquo;{room.lastMessageSnippet.content}&rdquo;
                      </p>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-2xl bg-black/30 border border-white/5 flex items-center gap-1.5 text-[11px] text-slate-400 italic">
                      <Sparkles className="w-3 h-3 text-pink-400/70" />
                      <span>No whispers yet. Jump in and say hello!</span>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleJoinClick(room);
                  }}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-500 hover:brightness-110 text-white font-extrabold text-xs shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>JOIN SPOTLIGHT LOUNGE</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 2: SEARCH INPUT FOR GROUP NAMES & CATEGORY FILTER BUTTONS */}
      <div className="space-y-4 pt-2">
        {/* Dedicated Search Input for Group Names */}
        <div className="p-4 rounded-3xl bg-[#0f0722]/90 border border-white/10 shadow-xl backdrop-blur-md space-y-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="flex-1 relative">
              <label htmlFor="group-name-search" className="sr-only">
                Search Group by Name
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-pink-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  id="group-name-search"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search group by name (e.g. Velvet, Midnight, Chill, Gaming, Plaza)..."
                  className="w-full bg-[#160a2c] border border-white/15 focus:border-pink-500 rounded-2xl py-2.5 pl-10 pr-10 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-pink-500 transition-all shadow-inner"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-3 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    title="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Quick Sort Dropdown & Tab Selection */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-white/[0.03] px-3 py-2 rounded-xl border border-white/5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent text-xs font-semibold text-pink-300 focus:outline-none cursor-pointer"
                  title="Sort groups"
                >
                  <option value="members" className="bg-[#140a2a] text-white">🔥 Most Active</option>
                  <option value="newest" className="bg-[#140a2a] text-white">✨ Newest</option>
                  <option value="name" className="bg-[#140a2a] text-white">🔤 Name (A-Z)</option>
                </select>
              </div>

              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(255,42,133,0.3)] hover:brightness-110 cursor-pointer whitespace-nowrap transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Group</span>
              </button>
            </div>
          </div>

          {/* Category Filter Buttons */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold px-1">
              <span>Filter by Category:</span>
              <span className="text-[10px] text-slate-400">Click a category to narrow down lounges</span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {CATEGORIES.map((cat) => {
                const count = categoryCounts[cat.key] || 0;
                const isSelected = selectedCategory === cat.key;
                return (
                  <button
                    key={cat.key}
                    onClick={() => setSelectedCategory(cat.key)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-r from-pink-600 to-rose-500 text-white border border-pink-400/50 shadow-[0_0_15px_rgba(255,42,133,0.4)]'
                        : 'bg-white/[0.04] text-slate-300 border border-white/10 hover:border-pink-500/30 hover:text-white hover:bg-white/[0.08]'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                        isSelected ? 'bg-black/40 text-white' : 'bg-white/10 text-slate-400'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Room Type Tabs (Trending / All Public / Newest / Private) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div className="flex items-center gap-1 p-1 bg-white/[0.03] border border-white/5 rounded-2xl overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveViewTab('trending')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeViewTab === 'trending'
                  ? 'bg-pink-600 text-white shadow-[0_0_12px_rgba(255,42,133,0.35)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Trending</span>
            </button>
            <button
              onClick={() => setActiveViewTab('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeViewTab === 'all'
                  ? 'bg-pink-600 text-white shadow-[0_0_12px_rgba(255,42,133,0.35)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>All Public</span>
            </button>
            <button
              onClick={() => setActiveViewTab('newest')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeViewTab === 'newest'
                  ? 'bg-pink-600 text-white shadow-[0_0_12px_rgba(255,42,133,0.35)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Newest</span>
            </button>
            <button
              onClick={() => setActiveViewTab('private')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeViewTab === 'private'
                  ? 'bg-violet-600 text-white shadow-[0_0_12px_rgba(139,92,246,0.35)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Passcode Protected</span>
            </button>
          </div>

          {/* Active Filter Indicators */}
          {(searchTerm.trim() || selectedCategory !== 'All') && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] text-slate-400">Active filters:</span>
              {selectedCategory !== 'All' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-pink-500/15 border border-pink-500/30 text-pink-300">
                  Category: {selectedCategory}
                  <button
                    onClick={() => setSelectedCategory('All')}
                    className="hover:text-white cursor-pointer ml-0.5"
                    title="Remove category filter"
                  >
                    ×
                  </button>
                </span>
              )}
              {searchTerm.trim() && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-violet-500/15 border border-violet-500/30 text-violet-300">
                  Name: &quot;{searchTerm.trim()}&quot;
                  <button
                    onClick={() => setSearchTerm('')}
                    className="hover:text-white cursor-pointer ml-0.5"
                    title="Clear search filter"
                  >
                    ×
                  </button>
                </span>
              )}
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('All');
                }}
                className="text-[11px] text-slate-400 hover:text-pink-300 underline cursor-pointer"
              >
                Reset All
              </button>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 3: GROUP ROOMS DIRECTORY GRID */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-slate-400">
            Showing <strong className="text-white">{filteredAndSortedGroups.length}</strong>{' '}
            {activeViewTab === 'private' ? 'private' : 'public'} group lounges
            {selectedCategory !== 'All' && <span> in {selectedCategory}</span>}
          </p>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="text-xs text-pink-400 hover:text-pink-300 font-bold flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Spawn New Lounge</span>
          </button>
        </div>

        {filteredAndSortedGroups.length === 0 ? (
          <div className="py-20 text-center rounded-3xl border border-white/5 bg-[#0e071f]/50 p-6 space-y-3">
            <Users className="w-10 h-10 text-pink-400 mx-auto opacity-70" />
            <h3 className="text-base font-bold text-white">No active lounges match your filters</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Be the spark! Create the first room in this category and invite night owls to join.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              {(searchTerm || selectedCategory !== 'All') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('All');
                    setActiveViewTab('trending');
                  }}
                  className="px-4 py-2 border border-white/10 text-slate-300 rounded-xl text-xs font-semibold hover:text-white cursor-pointer"
                >
                  Clear Filters
                </button>
              )}
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-5 py-2.5 bg-gradient-to-r from-pink-600 to-rose-500 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer hover:brightness-110"
              >
                Create Lounge Now
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAndSortedGroups.map((group) => {
              const occupancyPct = Math.min(100, Math.round((group.memberCount / (group.maxMembers || 50)) * 100));

              return (
                <div
                  key={group.id}
                  className="p-5 rounded-3xl bg-[#0f0722]/85 border border-white/10 hover:border-pink-500/40 transition-all flex flex-col justify-between group shadow-lg backdrop-blur-md relative overflow-hidden"
                >
                  {/* Subtle top indicator bar */}
                  <div
                    className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 via-rose-500 to-violet-500 opacity-60 group-hover:opacity-100 transition-opacity"
                  />

                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-base font-extrabold text-white group-hover:text-pink-300 transition-colors line-clamp-1">
                        {group.name}
                      </h3>
                      {group.isPrivate ? (
                        <span
                          className="p-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 shrink-0"
                          title="Private Lounge (Passcode Required)"
                        >
                          <Lock className="w-3.5 h-3.5" />
                        </span>
                      ) : (
                        <span
                          className="p-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shrink-0"
                          title="Public Lounge (Open to Everyone)"
                        >
                          <Globe className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                      {group.description || 'Late-night anonymous conversation circle.'}
                    </p>

                    {/* Topic & Tags */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      <button
                        onClick={() => setSelectedCategory(group.topic)}
                        className="text-[10px] px-2.5 py-0.5 rounded-lg bg-pink-500/15 border border-pink-500/30 text-pink-300 font-semibold hover:bg-pink-500 hover:text-white transition-colors cursor-pointer"
                      >
                        {group.topic}
                      </button>
                      {group.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] px-2 py-0.5 rounded-lg bg-white/[0.04] text-slate-400"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* Real-time Quick Message Snippet */}
                    {group.lastMessageSnippet ? (
                      <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1 group-hover:border-pink-500/20 transition-colors">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="flex items-center gap-1.5 text-slate-300 font-semibold truncate max-w-[170px]">
                            <MessageSquare className="w-3 h-3 text-pink-400 shrink-0" />
                            <span className="text-slate-400">Latest Whisper:</span>
                            <span style={{ color: group.lastMessageSnippet.senderColor || '#ec4899' }}>
                              {group.lastMessageSnippet.senderAlias}
                            </span>
                          </span>
                          <span className="text-[10px] text-slate-500 shrink-0 tabular-nums">
                            {group.lastMessageSnippet.timestamp}
                          </span>
                        </div>
                        <p className="text-xs text-slate-200 italic line-clamp-2">
                          &ldquo;{group.lastMessageSnippet.content}&rdquo;
                        </p>
                      </div>
                    ) : (
                      <div className="p-2.5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-1.5 text-[11px] text-slate-400 italic">
                        <Sparkles className="w-3 h-3 text-pink-400/60" />
                        <span>No whispers yet. Be the first to start the chat!</span>
                      </div>
                    )}

                    {/* Real-Time Active Member Count & Occupancy Meter */}
                    <div className="pt-1 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="flex items-center gap-1.5 font-semibold text-emerald-400">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span>{group.memberCount} Active Members</span>
                        </span>
                        <span>{group.memberCount}/{group.maxMembers || 50} ({occupancyPct}%)</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-pink-500 to-rose-500 transition-all"
                          style={{ width: `${Math.max(6, occupancyPct)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom CTA */}
                  <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 font-mono">
                      ID: {group.id}
                    </span>

                    <button
                      onClick={() => handleJoinClick(group)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-600/30 to-rose-600/30 hover:from-pink-600 hover:to-rose-600 border border-pink-500/40 hover:border-pink-500 text-pink-200 hover:text-white font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                    >
                      <span>ENTER LOUNGE</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CREATE GROUP MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-md bg-[#110826] border border-white/10 rounded-3xl p-6 shadow-[0_0_50px_rgba(255,42,133,0.35)] overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-pink-500/20 text-pink-400">
                  <Flame className="w-4 h-4 fill-current" />
                </span>
                <h3 className="text-sm font-bold text-white">
                  Create Anonymous Group Lounge
                </h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1">
                  Group Lounge Name *
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Midnight Whispers 🍸"
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1">
                  Vibe &amp; Category
                </label>
                <select
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  className="w-full bg-[#180e2f] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
                >
                  <option value="General">General 🍸</option>
                  <option value="Late Night">Late Night 🌙</option>
                  <option value="Chill">Chill 🎶</option>
                  <option value="Gaming">Gaming 🎲</option>
                  <option value="Flirting & Sparks">Flirting &amp; Sparks 💋</option>
                  <option value="Deep Talks">Deep Talks 🌌</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1">
                  Description / Atmosphere (Optional)
                </label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="What is the mood of this room?"
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
                />
              </div>

              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-pink-400" />
                    <div>
                      <span className="text-xs font-bold text-white block">Private Lounge</span>
                      <span className="text-[10px] text-slate-400">Requires passcode to enter</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPrivate(!isPrivate)}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                      isPrivate ? 'bg-pink-600' : 'bg-slate-700'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                        isPrivate ? 'left-6' : 'left-1'
                      }`}
                    />
                  </button>
                </div>

                {isPrivate && (
                  <div className="pt-2">
                    <label className="text-[11px] text-slate-400 block mb-1">
                      Set Lounge Passcode:
                    </label>
                    <input
                      type="text"
                      value={newPasscode}
                      onChange={(e) => setNewPasscode(e.target.value)}
                      placeholder="e.g. secret99"
                      className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
                    />
                  </div>
                )}
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newName.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-500 text-white font-bold text-xs shadow-[0_0_15px_rgba(255,42,133,0.4)] hover:brightness-110 cursor-pointer disabled:opacity-50"
                >
                  Launch Ephemeral Lounge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PASSCODE ENTRY MODAL */}
      {passcodeModalGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-sm bg-[#110826] border border-white/10 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <Lock className="w-4 h-4 text-pink-400" />
              <span>Enter Lounge Passcode</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              &ldquo;{passcodeModalGroup.name}&rdquo; is private. Please provide the room key to join.
            </p>
            <form onSubmit={handlePasscodeSubmit} className="space-y-4">
              <input
                type="password"
                required
                autoFocus
                value={enteredPasscode}
                onChange={(e) => setEnteredPasscode(e.target.value)}
                placeholder="Passcode..."
                className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPasscodeModalGroup(null)}
                  className="flex-1 py-2 rounded-xl border border-white/10 text-xs text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-pink-600 text-white font-bold text-xs shadow-md"
                >
                  Unlock &amp; Enter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
