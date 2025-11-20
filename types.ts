

import { User as SupabaseUser } from '@supabase/supabase-js';

export enum Page {
  HOME = 'HOME',
  SERMONS = 'SERMONS',
  EVENTS = 'EVENTS',
  MEETINGS = 'MEETINGS',
  PRAYER = 'PRAYER',
  ADMIN = 'ADMIN',
  SEARCH = 'SEARCH',
  MAP = 'MAP',
  GALLERY = 'GALLERY',
  PROFILE = 'PROFILE',
  RESOURCES = 'RESOURCES',
  TITHE = 'TITHE',
  GROUPS = 'GROUPS',
  COMMUNITY = 'COMMUNITY',
  VIEW_PROFILE = 'VIEW_PROFILE',
  MESSAGES = 'MESSAGES',
}

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  CONTENT_MANAGER = 'CONTENT_MANAGER',
  MODERATOR = 'MODERATOR',
  GUEST = 'GUEST'
}

// Extend Supabase User
export interface AuthUser extends SupabaseUser {
  // Add any custom properties if needed, mostly likely stored in a separate 'profiles' table
}

export interface User {
  id: string;
  name: string;
  email?: string;
  savedSermonIds: string[];
  avatar_url?: string;
  bio?: string;
}

export interface Sermon {
  id: string; // UUID
  title: string;
  speaker: string;
  series?: string;
  date: string;
  description: string;
  imageUrl: string;
  videoUrl?: string;
  audioUrl?: string;
  created_at?: string;
}

export interface SermonNote {
  id: string;
  sermon_id: string;
  user_id: string;
  content: string;
  updated_at: string;
}

export interface Event {
  id: string; // UUID
  title: string;
  date: string;
  location: string;
  description: string;
  created_at?: string;
}

export interface Meeting {
  id: string; // UUID
  title: string;
  host: string;
  startTime: string;
  description: string;
  participants: number;
  created_at?: string;
}

export interface LiveParticipant {
  id: string;
  name: string;
  isHost: boolean;
  muted: boolean;
}

export interface PrayerRequest {
  id: string; // UUID
  name: string;
  content: string;
  status: 'PENDING' | 'APPROVED';
  aiResponse?: string;
  date: string;
  prayerCount: number;
  created_at?: string;
}

export interface SearchResult {
  id: string;
  type: 'SERMON' | 'EVENT' | 'MEETING';
  title: string;
  description: string;
  score: number;
}

export interface ChatMessage {
  id: string;
  user: string;
  text: string;
  reactions: Record<string, string[]>;
}

export interface SlideshowImage {
  id: string; // UUID
  url: string;
  caption?: string;
  created_at?: string;
}

export interface ChurchBranch {
  id: string; // UUID
  name: string;
  leader: string;
  address: string;
  lat: number;
  lng: number;
  radius: number;
  created_at?: string;
}

export interface Photo {
  id: string; // UUID
  url: string;
  caption?: string;
  created_at?: string;
}

export interface PhotoAlbum {
  id: string; // UUID
  title: string;
  photos: Photo[];
  created_at?: string;
}

export interface Announcement {
  id: string; // UUID
  message: string;
  type: 'INFO' | 'ALERT' | 'SUCCESS';
  isActive: boolean;
  created_at?: string;
}

export interface Resource {
  id: string; // UUID
  title: string;
  description: string;
  category: string;
  fileUrl: string;
  created_at?: string;
}

export interface ConnectSubmission {
  id: string;
  name: string;
  email: string;
  phone?: string;
  type: string; // 'First Time', 'Serving', etc.
  message: string;
  created_at?: string;
}

export interface GivingRecord {
    id: string;
    date: string;
    amount: number;
    type: 'Tithe' | 'Offering' | 'Special Gift';
    method: 'Mobile Money' | 'Bank' | 'In-Person';
}

export interface Notification {
  id: string;
  user_id: string;
  message: string;
  link_to_page?: Page;
  link_to_id?: string;
  is_read: boolean;
  created_at: string;
}

export interface SmallGroup {
  id: string; // UUID
  name: string;
  leader: string;
  topic: string;
  description: string;
  schedule: string;
  location: string;
  imageUrl: string;
  created_at?: string;
}

export interface Like {
  id: string;
  user_id: string;
  post_id: string;
  created_at: string;
}

export interface Comment {
  id: string;
  user_id: string;
  post_id: string;
  content: string;
  created_at: string;
  profiles: { name: string, avatar_url?: string }; // Author info
}

export interface Post {
  id: string; // UUID
  user_id: string;
  content: string;
  image_url?: string;
  created_at: string;
  profiles: { name: string, avatar_url?: string }; // Author info from join
  likes: Like[];
  comments: Comment[];
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  profiles: { name: string, avatar_url?: string };
}

export interface ConversationParticipant {
  user_id: string;
  profiles: { name: string; avatar_url?: string };
}

export interface Conversation {
  id: string;
  created_at: string;
  conversation_participants: ConversationParticipant[];
  messages: Message[]; // Often just the last message
}