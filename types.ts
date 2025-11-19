
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
}

export enum UserRole {
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
  name: string;
  email?: string;
  savedSermonIds: string[];
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
  created_at?: string;
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