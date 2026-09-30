import { MediaItem, GuestbookEntry } from '../types';

export const INITIAL_MEDIA_ITEMS: MediaItem[] = [
  {
    id: 'yt-1',
    type: 'youtube',
    title: '권용우 스튜디오 2026 필름 시네마틱 릴 (Showreel)',
    description: '서울의 노을과 골목길, 그리고 사람들의 온기를 담은 4K 시네마틱 영상입니다. 35mm 단렌즈와 아날로그 컬러그레이딩을 적용했습니다.',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnailUrl: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=800&q=80',
    youtubeId: 'dQw4w9WgXcQ',
    date: '2026.03.15',
    tags: ['시네마틱', '필름릴', '스튜디오작품', '4K'],
    likes: 42,
    views: 1280,
    pinned: true,
    album: '시네마틱 필름'
  },
  {
    id: 'fb-1',
    type: 'facebook',
    title: '한강의 노을과 보랏빛 윤슬 (페이스북 사진첩)',
    description: '어스름한 저녁 한강 다리 위에서 포착한 보랏빛 하늘. 페이스북 공식 포토 앨범에 업로드된 오리지널 컷입니다.',
    url: 'https://www.facebook.com/photo/?fbid=1022948291039&set=a.10229482910',
    thumbnailUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80',
    date: '2026.03.12',
    tags: ['한강노을', '페이스북사진', '감성스냅', '풍경'],
    likes: 38,
    views: 940,
    pinned: true,
    album: '서울 스냅'
  },
  {
    id: 'yt-2',
    type: 'youtube',
    title: '빈티지 카메라 컬렉션 & 렌즈 리뷰 (Leica & Hasselblad)',
    description: '수집해온 중형 필름 카메라와 올드 수동 렌즈들의 독특한 플레어, 보케 특성을 비교해보는 스튜디오 토크 영상입니다.',
    url: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
    thumbnailUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
    youtubeId: 'kJQP7kiw5Fk',
    date: '2026.02.28',
    tags: ['카메라리뷰', '빈티지필름', '라이카', '장비탐구'],
    likes: 29,
    views: 750,
    pinned: false,
    album: '장비 & 테크'
  },
  {
    id: 'fb-2',
    type: 'facebook',
    title: '스튜디오 인물 프로필 사진 시리즈 #04',
    description: '자연광과 부드러운 앰비언트 라이트로 담아낸 배우 프로필 사진. 페이스북 포트폴리오 컬렉션 발췌.',
    url: 'https://www.facebook.com/photo/?fbid=2033948291040&set=a.20339482910',
    thumbnailUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    date: '2026.02.20',
    tags: ['인물사진', '스튜디오프로필', '자연광', '페이스북'],
    likes: 56,
    views: 1420,
    pinned: false,
    album: '포트레이트'
  },
  {
    id: 'yt-3',
    type: 'youtube',
    title: '비 오는 날의 스튜디오 사운드스케이프 (ASMR & Lo-Fi Video)',
    description: '작업실 창가에 빗방울이 부딪히는 소리와 따뜻한 커피 향이 감도는 편안한 분위기의 영상입니다.',
    url: 'https://www.youtube.com/watch?v=5qap5aO4i9A',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=800&q=80',
    youtubeId: '5qap5aO4i9A',
    date: '2026.02.05',
    tags: ['빗소리', '로파이', '작업실', '힐링'],
    likes: 67,
    views: 2100,
    pinned: false,
    album: '일상 & 무드'
  },
  {
    id: 'fb-3',
    type: 'facebook',
    title: '가을 숲길 산책로 35mm 필름 스냅',
    description: '단풍이 물든 고즈넉한 숲길을 걸으며 담은 순간들. 콘트라스트와 온화한 색감이 돋보이는 컷입니다.',
    url: 'https://www.facebook.com/photo/?fbid=3044948291051&set=a.30449482910',
    thumbnailUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80',
    date: '2026.01.28',
    tags: ['필름스냅', '가을숲', '풍경사진', '페이스북포토'],
    likes: 45,
    views: 890,
    pinned: false,
    album: '계절의 기록'
  }
];

export const INITIAL_GUESTBOOK_ENTRIES: GuestbookEntry[] = [
  {
    id: 'gb-1',
    author: '도토리수집가',
    avatarIcon: '🐿️',
    content: '용우님 영상 보고 너무 힐링받았어요! 특히 한강 노을 컷 색감이 너무 따뜻합니다. 일촌 맺고 가요~ (BGM도 대박 추억돋네요!)',
    createdAt: '2026.03.28 17:42',
    relation: '일촌'
  },
  {
    id: 'gb-2',
    author: '필름카메라러버',
    avatarIcon: '📷',
    content: '스튜디오 분위기 너무 좋아요! 라이카 렌즈 리뷰 영상 다음 편도 기다리고 있습니다. 자주 놀러올게요 파도타기 슈웅~🌊',
    createdAt: '2026.03.26 21:15',
    relation: '스튜디오 동료'
  },
  {
    id: 'gb-3',
    author: '미니홈피요정',
    avatarIcon: '✨',
    content: '우와 권용우 작가님 미니홈피 오픈 축하드려요! 페이스북 사진들도 고화질로 모아볼 수 있어서 너무 편해요.',
    createdAt: '2026.03.24 14:03',
    relation: '팬클럽'
  }
];
