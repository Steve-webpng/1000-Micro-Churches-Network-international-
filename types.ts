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

export interface User {
  name: string;
  savedSermonIds: string[];
}

export interface Sermon {
  id: string;
  title: string;
  speaker: string;
  series?: string;
  date: string;
  description: string;
  imageUrl: string;
  videoUrl?: string;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
}

export interface Meeting {
  id: string;
  title: string;
  host: string;
  startTime: string;
  description: string;
  participants: number;
}

export interface LiveParticipant {
  id: string;
  name: string;
  isHost: boolean;
  muted: boolean;
}

export interface PrayerRequest {
  id: string;
  name: string;
  content: string;
  status: 'PENDING' | 'APPROVED';
  aiResponse?: string;
  date: string;
  prayerCount: number;
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
  id: string;
  url: string;
  caption?: string;
}

export interface ChurchBranch {
  id: string;
  name: string;
  leader: string;
  address: string;
  lat: number;
  lng: number;
  radius: number;
}

export interface Photo {
  id: string;
  url: string;
  caption?: string;
}

export interface PhotoAlbum {
  id: string;
  title: string;
  photos: Photo[];
}
