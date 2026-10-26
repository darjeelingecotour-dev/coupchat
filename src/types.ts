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
