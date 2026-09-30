export type MediaType = 'youtube' | 'facebook';

export interface MediaItem {
  id: string;
  type: MediaType;
  title: string;
  description: string;
  url: string;
  thumbnailUrl: string;
  youtubeId?: string;
  date: string;
  tags: string[];
  likes: number;
  views: number;
  pinned?: boolean;
  album?: string;
}

export interface GuestbookEntry {
  id: string;
  author: string;
  avatarIcon: string;
  content: string;
  createdAt: string;
  relation: string; // e.g. '일촌', '스튜디오 동료', '팬클럽', '방문객'
  isSecret?: boolean;
}

export interface UserSession {
  email: string;
  name: string;
  isAdmin: boolean;
}

export type ActiveTab = 'gallery' | 'upload_facebook' | 'upload_youtube' | 'admin';
