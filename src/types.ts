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
  topic?: string;
  isCompanion?: boolean;
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
  isHost?: boolean;
  joinedAt: number;
}

export interface GroupMessage {
  id: string;
  groupId: string;
  senderId: string;
  senderAlias: string;
  senderColor: string;
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
