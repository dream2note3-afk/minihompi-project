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

export interface ProfileConfig {
  iconTitle: string; // e.g. '권용우의 아이콘'
  avatarType: 'preset_director' | 'preset_camera' | 'preset_cinema' | 'preset_atelier' | 'custom_url' | 'uploaded_file';
  customImageUrl?: string;
  uploadedFileDataUrl?: string; // base64 data url from user's local file
  uploadedFileName?: string;
  statusDotColor: string; // e.g. '#e63946'
  statusDotTitle: string; // e.g. '현재 활동 중 (ON)'
  welcomeMessage: string; // e.g. '“권용우의 스튜디오 방문을 환영합니다!“'
  subMessage: string;
  roleBadgeText: string; // e.g. 'DIRECTOR'
}

export type ActiveTab = 'gallery' | 'upload_facebook' | 'upload_youtube' | 'edit_profile' | 'admin';
