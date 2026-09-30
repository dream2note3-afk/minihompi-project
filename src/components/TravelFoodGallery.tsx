import React, { useState } from 'react';
import { TravelSpot, TravelCategory, UserSession } from '../types';
import { MapPin, Utensils, Coffee, Camera, ExternalLink, Plus, Search, Star, Pin, Trash2, Edit3, X, Check, Sparkles, Navigation } from 'lucide-react';

interface TravelFoodGalleryProps {
  items: TravelSpot[];
  onAddItem: (item: Omit<TravelSpot, 'id' | 'dateAdded'>) => void;
  onUpdateItem: (id: string, updated: Partial<TravelSpot>) => void;
  onDeleteItem: (id: string) => void;
  onTogglePin: (id: string) => void;
  isAdmin: boolean;
}

const REGIONS = ['전체', '제주', '강원', '전라', '경상', '서울/경기', '충청'];

const SAMPLE_TRAVEL_PRESETS = [
  {
    name: '남해 다랭이마을 & 멸치쌈밥 정식',
    category: 'travel' as TravelCategory,
    region: '경상',
    linkUrl: 'https://map.naver.com/p/search/%EB%82%A8%ED%95%B4%20%EB%8B%A4%EB%9E%AD%EC%9D%B4%EB%A7%88%EC%9D%84',
    linkName: '네이버 지도 바로가기',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    rating: 5,
    recommendedMenuOrTip: '층층이 계단식 논과 푸른 바다 전망 출사 & 남해 생멸치쌈밥',
    description: '남해안의 웅장한 바다와 108개 층층 계단식 논이 어우러진 국가 명승지. 봄 유채꽃과 가을 황금들녘 풍경 촬영에 최고입니다.',
    tags: ['남해여행', '다랭이마을', '남해맛집', '바다풍경']
  },
  {
    name: '경주 황리단길 & 교촌마을 교리김밥',
    category: 'food' as TravelCategory,
    region: '경상',
    linkUrl: 'https://map.naver.com/p/search/%EA%B2%BD%EC%A3%BC%20%ED%99%A9%EB%A6%AC%EB%8B%A8%EA%B8%B8',
    linkName: '네이버 지도 바로가기',
    imageUrl: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=800&q=80',
    rating: 5,
    recommendedMenuOrTip: '대릉원 돌담길 야경 & 계란지단 교리김밥',
    description: '천년고도 경주의 전통 한옥과 감성 숍이 만난 황리단길. 대릉원과 첨성대 야경 출사 후 든든하게 김밥과 전통 온면을 맛보세요.',
    tags: ['경주여행', '황리단길', '대릉원', '교리김밥', '야경명소']
  },
  {
    name: '춘천 소양강 스카이워크 & 통나무집 닭갈비',
    category: 'food' as TravelCategory,
    region: '강원',
    linkUrl: 'https://map.naver.com/p/search/%EC%B6%98%EC%B2%9C%20%EC%86%8C%EC%96%91%EA%B0%95%EC%8A%A4%EC%B9%B4%EC%9D%B4%EC%9B%8C%ED%81%AC',
    linkName: '네이버 지도 바로가기',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    rating: 4,
    recommendedMenuOrTip: '소양강 처녀상 일몰 뷰 & 철판/숯불 닭갈비 막국수 세트',
    description: '탁 트인 소양강 위 유리 다리를 걷는 스카이워크 체험과 춘천 원조 철판 닭갈비 미식 코스.',
    tags: ['춘천여행', '소양강', '닭갈비맛집', '강원도드라이브']
  }
];

export const TravelFoodGallery: React.FC<TravelFoodGalleryProps> = ({
  items,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onTogglePin,
  isAdmin
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | TravelCategory>('all');
  const [selectedRegion, setSelectedRegion] = useState('전체');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSpotId, setEditingSpotId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState<TravelCategory>('travel');
  const [region, setRegion] = useState('제주');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkName, setLinkName] = useState('지도 바로가기');
  const [imageUrl, setImageUrl] = useState('');
  const [rating, setRating] = useState(5);
  const [recommendedMenuOrTip, setRecommendedMenuOrTip] = useState('');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [isPinned, setIsPinned] = useState(false);

  const handleOpenCreate = () => {
    setEditingSpotId(null);
    setName('');
    setCategory('travel');
    setRegion('제주');
    setLinkUrl('');
    setLinkName('지도 바로가기');
    setImageUrl('');
    setRating(5);
    setRecommendedMenuOrTip('');
    setDescription('');
    setTagsInput('');
    setIsPinned(false);
    setShowAddModal(true);
  };

  const handleOpenEdit = (spot: TravelSpot) => {
    setEditingSpotId(spot.id);
    setName(spot.name);
    setCategory(spot.category);
    setRegion(spot.region);
    setLinkUrl(spot.linkUrl);
    setLinkName(spot.linkName || '지도 바로가기');
    setImageUrl(spot.imageUrl);
    setRating(spot.rating);
    setRecommendedMenuOrTip(spot.recommendedMenuOrTip || '');
    setDescription(spot.description);
    setTagsInput(spot.tags.join(', '));
    setIsPinned(!!spot.pinned);
    setShowAddModal(true);
  };

  const applyPreset = (preset: typeof SAMPLE_TRAVEL_PRESETS[0]) => {
    setName(preset.name);
    setCategory(preset.category);
    setRegion(preset.region);
    setLinkUrl(preset.linkUrl);
    setLinkName(preset.linkName);
    setImageUrl(preset.imageUrl);
    setRating(preset.rating);
    setRecommendedMenuOrTip(preset.recommendedMenuOrTip);
    setDescription(preset.description);
    setTagsInput(preset.tags.join(', '));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !linkUrl.trim()) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter((t) => t.length > 0);

    const spotPayload = {
      name: name.trim(),
      category,
      region,
      linkUrl: linkUrl.trim(),
      linkName: linkName.trim() || '지도 바로가기',
      imageUrl: imageUrl.trim() || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
      rating,
      recommendedMenuOrTip: recommendedMenuOrTip.trim(),
      description: description.trim(),
      tags: tags.length > 0 ? tags : ['국내여행', '맛집'],
      pinned: isPinned
    };

    if (editingSpotId) {
      onUpdateItem(editingSpotId, spotPayload);
    } else {
      onAddItem(spotPayload);
    }

    // Reset Form
    setEditingSpotId(null);
    setName('');
    setLinkUrl('');
    setImageUrl('');
    setRecommendedMenuOrTip('');
    setDescription('');
    setTagsInput('');
    setIsPinned(false);
    setShowAddModal(false);
  };

  const filteredItems = items.filter((spot) => {
    if (selectedCategory !== 'all' && spot.category !== selectedCategory) return false;
    if (selectedRegion !== '전체' && spot.region !== selectedRegion) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = spot.name.toLowerCase().includes(q);
      const matchDesc = spot.description.toLowerCase().includes(q);
      const matchMenu = spot.recommendedMenuOrTip.toLowerCase().includes(q);
      const matchRegion = spot.region.toLowerCase().includes(q);
      const matchTags = spot.tags.some((t) => t.toLowerCase().includes(q));
      if (!matchName && !matchDesc && !matchMenu && !matchRegion && !matchTags) return false;
    }
    return true;
  });

  const getCategoryBadge = (cat: TravelCategory) => {
    switch (cat) {
      case 'travel':
        return { label: '여행지', color: 'bg-emerald-600 text-white', icon: <MapPin className="w-3 h-3" /> };
      case 'food':
        return { label: '맛집', color: 'bg-[#e05619] text-white', icon: <Utensils className="w-3 h-3" /> };
      case 'cafe':
        return { label: '카페·디저트', color: 'bg-[#8d5b4c] text-white', icon: <Coffee className="w-3 h-3" /> };
      case 'photoslot':
        return { label: '포토스팟', color: 'bg-[#2b7294] text-white', icon: <Camera className="w-3 h-3" /> };
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Top Banner & Control Bar */}
      <div className="bg-[#f0f6fa] border border-[#c4d7e2] rounded-lg p-3 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
            <h3 className="text-xs font-bold text-[#1f3a52]">
              전국 주요 여행지 &amp; 맛집 링크 아카이브 ({items.length}곳)
            </h3>
          </div>
          <p className="text-[11px] text-[#6d8494] mt-0.5">
            권용우 작가가 직접 출사 및 답사하며 엄선한 국내 명소와 미식 핫플레이스 링크입니다.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-3 py-1.5 bg-[#2b7294] hover:bg-[#205b77] text-white rounded text-xs font-bold shadow-2xs flex items-center justify-center gap-1.5 transition-all shrink-0 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>여행지·맛집 등록하기</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2 bg-[#f8fafc] p-2 rounded-lg border border-[#cde0e9]">
        {/* Category Buttons */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-2.5 py-1 text-xs rounded font-medium transition-all shrink-0 ${
              selectedCategory === 'all'
                ? 'bg-[#2b7294] text-white font-bold shadow-2xs'
                : 'bg-white text-[#506c7e] border border-[#c9dbe4] hover:bg-[#eef5f8]'
            }`}
          >
            전체 ({items.length})
          </button>
          <button
            onClick={() => setSelectedCategory('travel')}
            className={`px-2.5 py-1 text-xs rounded font-medium flex items-center gap-1 transition-all shrink-0 ${
              selectedCategory === 'travel'
                ? 'bg-emerald-600 text-white font-bold shadow-2xs'
                : 'bg-white text-[#506c7e] border border-[#c9dbe4] hover:bg-[#eef5f8]'
            }`}
          >
            <MapPin className="w-3 h-3" />
            <span>여행지</span>
          </button>
          <button
            onClick={() => setSelectedCategory('food')}
            className={`px-2.5 py-1 text-xs rounded font-medium flex items-center gap-1 transition-all shrink-0 ${
              selectedCategory === 'food'
                ? 'bg-[#e05619] text-white font-bold shadow-2xs'
                : 'bg-white text-[#506c7e] border border-[#c9dbe4] hover:bg-[#eef5f8]'
            }`}
          >
            <Utensils className="w-3 h-3" />
            <span>맛집</span>
          </button>
          <button
            onClick={() => setSelectedCategory('cafe')}
            className={`px-2.5 py-1 text-xs rounded font-medium flex items-center gap-1 transition-all shrink-0 ${
              selectedCategory === 'cafe'
                ? 'bg-[#8d5b4c] text-white font-bold shadow-2xs'
                : 'bg-white text-[#506c7e] border border-[#c9dbe4] hover:bg-[#eef5f8]'
            }`}
          >
            <Coffee className="w-3 h-3" />
            <span>카페·베이커리</span>
          </button>
          <button
            onClick={() => setSelectedCategory('photoslot')}
            className={`px-2.5 py-1 text-xs rounded font-medium flex items-center gap-1 transition-all shrink-0 ${
              selectedCategory === 'photoslot'
                ? 'bg-[#2b7294] text-white font-bold shadow-2xs'
                : 'bg-white text-[#506c7e] border border-[#c9dbe4] hover:bg-[#eef5f8]'
            }`}
          >
            <Camera className="w-3 h-3" />
            <span>포토스팟</span>
          </button>
        </div>

        {/* Region & Search */}
        <div className="flex items-center gap-2">
          {/* Region selector */}
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="px-2 py-1 bg-white border border-[#bed2dc] rounded text-xs text-[#2a3f50] font-medium outline-hidden"
          >
            {REGIONS.map((r) => (
              <option key={r} value={r}>
                {r === '전체' ? '전국 지역' : r}
              </option>
            ))}
          </select>

          {/* Search box */}
          <div className="relative flex-1 md:w-44">
            <Search className="w-3 h-3 text-[#7992a2] absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="장소, 메뉴, 태그..."
              className="w-full pl-7 pr-2 py-1 bg-white border border-[#bed2dc] rounded text-xs text-[#2a3f50] placeholder:text-[#9bb1be] outline-hidden focus:border-[#2b7294]"
            />
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      {filteredItems.length === 0 ? (
        <div className="py-12 text-center bg-[#fdfdfd] border border-dashed border-[#ccdbe2] rounded-lg">
          <p className="text-xs text-[#6e8594]">
            선택한 조건에 해당하는 여행지나 맛집 정보가 없습니다.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {filteredItems.map((spot) => {
            const badge = getCategoryBadge(spot.category);

            return (
              <div
                key={spot.id}
                className="group bg-white border border-[#cddfe7] rounded-lg overflow-hidden shadow-2xs hover:shadow-md hover:border-[#adc8d6] transition-all flex flex-col justify-between relative"
              >
                {/* Pinned Ribbon */}
                {spot.pinned && (
                  <div className="absolute top-2 left-2 z-10 bg-[#ff6b2b] text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-xs flex items-center gap-0.5">
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>추천 명소</span>
                  </div>
                )}

                {/* Photo & Badges */}
                <div className="relative aspect-video bg-[#1e293b] overflow-hidden">
                  <img
                    src={spot.imageUrl}
                    alt={spot.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />

                  {/* Category and Region Badges */}
                  <div className="absolute bottom-2 left-2 flex items-center gap-1">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 shadow-xs ${badge.color}`}>
                      {badge.icon}
                      <span>{badge.label}</span>
                    </span>
                    <span className="bg-black/60 backdrop-blur-2xs text-white text-[10px] font-mono px-1.5 py-0.5 rounded">
                      {spot.region}
                    </span>
                  </div>

                  {/* Rating Stars */}
                  <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-2xs px-1.5 py-0.5 rounded flex items-center gap-0.5 text-[#ffc107]">
                    {[...Array(spot.rating)].map((_, i) => (
                      <Star key={i} className="w-2.5 h-2.5 fill-current" />
                    ))}
                  </div>
                </div>

                {/* Card Content Body */}
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-[#1f374a] group-hover:text-[#2b7294] transition-colors line-clamp-1">
                      {spot.name}
                    </h4>

                    {/* Recommended tip or signature menu */}
                    {spot.recommendedMenuOrTip && (
                      <div className="mt-1.5 p-1.5 bg-[#f5f9fc] border border-[#d6e5ef] rounded text-[11px] text-[#204a6e] font-medium flex items-start gap-1">
                        <span className="text-[#e05619] font-bold shrink-0">추천:</span>
                        <span className="line-clamp-1">{spot.recommendedMenuOrTip}</span>
                      </div>
                    )}

                    <p className="mt-2 text-[11px] text-[#556e80] line-clamp-2 leading-relaxed">
                      {spot.description}
                    </p>

                    {/* Tags */}
                    <div className="mt-2 flex flex-wrap gap-1">
                      {spot.tags.map((t, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] text-[#42647c] bg-[#eef4f7] px-1.5 py-0.2 rounded border border-[#d6e3ea]"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Card Bottom Footer: Link Button & Admin tools */}
                  <div className="mt-3 pt-2.5 border-t border-[#e2edf2] flex items-center justify-between">
                    <span className="text-[10px] text-[#8aa0ae] font-mono">
                      {spot.dateAdded} 등록
                    </span>

                    <div className="flex items-center gap-1.5">
                      {/* Direct External Map Link */}
                      <a
                        href={spot.linkUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="px-2.5 py-1 bg-[#10b981] hover:bg-[#0d9466] text-white rounded text-[11px] font-bold shadow-2xs flex items-center gap-1 transition-colors"
                        title="지도 및 상세 정보 열기"
                      >
                        <Navigation className="w-3 h-3" />
                        <span>{spot.linkName || '지도 바로가기'}</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>

                      {/* Admin Tools */}
                      {isAdmin && (
                        <>
                          <button
                            onClick={() => onTogglePin(spot.id)}
                            className={`p-1 rounded transition-colors ${
                              spot.pinned ? 'text-[#ff6b2b] bg-[#fff2ec]' : 'text-[#8da4b3] hover:text-[#ff6b2b]'
                            }`}
                            title={spot.pinned ? '추천 해제' : '추천 지정'}
                          >
                            <Pin className="w-3 h-3 fill-current" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(spot)}
                            className="p-1 rounded text-[#8da4b3] hover:text-emerald-600 transition-colors"
                            title="내용 수정하기"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => onDeleteItem(spot.id)}
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

      {/* Add New Spot Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="bg-white border-2 border-[#10b981] rounded-xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-4 flex flex-col gap-3.5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-2 border-b border-[#e2edf2]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  {editingSpotId ? <Edit3 className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1f374a]">
                    {editingSpotId ? '여행지 & 맛집 정보 수정' : '새로운 국내 여행지 & 맛집 링크 등록'}
                  </h3>
                  <p className="text-[11px] text-[#6d8494]">
                    {editingSpotId
                      ? '등록된 여행지 또는 맛집 정보를 수정하여 저장합니다.'
                      : '추천하고 싶은 여행지나 맛집의 위치 지도 링크와 사진을 등록합니다.'}
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
            {!editingSpotId && (
              <div className="p-2.5 bg-[#f5faf7] border border-[#cde8dc] rounded-md">
                <span className="text-[11px] font-bold text-[#1d5c3f] block mb-1">
                  ⚡️ 빠른 예시 데이터 자동 입력:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                  {SAMPLE_TRAVEL_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => applyPreset(preset)}
                      className="text-left p-1.5 bg-white border border-[#b2dbcb] hover:border-emerald-600 rounded text-[11px] text-[#1c4734] truncate hover:bg-[#e8f7f0] transition-colors"
                    >
                      <span className="font-bold truncate block">{preset.name}</span>
                      <span className="text-[9px] text-[#55816e]">{preset.region} · {preset.recommendedMenuOrTip}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Spot Name */}
                <div>
                  <label className="block text-xs font-bold text-[#2a3f50] mb-1">
                    장소 / 맛집 이름 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="예: 제주 협재 해변 & 흑돼지 식당"
                    className="w-full p-2 bg-white border border-[#bed2dc] rounded text-xs text-[#2a3f50] focus:border-emerald-600 outline-hidden font-bold"
                    required
                  />
                </div>

                {/* Category & Region */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-[#2a3f50] mb-1">
                      분류 카테고리
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as TravelCategory)}
                      className="w-full p-2 bg-white border border-[#bed2dc] rounded text-xs text-[#2a3f50] focus:border-emerald-600 outline-hidden"
                    >
                      <option value="travel">여행지</option>
                      <option value="food">맛집</option>
                      <option value="cafe">카페·디저트</option>
                      <option value="photoslot">포토스팟</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#2a3f50] mb-1">
                      지역
                    </label>
                    <select
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      className="w-full p-2 bg-white border border-[#bed2dc] rounded text-xs text-[#2a3f50] focus:border-emerald-600 outline-hidden"
                    >
                      <option value="제주">제주</option>
                      <option value="강원">강원</option>
                      <option value="전라">전라</option>
                      <option value="경상">경상</option>
                      <option value="서울/경기">서울/경기</option>
                      <option value="충청">충청</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Map Link & Link Label */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#2a3f50] mb-1">
                    지도 / 웹사이트 링크 URL <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="https://map.naver.com/... 또는 카카오맵, 블로그 주소"
                    className="w-full p-2 bg-white border border-[#bed2dc] rounded text-xs text-[#2a3f50] focus:border-emerald-600 outline-hidden font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2a3f50] mb-1">
                    버튼 문구
                  </label>
                  <input
                    type="text"
                    value={linkName}
                    onChange={(e) => setLinkName(e.target.value)}
                    placeholder="예: 네이버 지도 바로가기"
                    className="w-full p-2 bg-white border border-[#bed2dc] rounded text-xs text-[#2a3f50] focus:border-emerald-600 outline-hidden"
                  />
                </div>
              </div>

              {/* Image URL & Rating */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#2a3f50] mb-1">
                    대표 사진 이미지 주소 (Image URL)
                  </label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/... 또는 사진 링크"
                    className="w-full p-2 bg-white border border-[#bed2dc] rounded text-xs text-[#2a3f50] focus:border-emerald-600 outline-hidden font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2a3f50] mb-1">
                    추천 별점 (1~5)
                  </label>
                  <div className="flex items-center gap-1 pt-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className={`text-lg transition-transform ${star <= rating ? 'text-[#ffc107] scale-110' : 'text-gray-300'}`}
                      >
                        ★
                      </button>
                    ))}
                    <span className="text-xs font-mono font-bold text-[#444] ml-1">{rating}점</span>
                  </div>
                </div>
              </div>

              {/* Recommended Menu or Tip */}
              <div>
                <label className="block text-xs font-bold text-[#2a3f50] mb-1">
                  대표 메뉴 또는 촬영 출사 팁
                </label>
                <input
                  type="text"
                  value={recommendedMenuOrTip}
                  onChange={(e) => setRecommendedMenuOrTip(e.target.value)}
                  placeholder="예: 일몰 골든아워 풍경 출사 & 시그니처 전복 해물삼합"
                  className="w-full p-2 bg-white border border-[#bed2dc] rounded text-xs text-[#2a3f50] focus:border-emerald-600 outline-hidden"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-[#2a3f50] mb-1">
                  상세 후기 및 메모
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="위치 찾아가는 법, 주차 팁, 주변 연계 관광지 등을 자유롭게 작성해주세요."
                  className="w-full p-2 bg-white border border-[#bed2dc] rounded text-xs text-[#2a3f50] focus:border-emerald-600 outline-hidden resize-none leading-relaxed"
                />
              </div>

              {/* Tags & Pin */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-[#e2edf2]">
                <div className="flex-1">
                  <label className="block text-[11px] font-bold text-[#2a3f50] mb-0.5">
                    해시태그 (쉼표 구분)
                  </label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="제주, 일몰, 맛집, 출사지"
                    className="w-full p-1.5 bg-white border border-[#bed2dc] rounded text-xs text-[#2a3f50]"
                  />
                </div>

                <label className="flex items-center gap-1.5 cursor-pointer mt-2 sm:mt-4 text-xs font-medium text-[#2d4253]">
                  <input
                    type="checkbox"
                    checked={isPinned}
                    onChange={(e) => setIsPinned(e.target.checked)}
                    className="accent-[#ff6b2b]"
                  />
                  <span>상단 추천 명소로 고정</span>
                </label>
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
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{editingSpotId ? '수정 내용 저장' : '여행지·맛집 등록 완료'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
