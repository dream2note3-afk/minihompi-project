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

export type TravelCategory = 'travel' | 'food' | 'cafe' | 'photoslot';

export interface TravelSpot {
  id: string;
  name: string;
  category: TravelCategory;
  region: string;
  linkUrl: string;
  linkName?: string;
  imageUrl: string;
  rating: number;
  recommendedMenuOrTip: string;
  description: string;
  tags: string[];
  pinned?: boolean;
  dateAdded: string;
}

export type CdStatus = 'reviewing' | 'planned' | 'purchased' | 'wishlist';
export type CdCategory = 'album' | 'online_store' | 'offline_shop' | 'rare_cd';

export interface CdReviewItem {
  id: string;
  title: string;
  artistOrSeller: string;
  category: CdCategory;
  status: CdStatus;
  price?: string;
  storeUrl: string;
  storeName: string;
  coverImageUrl: string;
  releaseYear?: string;
  reviewComment: string;
  keyTracks?: string[];
  rating?: number;
  pinned?: boolean;
  dateAdded: string;
}

export type ActiveTab = 'gallery' | 'upload_facebook' | 'upload_youtube' | 'travel_food' | 'cd_review' | 'edit_profile' | 'admin';
