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

export interface RetroSticker {
  id: string;
  name: string;
  category: 'cyworld' | 'stamp' | 'feeling' | 'y2k' | 'studio' | 'cheer';
  label: string;
  subText?: string;
  emoji: string;
  bgGradient: string;
  borderColor: string;
  textColor: string;
  stampShape?: 'round' | 'pill' | 'ticket' | 'ribbon' | 'badge';
  rotation?: string;
  tags?: string[];
  description?: string;
  basePopularity?: number;
}

export interface GuestbookEntry {
  id: string;
  author: string;
  avatarIcon: string;
  content: string;
  createdAt: string;
  relation: string; // e.g. '일촌', '스튜디오 동료', '팬클럽', '방문객'
  emotion?: string; // e.g. '🍀 행복', '🎵 힐링', '🐿️ 도토리'
  isSecret?: boolean;
  sticker?: RetroSticker;
}

export interface UserSession {
  email: string;
  name: string;
  isAdmin: boolean;
}

export type ThemePaletteId = 'classic_sky' | 'retro_orange' | 'vintage_green' | 'nostalgia_lavender';

export interface ThemePalette {
  id: ThemePaletteId;
  name: string;
  desc: string;
  bgHex: string;
  borderHex: string;
  accentHex: string;
  badgeBg: string;
}

export interface IlchonFriend {
  id: string;
  name: string;
  relation: string; // e.g. '시네마틱 동지', '필름스냅 메이트'
  avatarIcon: string; // e.g. '🎬', '📷', '☕️', '🎧'
  statusMessage: string; // e.g. '오늘도 노을 출사 촬영 컷 편집 중...'
  updatedAt?: string; // e.g. '방금 전', '10분 전'
  isOnline?: boolean;
  minihompyTitle?: string;
}

export interface IlchonNote {
  id: string;
  friendId: string;
  sender: 'me' | 'friend';
  senderName: string;
  text: string;
  timestamp: string; // e.g. "14:25"
  isMine: boolean;
  avatarIcon?: string;
}

export interface ProfileConfig {
  iconTitle: string; // e.g. '권용우의 아이콘'
  avatarType: 'preset_director' | 'preset_camera' | 'preset_cinema' | 'preset_atelier' | 'custom_url' | 'uploaded_file';
  customImageUrl?: string;
  uploadedFileDataUrl?: string; // base64 data url from user's local file
  uploadedFileName?: string;
  statusDotColor: string; // e.g. '#e63946'
  statusDotTitle: string; // e.g. '현재 활동 중 (ON)'
  welcomeMessage: string; // e.g. '“권용우의 행복한 인생 방문을 환영합니다!“'
  subMessage: string;
  roleBadgeText: string; // e.g. 'DIRECTOR'
  themePalette?: ThemePaletteId; // e.g. 'classic_sky'
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
  likes?: number;
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
  likes?: number;
}

export interface MyCdAlbum {
  id: string;
  songTitle: string;        // 노래 (대표곡 제목) e.g. "Power In The Blood"
  artist: string;           // 아티스트 e.g. "Amy Grant"
  albumTitle: string;       // 앨범 e.g. "Be Still And Know... Hymns & Faith"
  albumArtist?: string;     // 앨범 아티스트 e.g. "Amy Grant"
  composer?: string;        // 작곡가
  showComposer?: boolean;   // 모든 보기에서 작곡가 표시
  grouping?: string;        // 그룹 짓기
  genre: string;            // 장르 e.g. "Religious", "CCM/Gospel", "Pop", "Classical", "Rock", "Jazz", "Folk", "Ballad", "OST"
  releaseYear: string;      // 연도 e.g. "2015"
  trackNumber?: number;     // 트랙 번호 e.g. 1
  totalTracks?: number;     // 전체 트랙 수 e.g. 15
  discNumber?: number;      // 디스크 번호 e.g. 1
  totalDiscs?: number;      // 전체 디스크 수 e.g. 1
  isCompilation?: boolean;  // 컴필레이션 앨범 여부
  rating: number;           // 선호도 별점 (1-5)
  isFavorite?: boolean;     // 즐겨찾기/하트
  bpm?: number;             // bpm
  playCount: number;        // 재생 횟수
  comments?: string;        // 주석 / 감상 메모
  lyrics?: string;          // 원문 가사 (Original Lyrics)
  koreanLyrics?: string;    // 한글 번역 / 한국어 가사 (Korean Lyrics)
  coverImageUrl?: string;   // 앨범 표지 이미지
  audioFileName?: string;   // 대표곡 음원 파일명
  audioUrl?: string;        // 실제 재생용 외부 URL 주소 (Cloudflare R2, 서버 음원 스트리밍 링크, 다운로드 불가 재생용)
  audioFileSize?: string;   // 파일 크기 e.g. "8.5 MB"
  audioDuration?: number;   // 음원 재생 시간(초)
  audioDataUrl?: string;    // Base64 오디오 데이터 URL (선택사항)
  hasIndexedDbAudio?: boolean; // IndexedDB 음원 저장 여부
  audioFormat?: string;     // e.g. "MPEG 오디오 (MP3, 320kbps)"
  bitrate?: string;         // 비트 전송률 e.g. "192kbps"
  channels?: string;        // 채널 e.g. "2(스테레오)"
  sampleRate?: string;      // 오디오 샘플 속도 e.g. "44.100kHz"
  encodedBy?: string;       // 인코딩한 프로그램/사람 e.g. "iTunes 10.6.3.25"
  formattedDuration?: string; // 길이 포맷 e.g. "00:02:57"
  sortSongTitle?: string;   // 정렬 노래
  sortArtist?: string;      // 정렬 아티스트
  sortAlbum?: string;       // 정렬 앨범
  dateAdded: string;        // 등록일자 e.g. "2026.10.02"
  pinned?: boolean;         // 대표 앨범 고정
  likes?: number;           // 추천수
}

export type CdFilterType = 'all' | 'favorites' | 'five_stars' | 'pinned' | 'unlinked';

export type ActiveTab = 'gallery' | 'miniroom' | 'guestbook' | 'upload_facebook' | 'upload_youtube' | 'travel_food' | 'cd_review' | 'my_cd_collection' | 'edit_profile' | 'admin';

export interface DailyVisitStat {
  date: string;       // e.g. "09/25", "10/01"
  fullDate: string;   // e.g. "2026-10-01"
  dayName: string;    // e.g. "월", "화", "수", "목", "금", "토", "일"
  daily: number;      // 일일 방문자 수
  total: number;      // 누적 총 방문자 수
  pageViews?: number; // 페이지뷰
}

export interface VisitorStatsData {
  today: number;
  total: number;
  lastDate?: string;
  history?: DailyVisitStat[];
}
