import React, { useState } from 'react';
import { CdReviewItem, CdCategory, CdStatus, UserSession } from '../types';
import { Disc3, ShoppingCart, ExternalLink, Plus, Search, Star, Pin, Trash2, Check, Sparkles, Store, Music, Award, Radio, Edit3, ArrowUpDown } from 'lucide-react';

interface CdReviewGalleryProps {
  items: CdReviewItem[];
  onAddItem: (item: Omit<CdReviewItem, 'id' | 'dateAdded'>) => void;
  onUpdateItem: (id: string, updated: Partial<CdReviewItem>) => void;
  onDeleteItem: (id: string) => void;
  onTogglePin: (id: string) => void;
  isAdmin: boolean;
}

const SAMPLE_CD_PRESETS = [
  {
    title: '신나라레코드 온라인 몰 (가요·클래식·OST CD)',
    artistOrSeller: '신나라레코드 (Synnara)',
    category: 'online_store' as CdCategory,
    status: 'planned' as CdStatus,
    price: '90-2000년대 명반 레트로 CD 전문',
    storeUrl: 'https://www.synnara.co.kr',
    storeName: '신나라레코드 공식몰',
    coverImageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
    releaseYear: '공식 판매처',
    reviewComment: '아날로그 시절 발매된 추억의 가요 및 영화 사운드트랙 CD 재고를 확인하고 주문할 수 있는 대표 온라인 음반사.',
    keyTracks: ['90s 가요 명반', '한국 영화 OST', '레트로 팝 CD'],
    rating: 5
  },
  {
    title: '자전거 탄 풍경 1집 - 너에게 난 나에게 넌 수록',
    artistOrSeller: '자전거 탄 풍경',
    category: 'album' as CdCategory,
    status: 'reviewing' as CdStatus,
    price: '약 15,000원 ~ 20,000원',
    storeUrl: 'https://www.aladin.co.kr/search/wsearchresult.aspx?SearchWord=%EC%9E%90%EC%A0%84%EA%B1%B0+%ED%83%84+%ED%92%8D%EA%B2%BD+1%EC%A7%91',
    storeName: '알라딘 음반 검색',
    coverImageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
    releaseYear: '2001년',
    reviewComment: '영화 "클래식"의 대표 테마곡이자 한국 어쿠스틱 포크의 금자탑. 스튜디오 아날로그 오디오 장비로 들었을 때 통기타 스트로크 질감이 최고.',
    keyTracks: ['너에게 난 나에게 넌', '풍경', '그렇게 너를 사랑해'],
    rating: 5
  },
  {
    title: '토이(Toy) 5집 - Fermata (좋은 사람 수록)',
    artistOrSeller: '유희열 (Toy)',
    category: 'album' as CdCategory,
    status: 'wishlist' as CdStatus,
    price: '약 18,000원',
    storeUrl: 'https://www.yes24.com/Product/Search?domain=MUSIC&query=%ED%86%A0%EC%9D%B4+Fermata',
    storeName: '예스24 음반 검색',
    coverImageUrl: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=800&q=80',
    releaseYear: '2001년',
    reviewComment: '2000년대 감성 팝 발라드의 마스터피스. 김형중, 이소은, 성시경, 조원선 등 명품 객원 보컬들의 조화가 돋보이며 CD 북클릿 사진 감성도 훌륭함.',
    keyTracks: ['좋은 사람 (Feat. 김형중)', '언젠가 우리 다시 만나면', '내가 너의 곁에 잠시 살았다는 걸'],
    rating: 5
  }
];

export const CdReviewGallery: React.FC<CdReviewGalleryProps> = ({
  items,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onTogglePin,
  isAdmin
}) => {
  const [selectedStatus, setSelectedStatus] = useState<'all' | CdStatus>('all');
  const [selectedCategory, setSelectedCategory] = useState<'all' | CdCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'latest' | 'popular'>('latest');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCdId, setEditingCdId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [artistOrSeller, setArtistOrSeller] = useState('');
  const [category, setCategory] = useState<CdCategory>('album');
  const [status, setStatus] = useState<CdStatus>('reviewing');
  const [price, setPrice] = useState('');
  const [storeUrl, setStoreUrl] = useState('');
  const [storeName, setStoreName] = useState('알라딘');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [releaseYear, setReleaseYear] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [keyTracksInput, setKeyTracksInput] = useState('');
  const [rating, setRating] = useState(5);
  const [isPinned, setIsPinned] = useState(false);

  const handleOpenCreate = () => {
    setEditingCdId(null);
    setTitle('');
    setArtistOrSeller('');
    setCategory('album');
    setStatus('reviewing');
    setPrice('');
    setStoreUrl('');
    setStoreName('알라딘');
    setCoverImageUrl('');
    setReleaseYear('');
    setReviewComment('');
    setKeyTracksInput('');
    setRating(5);
    setIsPinned(false);
    setShowAddModal(true);
  };

  const handleOpenEdit = (item: CdReviewItem) => {
    setEditingCdId(item.id);
    setTitle(item.title);
    setArtistOrSeller(item.artistOrSeller);
    setCategory(item.category);
    setStatus(item.status);
    setPrice(item.price || '');
    setStoreUrl(item.storeUrl);
    setStoreName(item.storeName);
    setCoverImageUrl(item.coverImageUrl);
    setReleaseYear(item.releaseYear || '');
    setReviewComment(item.reviewComment);
    setKeyTracksInput(item.keyTracks ? item.keyTracks.join(', ') : '');
    setRating(item.rating || 5);
    setIsPinned(!!item.pinned);
    setShowAddModal(true);
  };

  const applyPreset = (preset: typeof SAMPLE_CD_PRESETS[0]) => {
    setTitle(preset.title);
    setArtistOrSeller(preset.artistOrSeller);
    setCategory(preset.category);
    setStatus(preset.status);
    setPrice(preset.price);
    setStoreUrl(preset.storeUrl);
    setStoreName(preset.storeName);
    setCoverImageUrl(preset.coverImageUrl);
    setReleaseYear(preset.releaseYear);
    setReviewComment(preset.reviewComment);
    setKeyTracksInput(preset.keyTracks.join(', '));
    setRating(preset.rating);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !storeUrl.trim()) return;

    const keyTracks = keyTracksInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const cdPayload = {
      title: title.trim(),
      artistOrSeller: artistOrSeller.trim() || '아티스트 미상',
      category,
      status,
      price: price.trim() || '가격 미정',
      storeUrl: storeUrl.trim(),
      storeName: storeName.trim() || '온라인 음반몰',
      coverImageUrl: coverImageUrl.trim() || 'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=800&q=80',
      releaseYear: releaseYear.trim(),
      reviewComment: reviewComment.trim(),
      keyTracks: keyTracks.length > 0 ? keyTracks : [],
      rating,
      pinned: isPinned
    };

    if (editingCdId) {
      onUpdateItem(editingCdId, cdPayload);
    } else {
      onAddItem(cdPayload);
    }

    // Reset
    setEditingCdId(null);
    setTitle('');
    setArtistOrSeller('');
    setPrice('');
    setStoreUrl('');
    setCoverImageUrl('');
    setReleaseYear('');
    setReviewComment('');
    setKeyTracksInput('');
    setIsPinned(false);
    setShowAddModal(false);
  };

  const filteredItems = [...items]
    .filter((item) => {
      if (selectedStatus !== 'all' && item.status !== selectedStatus) return false;
      if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchArtist = item.artistOrSeller.toLowerCase().includes(q);
        const matchComment = item.reviewComment.toLowerCase().includes(q);
        const matchStore = item.storeName.toLowerCase().includes(q);
        const matchTracks = item.keyTracks?.some((t) => t.toLowerCase().includes(q));
        if (!matchTitle && !matchArtist && !matchComment && !matchStore && !matchTracks) return false;
      }
      return true;
    })
    .sort((a, b) => {
      // Pinned items stay at top
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;

      if (sortBy === 'popular') {
        const aScore = a.likes ?? ((a.rating || 5) * 15);
        const bScore = b.likes ?? ((b.rating || 5) * 15);
        const diff = bScore - aScore;
        if (diff !== 0) return diff;
      }
      return (b.dateAdded || '').localeCompare(a.dateAdded || '');
    });

  const getStatusBadge = (s: CdStatus) => {
    switch (s) {
      case 'reviewing':
        return { label: '검토중 🔍', color: 'bg-[#ff9f43] text-white' };
      case 'planned':
        return { label: '구매예정 🛒', color: 'bg-[#3b82f6] text-white' };
      case 'purchased':
        return { label: '소장완료 ✅', color: 'bg-emerald-600 text-white' };
      case 'wishlist':
        return { label: '위시리스트 ⭐️', color: 'bg-[#9b59b6] text-white' };
    }
  };

  const getCategoryBadge = (c: CdCategory) => {
    switch (c) {
      case 'album':
        return { label: '정규 음반 CD', icon: <Disc3 className="w-3 h-3" /> };
      case 'online_store':
        return { label: '온라인 음반몰', icon: <Store className="w-3 h-3" /> };
      case 'offline_shop':
        return { label: '오프라인 레코드샵', icon: <Radio className="w-3 h-3" /> };
      case 'rare_cd':
        return { label: '희귀·절판반', icon: <Award className="w-3 h-3" /> };
    }
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col gap-2.5 h-full overflow-hidden">
      {/* Top Banner & Control Bar */}
      <div className="bg-[#f2f4fa] border border-[#cbd5e8] rounded-lg p-3 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]" />
            <h3 className="text-xs font-bold text-[#1a2f4c]">
              음악 CD 구매 검토 및 판매처 링크 관리 ({items.length}건)
            </h3>
          </div>
          <p className="text-[11px] text-[#637591] mt-0.5">
            소장하고 싶은 명반 CD와 알라딘, 예스24 등 신뢰할 수 있는 음반 판매처 링크를 모아 검토합니다.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenCreate}
            className="px-3 py-1.5 bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded text-xs font-bold shadow-2xs flex items-center justify-center gap-1.5 transition-all shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>음반·판매처 등록하기</span>
          </button>
        )}
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2 bg-[#f8fafc] p-2 rounded-lg border border-[#cde0e9] shrink-0">
        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setSelectedStatus('all')}
            className={`px-2.5 py-1 text-xs rounded font-medium transition-all shrink-0 ${
              selectedStatus === 'all'
                ? 'bg-[#3b82f6] text-white font-bold shadow-2xs'
                : 'bg-white text-[#506c7e] border border-[#c9dbe4] hover:bg-[#eef5f8]'
            }`}
          >
            전체 ({items.length})
          </button>
          <button
            onClick={() => setSelectedStatus('reviewing')}
            className={`px-2.5 py-1 text-xs rounded font-medium transition-all shrink-0 ${
              selectedStatus === 'reviewing'
                ? 'bg-[#ff9f43] text-white font-bold shadow-2xs'
                : 'bg-white text-[#506c7e] border border-[#c9dbe4] hover:bg-[#eef5f8]'
            }`}
          >
            검토중
          </button>
          <button
            onClick={() => setSelectedStatus('planned')}
            className={`px-2.5 py-1 text-xs rounded font-medium transition-all shrink-0 ${
              selectedStatus === 'planned'
                ? 'bg-[#2563eb] text-white font-bold shadow-2xs'
                : 'bg-white text-[#506c7e] border border-[#c9dbe4] hover:bg-[#eef5f8]'
            }`}
          >
            구매예정
          </button>
          <button
            onClick={() => setSelectedStatus('purchased')}
            className={`px-2.5 py-1 text-xs rounded font-medium transition-all shrink-0 ${
              selectedStatus === 'purchased'
                ? 'bg-emerald-600 text-white font-bold shadow-2xs'
                : 'bg-white text-[#506c7e] border border-[#c9dbe4] hover:bg-[#eef5f8]'
            }`}
          >
            소장완료
          </button>
          <button
            onClick={() => setSelectedStatus('wishlist')}
            className={`px-2.5 py-1 text-xs rounded font-medium transition-all shrink-0 ${
              selectedStatus === 'wishlist'
                ? 'bg-[#9b59b6] text-white font-bold shadow-2xs'
                : 'bg-white text-[#506c7e] border border-[#c9dbe4] hover:bg-[#eef5f8]'
            }`}
          >
            위시리스트
          </button>
        </div>

        {/* Sort, Category & Search */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap sm:flex-nowrap">
          {/* Sort Dropdown */}
          <div className="flex items-center gap-1 bg-white px-2 py-1 rounded border border-[#bed2dc] shadow-2xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#ff6b2b] shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'latest' | 'popular')}
              className="bg-transparent text-xs text-[#2a3f50] font-medium outline-hidden cursor-pointer"
              title="음반 정렬 방식 선택"
            >
              <option value="latest">최신순</option>
              <option value="popular">인기순 (별점·좋아요순)</option>
            </select>
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as any)}
            className="px-2 py-1 bg-white border border-[#bed2dc] rounded text-xs text-[#2a3f50] font-medium outline-hidden cursor-pointer shadow-2xs"
          >
            <option value="all">전체 분류</option>
            <option value="album">정규 음반 CD</option>
            <option value="online_store">온라인 음반몰</option>
            <option value="offline_shop">오프라인 레코드샵</option>
            <option value="rare_cd">희귀·절판반</option>
          </select>

          <div className="relative flex-1 md:w-44">
            <Search className="w-3 h-3 text-[#7992a2] absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="앨범명, 가수, 수록곡..."
              className="w-full pl-7 pr-2 py-1 bg-white border border-[#bed2dc] rounded text-xs text-[#2a3f50] placeholder:text-[#9bb1be] outline-hidden focus:border-[#3b82f6]"
            />
          </div>
        </div>
      </div>

      {/* CD Items Grid (Dedicated Red-box scrollable container) */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-retro-scrollbar pr-1">
        {filteredItems.length === 0 ? (
        <div className="py-12 text-center bg-[#fdfdfd] border border-dashed border-[#ccdbe2] rounded-lg">
          <p className="text-xs text-[#6e8594]">
            선택한 조건에 해당하는 음반 검토 항목이 없습니다.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3.5">
          {filteredItems.map((item) => {
            const statusBadge = getStatusBadge(item.status);
            const catBadge = getCategoryBadge(item.category);

            return (
              <div
                key={item.id}
                className="group bg-white border border-[#cddfe7] rounded-lg overflow-hidden shadow-2xs hover:shadow-md hover:border-[#adc8d6] transition-all flex flex-col justify-between relative"
              >
                {/* Pinned Ribbon */}
                {item.pinned && (
                  <div className="absolute top-2 left-2 z-10 bg-[#ff6b2b] text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-xs flex items-center gap-0.5">
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>추천 명반</span>
                  </div>
                )}

                {/* Album Cover & Realistic CD jewel case sleeve layout */}
                <div className="relative aspect-video bg-[#1e293b] overflow-hidden flex items-center justify-center">
                  <img
                    src={item.coverImageUrl}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />

                  {/* CD Disc Overlay Effect */}
                  <div className="absolute top-2 right-2 w-10 h-10 rounded-full border-2 border-white/60 bg-linear-to-tr from-gray-700 via-gray-400 to-gray-800 shadow-md flex items-center justify-center group-hover:rotate-45 transition-transform duration-700">
                    <div className="w-3.5 h-3.5 rounded-full bg-white/90 border border-gray-400 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-black/60" />
                    </div>
                  </div>

                  {/* Badges on bottom */}
                  <div className="absolute bottom-2 left-2 flex items-center gap-1">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shadow-xs ${statusBadge.color}`}>
                      {statusBadge.label}
                    </span>
                    <span className="bg-black/60 backdrop-blur-2xs text-white text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1">
                      {catBadge.icon}
                      <span>{catBadge.label}</span>
                    </span>
                  </div>

                  {/* Price Tag Badge */}
                  {item.price && (
                    <div className="absolute bottom-2 right-2 bg-black/75 backdrop-blur-2xs text-[#ffdd59] font-mono text-[10px] font-bold px-1.5 py-0.5 rounded">
                      {item.price}
                    </div>
                  )}
                </div>

                {/* Card Content Body */}
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Artist & Year */}
                    <div className="flex items-center justify-between text-[11px] text-[#5c7385] mb-0.5">
                      <span className="font-semibold text-[#2b7294] truncate">{item.artistOrSeller}</span>
                      {item.releaseYear && <span className="font-mono text-[10px]">{item.releaseYear}</span>}
                    </div>

                    <h4
                      className="text-xs sm:text-sm font-bold text-[#1f374a] group-hover:text-[#3b82f6] transition-colors line-clamp-2 leading-snug break-keep break-words"
                      title={item.title}
                    >
                      {item.title}
                    </h4>

                    {/* Review comment */}
                    <p className="mt-1.5 text-[11px] sm:text-xs text-[#556e80] line-clamp-2 leading-relaxed break-keep break-words">
                      {item.reviewComment}
                    </p>

                    {/* Key Tracks */}
                    {item.keyTracks && item.keyTracks.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {item.keyTracks.map((track, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] text-[#3c5d79] bg-[#edf4f8] px-1.5 py-0.2 rounded border border-[#d2e2ec] flex items-center gap-0.5"
                          >
                            <Music className="w-2.5 h-2.5 text-[#ff7e39]" />
                            <span>{track}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Card Bottom Footer */}
                  <div className="mt-3 pt-2.5 border-t border-[#e2edf2] flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[10px] text-[#718898]">
                      <span>판매처:</span>
                      <strong className="text-[#2c4456]">{item.storeName}</strong>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Direct External Store Link */}
                      <a
                        href={item.storeUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="px-2.5 py-1 bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded text-[11px] font-bold shadow-2xs flex items-center gap-1 transition-colors"
                        title="음반 판매처 링크 열기"
                      >
                        <ShoppingCart className="w-3 h-3" />
                        <span>판매처 바로가기</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>

                      {/* Admin Tools */}
                      {isAdmin && (
                        <>
                          <button
                            onClick={() => onTogglePin(item.id)}
                            className={`p-1 rounded transition-colors ${
                              item.pinned ? 'text-[#ff6b2b] bg-[#fff2ec]' : 'text-[#8da4b3] hover:text-[#ff6b2b]'
                            }`}
                            title={item.pinned ? '추천 해제' : '추천 지정'}
                          >
                            <Pin className="w-3 h-3 fill-current" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1 rounded text-[#8da4b3] hover:text-[#3b82f6] transition-colors"
                            title="내용 수정하기"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => onDeleteItem(item.id)}
                            className="p-1 rounded text-[#8da4b3] hover:text-red-600 transition-colors"
                            title="삭제"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      </div>

      {/* Add New CD/Store Review Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="bg-white border-2 border-[#3b82f6] rounded-xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-4 flex flex-col gap-3.5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-2 border-b border-[#e2edf2]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#3b82f6] text-white flex items-center justify-center shadow-xs">
                  {editingCdId ? <Edit3 className="w-4 h-4" /> : <Disc3 className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1f374a]">
                    {editingCdId ? '구매 검토 음반 & 판매처 정보 수정' : '구매 검토 음반 & 판매처 링크 등록'}
                  </h3>
                  <p className="text-[11px] text-[#6d8494]">
                    {editingCdId
                      ? '등록된 음반 또는 판매처 링크 정보를 수정하여 저장합니다.'
                      : '구매 검토 중인 명반 CD나 자주 이용하는 음반 판매처 링크를 등록합니다.'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowAddModal(false)}
                className="w-6 h-6 flex items-center justify-center rounded-full text-[#6d8494] hover:bg-[#e4eff4] text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Quick Presets (Only for new item creation) */}
            {!editingCdId && (
              <div className="p-2.5 bg-[#f0f4fb] border border-[#cbd8f2] rounded-md">
                <span className="text-[11px] font-bold text-[#1f407a] block mb-1">
                  ⚡️ 빠른 예시 데이터 자동 입력:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                  {SAMPLE_CD_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => applyPreset(preset)}
                      className="text-left p-1.5 bg-white border border-[#b2c8f0] hover:border-[#3b82f6] rounded text-[11px] text-[#1c3866] truncate hover:bg-[#e3edfc] transition-colors"
                    >
                      <span className="font-bold truncate block">{preset.title}</span>
                      <span className="text-[9px] text-[#53709b]">{preset.artistOrSeller} · {preset.price}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              {/* Title & Artist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#2a3f50] mb-1">
                    음반명 / 판매처 이름 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="예: 프리스타일 1집 - Free Style 1st"
                    className="w-full p-2 bg-white border border-[#bed2dc] rounded text-xs text-[#2a3f50] focus:border-[#3b82f6] outline-hidden font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2a3f50] mb-1">
                    아티스트 / 판매몰 이름
                  </label>
                  <input
                    type="text"
                    value={artistOrSeller}
                    onChange={(e) => setArtistOrSeller(e.target.value)}
                    placeholder="예: 프리스타일 또는 알라딘 음반몰"
                    className="w-full p-2 bg-white border border-[#bed2dc] rounded text-xs text-[#2a3f50] focus:border-[#3b82f6] outline-hidden"
                  />
                </div>
              </div>

              {/* Category, Status & Price */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-bold text-[#2a3f50] mb-1">
                    분류
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as CdCategory)}
                    className="w-full p-2 bg-white border border-[#bed2dc] rounded text-xs text-[#2a3f50] focus:border-[#3b82f6] outline-hidden"
                  >
                    <option value="album">정규 음반 CD</option>
                    <option value="online_store">온라인 음반몰</option>
                    <option value="offline_shop">오프라인 레코드샵</option>
                    <option value="rare_cd">희귀·절판반</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2a3f50] mb-1">
                    구매 검토 상태
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as CdStatus)}
                    className="w-full p-2 bg-white border border-[#bed2dc] rounded text-xs text-[#2a3f50] focus:border-[#3b82f6] outline-hidden font-bold"
                  >
                    <option value="reviewing">검토중 🔍</option>
                    <option value="planned">구매예정 🛒</option>
                    <option value="purchased">소장완료 ✅</option>
                    <option value="wishlist">위시리스트 ⭐️</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2a3f50] mb-1">
                    가격 / 예상가
                  </label>
                  <input
                    type="text"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="예: 18,500원"
                    className="w-full p-2 bg-white border border-[#bed2dc] rounded text-xs text-[#2a3f50] focus:border-[#3b82f6] outline-hidden font-mono"
                  />
                </div>
              </div>

              {/* Store URL & Store Name */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#2a3f50] mb-1">
                    판매처 구매 링크 URL <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    value={storeUrl}
                    onChange={(e) => setStoreUrl(e.target.value)}
                    placeholder="https://www.aladin.co.kr/... 또는 판매처 웹페이지"
                    className="w-full p-2 bg-white border border-[#bed2dc] rounded text-xs text-[#2a3f50] focus:border-[#3b82f6] outline-hidden font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2a3f50] mb-1">
                    판매처명 (사이트)
                  </label>
                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="예: 알라딘, 예스24, 핫트랙스"
                    className="w-full p-2 bg-white border border-[#bed2dc] rounded text-xs text-[#2a3f50] focus:border-[#3b82f6] outline-hidden"
                  />
                </div>
              </div>

              {/* Cover Image & Release Year */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#2a3f50] mb-1">
                    앨범 커버 / 판매처 이미지 주소 (URL)
                  </label>
                  <input
                    type="url"
                    value={coverImageUrl}
                    onChange={(e) => setCoverImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/... 또는 커버 이미지 주소"
                    className="w-full p-2 bg-white border border-[#bed2dc] rounded text-xs text-[#2a3f50] focus:border-[#3b82f6] outline-hidden font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2a3f50] mb-1">
                    발매 연도 / 버전
                  </label>
                  <input
                    type="text"
                    value={releaseYear}
                    onChange={(e) => setReleaseYear(e.target.value)}
                    placeholder="예: 2004년, 리마스터판"
                    className="w-full p-2 bg-white border border-[#bed2dc] rounded text-xs text-[#2a3f50] focus:border-[#3b82f6] outline-hidden"
                  />
                </div>
              </div>

              {/* Key Tracks */}
              <div>
                <label className="block text-xs font-bold text-[#2a3f50] mb-1">
                  대표 수록곡 / 청음 추천곡 (쉼표 구분)
                </label>
                <input
                  type="text"
                  value={keyTracksInput}
                  onChange={(e) => setKeyTracksInput(e.target.value)}
                  placeholder="예: Y (Please Tell Me Why), 비의 멜로디, Sweet Love"
                  className="w-full p-2 bg-white border border-[#bed2dc] rounded text-xs text-[#2a3f50] focus:border-[#3b82f6] outline-hidden"
                />
              </div>

              {/* Review Comment */}
              <div>
                <label className="block text-xs font-bold text-[#2a3f50] mb-1">
                  음반 검토 메모 및 소장 이유
                </label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={2}
                  placeholder="음질 마스터링 상태, 보컬 음색, 한정판 특전, 구매 고려 사항 등을 적어주세요."
                  className="w-full p-2 bg-white border border-[#bed2dc] rounded text-xs text-[#2a3f50] focus:border-[#3b82f6] outline-hidden resize-none leading-relaxed"
                />
              </div>

              {/* Pin */}
              <div className="flex items-center justify-between pt-1 border-t border-[#e2edf2]">
                <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-[#2d4253]">
                  <input
                    type="checkbox"
                    checked={isPinned}
                    onChange={(e) => setIsPinned(e.target.checked)}
                    className="accent-[#ff6b2b]"
                  />
                  <span>상단 추천 명반으로 고정</span>
                </label>

                {/* Rating */}
                <div className="flex items-center gap-1">
                  <span className="text-[11px] text-[#555]">소장 가치 평점:</span>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`text-base ${star <= rating ? 'text-[#ffc107]' : 'text-gray-300'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#e2edf2]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 bg-white border border-[#bed2dc] text-[#556e80] rounded text-xs font-medium"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{editingCdId ? '수정 내용 저장' : '음반·판매처 등록 완료'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
