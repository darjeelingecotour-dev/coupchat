export type Gender = 'male' | 'female' | 'nonbinary';
export type SeekingGender = 'female' | 'male' | 'anyone';

export type ChatTopic =
  | 'late_night'
  | 'flirt'
  | 'deep_talk'
  | 'casual'
  | 'wildcard';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'stranger' | 'system';
  content?: string;
  mediaType?: 'text' | 'image' | 'video' | 'gif';
  mediaUrl?: string;
  caption?: string;
  sensitive?: boolean;
  revealed?: boolean;
  timestamp: string;
}

export type ViewState = 'landing' | 'matching' | 'chat' | 'groups' | 'group_chat';

export type NavigationTab = 'chat' | 'groups' | 'safety' | 'faq';

export interface GifItem {
  id: string;
  title: string;
  url: string;
  category: string;
}

export interface MatchInfo {
  strangerAlias: string;
  partnerGender?: Gender;
  partnerAvatarUrl?: string;
  partnerStatus?: 'online' | 'offline';
  topic?: string;
}

// -------------------------------------------------------------
// Group Chat Types
// -------------------------------------------------------------

export interface LastMessageSnippet {
  content: string;
  senderAlias: string;
  senderColor?: string;
  timestamp: string;
  mediaType?: 'text' | 'image' | 'video' | 'gif';
}

export interface GroupRoom {
  id: string;
  name: string;
  topic: string;
  description: string;
  isPrivate: boolean;
  passcode?: string;
  memberCount: number;
  maxMembers?: number;
  tags: string[];
  createdAt: number;
  lastMessageSnippet?: LastMessageSnippet;
}

export interface GroupMember {
  id: string;
  alias: string;
  color: string;
  avatarUrl: string;
  status: 'online' | 'offline';
  isHost?: boolean;
  joinedAt: number;
}

export interface GroupMessage {
  id: string;
  groupId: string;
  senderId: string;
  senderAlias: string;
  senderColor: string;
  senderAvatarUrl?: string;
  isMe: boolean;
  content?: string;
  mediaType?: 'text' | 'image' | 'video' | 'gif';
  mediaUrl?: string;
  caption?: string;
  sensitive?: boolean;
  revealed?: boolean;
  timestamp: string;
  isSystem?: boolean;
}

export interface AvatarPreset {
  id: string;
  name: string;
  url: string;
}

export const AVATAR_PRESETS: AvatarPreset[] = [
  { id: 'av1', name: 'Cyber Neon', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80' },
  { id: 'av2', name: 'Midnight Rebel', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80' },
  { id: 'av3', name: 'Velvet Rose', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=160&auto=format&fit=crop&q=80' },
  { id: 'av4', name: 'Electric Spark', url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=160&auto=format&fit=crop&q=80' },
  { id: 'av5', name: 'Shadow Ghost', url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=160&auto=format&fit=crop&q=80' },
  { id: 'av6', name: 'Aurora Glow', url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=160&auto=format&fit=crop&q=80' },
  { id: 'av7', name: 'Cosmic Panther', url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=160&auto=format&fit=crop&q=80' },
  { id: 'av8', name: 'Crimson Night', url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=160&auto=format&fit=crop&q=80' },
];

// -------------------------------------------------------------
// Website Theme Types
// -------------------------------------------------------------

export type ThemePresetId = 'crimson_velvet' | 'midnight_noir' | 'sunset_romance' | 'cyber_emerald' | 'custom';

export interface ThemeConfig {
  preset: ThemePresetId;
  name: string;
  subtitle: string;
  bgColor: string;
  bgGradient: string;
  accentGradient: string;
  previewColor: string;
  customImageUrl?: string;
  overlayOpacity?: number; // 0 to 1
  overlayBlur?: number; // px
}

export const THEME_PRESETS: Record<Exclude<ThemePresetId, 'custom'>, Omit<ThemeConfig, 'customImageUrl' | 'overlayOpacity' | 'overlayBlur'>> = {
  crimson_velvet: {
    preset: 'crimson_velvet',
    name: 'Crimson Velvet & Passion',
    subtitle: 'Intimate deep ruby velvet, romantic candlelit amber & sensual dusk vibes',
    bgColor: '#0c0206',
    bgGradient: 'radial-gradient(ellipse at 50% 0%, rgba(185, 28, 68, 0.32) 0%, rgba(12, 2, 6, 0.96) 72%), radial-gradient(ellipse at 85% 55%, rgba(136, 19, 55, 0.25) 0%, transparent 65%)',
    accentGradient: 'from-rose-600 via-pink-600 to-amber-500',
    previewColor: '#be123c',
  },
  midnight_noir: {
    preset: 'midnight_noir',
    name: 'Midnight Noir',
    subtitle: 'Ultra-dark obsidian violet with glowing neon magenta and electric purple',
    bgColor: '#07030e',
    bgGradient: 'radial-gradient(ellipse at 50% 0%, rgba(139, 92, 246, 0.22) 0%, rgba(7, 3, 14, 0.98) 75%)',
    accentGradient: 'from-pink-600 via-rose-500 to-violet-600',
    previewColor: '#9333ea',
  },
  sunset_romance: {
    preset: 'sunset_romance',
    name: 'Sunset Romance',
    subtitle: 'Warm terracotta dusk, glowing rose gold, and deep evening embers',
    bgColor: '#0d0407',
    bgGradient: 'radial-gradient(ellipse at 50% 0%, rgba(225, 29, 72, 0.28) 0%, rgba(13, 4, 7, 0.96) 70%), radial-gradient(ellipse at 15% 45%, rgba(217, 119, 6, 0.2) 0%, transparent 60%)',
    accentGradient: 'from-amber-500 via-rose-500 to-pink-600',
    previewColor: '#f43f5e',
  },
  cyber_emerald: {
    preset: 'cyber_emerald',
    name: 'Emerald Midnight',
    subtitle: 'Deep obsidian jade matrix with mystic emerald accents and soft glowing embers',
    bgColor: '#020b08',
    bgGradient: 'radial-gradient(ellipse at 50% 0%, rgba(16, 185, 129, 0.24) 0%, rgba(2, 11, 8, 0.98) 75%)',
    accentGradient: 'from-emerald-500 via-teal-500 to-cyan-500',
    previewColor: '#10b981',
  },
};

