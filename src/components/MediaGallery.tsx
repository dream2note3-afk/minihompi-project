import React, { useState } from 'react';
import { MediaItem, MediaType } from '../types';
import { Youtube, Facebook, Play, Heart, Eye, ExternalLink, Trash2, Pin, Sparkles, Search, Film, Image as ImageIcon, Edit3, Check, X, ArrowUpDown, Tag, RotateCcw, HardDrive } from 'lucide-react';
import { getYouTubeEmbedUrl, extractYouTubeId, getYouTubeThumbnail } from '../utils/youtube';
import {
  isGoogleDriveUrl,
  transformIfGoogleDriveUrl,
  getGoogleDriveDirectImageUrl,
  getGoogleDriveThumbnailUrl,
  extractGoogleDriveFileId,
  handleGoogleDriveImageError
} from '../utils/googleDrive';

export const isGoogleDriveMedia = (item?: MediaItem | null): boolean => {
  if (!item) return false;
  const url = item.url?.toLowerCase() || '';
  const thumb = item.thumbnailUrl?.toLowerCase() || '';
  const title = item.title?.toLowerCase() || '';
  const tagsStr = (item.tags || []).join(' ').toLowerCase();

  return (
    isGoogleDriveUrl(item.url) ||
    isGoogleDriveUrl(item.thumbnailUrl) ||
    url.includes('drive.google.com') ||
    url.includes('docs.google.com') ||
    thumb.includes('drive.google.com') ||
    thumb.includes('googleusercontent.com') ||
    title.includes('google drive') ||
    title.includes('goole drive') ||
    title.includes('구글 드라이브') ||
    title.includes('구글드라이브') ||
    tagsStr.includes('구글드라이브') ||
    tagsStr.includes('googledrive')
  );
};

interface MediaGalleryProps {
  items: MediaItem[];
  onToggleLike: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onTogglePin: (id: string) => void;
  onUpdateItem: (id: string, updated: Partial<MediaItem>) => void;
  isAdmin: boolean;
}

export const MediaGallery: React.FC<MediaGalleryProps> = ({
  items,
  onToggleLike,
  onDeleteItem,
  onTogglePin,
  onUpdateItem,
  isAdmin
}) => {
  const [filterType, setFilterType] = useState<'all' | 'youtube' | 'facebook'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTarget, setSearchTarget] = useState<'all' | 'title' | 'tag'>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'latest' | 'popular'>('latest');
  const [selectedVideo, setSelectedVideo] = useState<MediaItem | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<MediaItem | null>(null);
  const [editingMedia, setEditingMedia] = useState<MediaItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<MediaItem | null>(null);

  // Edit Form States
  const [editTitle, setEditTitle] = useState('');
  const [editType, setEditType] = useState<MediaType>('youtube');
  const [editUrl, setEditUrl] = useState('');
  const [editThumbnailUrl, setEditThumbnailUrl] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editAlbum, setEditAlbum] = useState('');
  const [editTagsInput, setEditTagsInput] = useState('');
  const [editIsPinned, setEditIsPinned] = useState(false);

  // Extract all unique tags with usage counts
  const availableTags = React.useMemo(() => {
    const map: Record<string, number> = {};
    items.forEach((item) => {
      item.tags?.forEach((t) => {
        const clean = t.trim().replace(/^#/, '');
        if (clean) {
          map[clean] = (map[clean] || 0) + 1;
        }
      });
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [items]);

  const handleTagClick = (tag: string) => {
    const cleanTag = tag.trim().replace(/^#/, '');
    if (selectedTag?.toLowerCase() === cleanTag.toLowerCase()) {
      setSelectedTag(null);
    } else {
      setSelectedTag(cleanTag);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedTag(null);
    setSearchTarget('all');
    setFilterType('all');
  };

  const isFilterActive = searchQuery.trim().length > 0 || selectedTag !== null || filterType !== 'all';

  const handleOpenEdit = (item: MediaItem) => {
    setEditingMedia(item);
    setEditTitle(item.title);
    setEditType(item.type);
    setEditUrl(item.url);
    setEditThumbnailUrl(item.thumbnailUrl);
    setEditDescription(item.description);
    setEditAlbum(item.album || '');
    setEditTagsInput(item.tags.join(', '));
    setEditIsPinned(!!item.pinned);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMedia || !editTitle.trim() || !editUrl.trim()) return;

    let ytId = editingMedia.youtubeId;
    let thumb = editThumbnailUrl.trim();

    if (editType === 'youtube') {
      const extracted = extractYouTubeId(editUrl);
      if (extracted) {
        ytId = extracted;
        if (!thumb || thumb.includes('img.youtube.com')) {
          thumb = getYouTubeThumbnail(extracted);
        }
      }
    } else if (isGoogleDriveUrl(editUrl.trim())) {
      if (!thumb || isGoogleDriveUrl(thumb)) {
        thumb = getGoogleDriveDirectImageUrl(editUrl.trim());
      }
    }

    const tags = editTagsInput
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter((t) => t.length > 0);

    onUpdateItem(editingMedia.id, {
      title: editTitle.trim(),
      type: editType,
      url: editUrl.trim(),
      thumbnailUrl: thumb || editingMedia.thumbnailUrl,
      youtubeId: ytId || '',
      description: editDescription.trim(),
      album: editAlbum.trim() || '',
      tags: tags.length > 0 ? tags : editingMedia.tags,
      pinned: editIsPinned
    });

    setEditingMedia(null);
  };

  const filteredItems = [...items]
    .filter((item) => {
      // 1. Filter by media type (all / youtube / facebook)
      if (filterType !== 'all' && item.type !== filterType) return false;

      // 2. Filter by clicked tag pill
      if (selectedTag) {
        const hasTag = item.tags.some(
          (t) => t.trim().replace(/^#/, '').toLowerCase() === selectedTag.toLowerCase()
        );
        if (!hasTag) return false;
      }

      // 3. Filter by search query (title or tag)
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase().replace(/^#/, '');
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchTags = item.tags.some((t) =>
          t.toLowerCase().replace(/^#/, '').includes(q)
        );

        if (searchTarget === 'title') {
          if (!matchTitle) return false;
        } else if (searchTarget === 'tag') {
          if (!matchTags) return false;
        } else {
          // 'all' target searches title, tag, or description
          const matchDesc = item.description?.toLowerCase().includes(q);
          if (!matchTitle && !matchTags && !matchDesc) return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      // Pinned items stay at the very top
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;

      if (sortBy === 'popular') {
        const diff = (b.likes || 0) - (a.likes || 0);
        if (diff !== 0) return diff;
      }
      return (b.date || '').localeCompare(a.date || '');
    });

  return (
    <div className="flex-1 min-h-0 flex flex-col gap-2.5 h-full overflow-hidden">
      {/* Filter Tabs, Sort Dropdown & Search Bar */}
      <div className="flex flex-col gap-2 bg-[#f4f8fa] p-2.5 rounded-lg border border-[#cde0e9] shrink-0">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2">
          {/* Segmented Filter Buttons */}
          <div className="flex items-center gap-1 bg-white p-0.5 rounded-md border border-[#c4d7e2] overflow-x-auto no-scrollbar">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 text-xs rounded font-medium transition-all shrink-0 cursor-pointer ${
                filterType === 'all'
                  ? 'bg-[#2b7294] text-white shadow-2xs font-bold'
                  : 'text-[#506c7e] hover:bg-[#eaf2f6]'
              }`}
            >
              전체 ({items.length})
            </button>
            <button
              onClick={() => setFilterType('youtube')}
              className={`px-2.5 py-1 text-xs rounded font-medium flex items-center gap-1 transition-all shrink-0 cursor-pointer ${
                filterType === 'youtube'
                  ? 'bg-red-600 text-white shadow-2xs font-bold'
                  : 'text-[#506c7e] hover:bg-[#eaf2f6]'
              }`}
            >
              <Youtube className="w-3 h-3" />
              <span>유튜브 영상</span>
            </button>
            <button
              onClick={() => setFilterType('facebook')}
              className={`px-2.5 py-1 text-xs rounded font-medium flex items-center gap-1 transition-all shrink-0 cursor-pointer ${
                filterType === 'facebook'
                  ? 'bg-blue-600 text-white shadow-2xs font-bold'
                  : 'text-[#506c7e] hover:bg-[#eaf2f6]'
              }`}
            >
              <Facebook className="w-3 h-3" />
              <span>페이스북 사진</span>
            </button>
          </div>

          {/* Right Section: Search Target Dropdown, Search Input, and Sort */}
          <div className="flex items-center gap-1.5 flex-1 md:flex-initial flex-wrap sm:flex-nowrap">
            {/* Search Target Selector: Title, Tag, All */}
            <div className="flex items-center bg-white px-2 py-1 rounded-md border border-[#bed2dc] shadow-2xs">
              <select
                value={searchTarget}
                onChange={(e) => setSearchTarget(e.target.value as 'all' | 'title' | 'tag')}
                className="bg-transparent text-xs text-[#2a3f50] font-medium outline-hidden cursor-pointer"
                title="검색 대상 선택 (제목/태그/전체)"
              >
                <option value="all">전체 (제목+태그)</option>
                <option value="title">제목 검색</option>
                <option value="tag">태그 검색</option>
              </select>
            </div>

            {/* Search Input with Clear Button */}
            <div className="relative flex-1 sm:w-52">
              <Search className="w-3.5 h-3.5 text-[#7992a2] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  searchTarget === 'title'
                    ? '제목으로 검색...'
                    : searchTarget === 'tag'
                    ? '태그 검색 (예: #노을, 라이카)...'
                    : '제목 또는 태그 검색...'
                }
                className="w-full pl-8 pr-7 py-1 bg-white border border-[#bed2dc] rounded text-xs text-[#2a3f50] placeholder:text-[#9bb1be] outline-hidden focus:border-[#2b7294] transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer"
                  title="검색어 지우기"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sort Dropdown Menu */}
            <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-md border border-[#bed2dc] shadow-2xs shrink-0">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#ff6b2b] shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'latest' | 'popular')}
                className="bg-transparent text-xs text-[#2a3f50] font-medium outline-hidden cursor-pointer"
                title="게시물 정렬 방식 선택"
              >
                <option value="latest">최신순</option>
                <option value="popular">인기순 (좋아요)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Popular Tags Quick Filter Bar */}
        {availableTags.length > 0 && (
          <div className="flex items-center gap-1.5 pt-1.5 border-t border-[#dce9f0] text-xs overflow-x-auto no-scrollbar">
            <span className="text-[11px] font-bold text-[#547388] shrink-0 flex items-center gap-1">
              <Tag className="w-3 h-3 text-[#ff6b2b]" />
              태그 필터:
            </span>

            <button
              type="button"
              onClick={() => setSelectedTag(null)}
              className={`px-2 py-0.5 text-[11px] rounded-full font-medium transition-all shrink-0 cursor-pointer ${
                selectedTag === null
                  ? 'bg-[#2b7294] text-white shadow-2xs font-bold'
                  : 'bg-white text-[#557386] hover:bg-[#e4eff5] border border-[#cde0ea]'
              }`}
            >
              #전체
            </button>

            {availableTags.slice(0, 10).map(([tag, count]) => {
              const isSelected = selectedTag?.toLowerCase() === tag.toLowerCase();
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagClick(tag)}
                  className={`px-2 py-0.5 text-[11px] rounded-full transition-all shrink-0 cursor-pointer flex items-center gap-1 ${
                    isSelected
                      ? 'bg-[#ff6b2b] text-white shadow-2xs font-bold border border-[#ff6b2b]'
                      : 'bg-white text-[#43647b] hover:bg-[#fff7ed] hover:border-[#fed7aa] border border-[#cde0ea]'
                  }`}
                  title={`#${tag} 태그 (${count}개 미디어) 필터링`}
                >
                  <span>#{tag}</span>
                  <span className={`text-[9px] px-1 rounded-full font-mono ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-[#eef5f8] text-[#6d8899]'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Active Search & Filter Feedback Banner */}
        {isFilterActive && (
          <div className="flex items-center justify-between gap-2 bg-[#fff7ed] border border-[#fed7aa] rounded px-2.5 py-1 text-xs text-[#9a3412] mt-0.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold flex items-center gap-1 text-[11px]">
                <Search className="w-3 h-3 text-[#ff6b2b]" />
                검색 조건 적용 중:
              </span>
              {searchQuery && (
                <span className="bg-white px-1.5 py-0.2 rounded border border-[#fed7aa] text-[11px]">
                  {searchTarget === 'title' ? '제목' : searchTarget === 'tag' ? '태그' : '제목+태그'}: <strong>"{searchQuery}"</strong>
                </span>
              )}
              {selectedTag && (
                <span className="bg-white px-1.5 py-0.2 rounded border border-[#fed7aa] text-[11px]">
                  태그: <strong>#{selectedTag}</strong>
                </span>
              )}
              {filterType !== 'all' && (
                <span className="bg-white px-1.5 py-0.2 rounded border border-[#fed7aa] text-[11px]">
                  유형: <strong>{filterType === 'youtube' ? '유튜브 영상' : '페이스북 사진'}</strong>
                </span>
              )}
              <span className="text-[11px] text-[#c2410c] font-medium ml-1">
                (총 {filteredItems.length}개 검색됨)
              </span>
            </div>

            <button
              type="button"
              onClick={handleResetFilters}
              className="text-[11px] text-[#ea580c] hover:text-[#9a3412] bg-white hover:bg-orange-50 px-2 py-0.5 rounded border border-[#fed7aa] font-bold flex items-center gap-1 shrink-0 transition-colors cursor-pointer shadow-2xs"
            >
              <RotateCcw className="w-3 h-3" />
              <span>검색 초기화</span>
            </button>
          </div>
        )}
      </div>

      {/* Media Grid Cards (Dedicated Red-box scrollable container) */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-retro-scrollbar pr-1">
        {filteredItems.length === 0 ? (
        <div className="py-12 text-center bg-[#fdfdfd] border border-dashed border-[#ccdbe2] rounded-lg flex flex-col items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-[#f0f5f8] flex items-center justify-center text-[#7a95a5]">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#344d5e]">
              검색 조건에 일치하는 미디어가 없습니다.
            </p>
            <p className="text-[11px] text-[#7d93a1] mt-0.5">
              검색어(제목 또는 태그)의 철자를 확인하거나 다른 검색어를 입력해보세요.
            </p>
          </div>
          {isFilterActive && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-1 px-3 py-1 bg-[#2b7294] hover:bg-[#205873] text-white rounded text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
            >
              <RotateCcw className="w-3 h-3" />
              <span>검색 초기화 (전체 보기)</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3.5">
          {filteredItems.map((item) => {
            const isGDrive = isGoogleDriveMedia(item);
            const isVideo =
              item.type === 'youtube' ||
              item.tags?.some((t) => t.includes('영상') || t.includes('비디오') || t.includes('video')) ||
              item.album?.includes('영상') ||
              item.title.toLowerCase().includes('drive') ||
              item.title.toLowerCase().includes('valley');
            const isDriveVideo = isGDrive && isVideo;
            const isDrivePhoto = isGDrive && !isVideo;
            const isRealYt = !isGDrive && item.type === 'youtube';

            const driveFileId = extractGoogleDriveFileId(item.url) || extractGoogleDriveFileId(item.thumbnailUrl);
            const imageSrc = isGDrive && driveFileId
              ? getGoogleDriveThumbnailUrl(driveFileId, 1200)
              : transformIfGoogleDriveUrl(item.thumbnailUrl);

            return (
              <div
                key={item.id}
                className="group bg-white border border-[#cddfe7] rounded-lg overflow-hidden shadow-2xs hover:shadow-md hover:border-[#adc8d6] transition-all flex flex-col relative"
              >
                {/* Pinned Ribbon */}
                {item.pinned && (
                  <div className="absolute top-2 left-2 z-10 bg-[#ff6b2b] text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-xs flex items-center gap-0.5">
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>대표작</span>
                  </div>
                )}

                {/* Thumbnail Area */}
                <div
                  className="relative aspect-video bg-[#2c3e50] overflow-hidden cursor-pointer"
                  onClick={() => {
                    if (isDriveVideo || isRealYt) {
                      setSelectedVideo(item);
                    } else {
                      setSelectedPhoto(item);
                    }
                  }}
                >
                  <img
                    src={imageSrc}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      const img = e.currentTarget;
                      if (isGDrive && driveFileId) {
                        const direct = getGoogleDriveDirectImageUrl(driveFileId);
                        if (!img.src.includes('googleusercontent')) {
                          img.src = direct;
                          return;
                        }
                      }
                      // Hide failed image so stylish Google Drive backdrop is cleanly visible
                      img.style.display = 'none';
                    }}
                  />

                  {/* Fallback styling block behind image in case image fails or loads */}
                  <div className="absolute inset-0 bg-linear-to-tr from-[#0a2318] via-[#103a28] to-[#1c5c40] flex flex-col items-center justify-center p-3 text-center -z-1">
                    {isGDrive ? (
                      <>
                        <HardDrive className="w-9 h-9 text-[#34d399] mb-1 opacity-90 animate-pulse" />
                        <span className="text-white text-xs font-bold">Google Drive {isDriveVideo ? '비디오' : '사진'}</span>
                        <span className="text-[#a7f3d0] text-[10px] mt-0.5">{isDriveVideo ? '클릭하여 동영상 재생' : '클릭하여 사진 보기'}</span>
                      </>
                    ) : isRealYt ? (
                      <Film className="w-8 h-8 text-white/40" />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-white/40" />
                    )}
                  </div>

                  {/* Overlay Play / Expand Icon */}
                  <div className="absolute inset-0 bg-black/25 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    {isDriveVideo ? (
                      <div className="w-10 h-10 rounded-full bg-[#0f9d58] text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      </div>
                    ) : isRealYt ? (
                      <div className="w-10 h-10 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      </div>
                    ) : isDrivePhoto ? (
                      <div className="w-10 h-10 rounded-full bg-[#0f9d58]/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <HardDrive className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-blue-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Facebook className="w-4 h-4 fill-current" />
                      </div>
                    )}
                  </div>

                  {/* Type Badge & Album */}
                  <div className="absolute bottom-2 right-2 flex items-center gap-1">
                    {item.album && (
                      <span className="bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded backdrop-blur-xs font-medium">
                        {item.album}
                      </span>
                    )}
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded text-white flex items-center gap-1 shadow-xs ${
                        isGDrive
                          ? 'bg-[#0f9d58]'
                          : isRealYt
                          ? 'bg-red-600'
                          : 'bg-blue-600'
                      }`}
                    >
                      {isGDrive ? (
                        <>
                          <HardDrive className="w-2.5 h-2.5" />
                          <span>Google Drive</span>
                        </>
                      ) : isRealYt ? (
                        'YouTube 영상'
                      ) : (
                        'Facebook 사진'
                      )}
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h4
                      className="text-xs sm:text-sm font-bold text-[#1f374a] line-clamp-2 leading-snug break-keep break-words group-hover:text-[#2b7294] transition-colors"
                      title={item.title}
                    >
                      {item.title}
                    </h4>

                    <p className="mt-1.5 text-[11px] sm:text-xs text-[#556e80] line-clamp-2 leading-relaxed break-keep break-words">
                      {item.description}
                    </p>

                    {/* Tags (Clickable to filter) */}
                    <div className="mt-2 flex flex-wrap gap-1">
                      {(item.tags || []).map((t, idx) => {
                        let cleanTag = t.trim().replace(/^#/, '');
                        // If it's a Google Drive video/item, fix any mistaken '유튜브' tag to '구글드라이브'
                        if (isGDrive && (cleanTag === '유튜브' || cleanTag === 'youtube')) {
                          cleanTag = '구글드라이브';
                        }
                        const isTagActive =
                          selectedTag?.toLowerCase() === cleanTag.toLowerCase() ||
                          (searchQuery.trim().length > 0 &&
                            searchQuery.trim().toLowerCase().replace(/^#/, '') === cleanTag.toLowerCase());

                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTagClick(cleanTag);
                            }}
                            className={`text-[10px] sm:text-[11px] px-1.5 py-0.5 rounded border transition-all cursor-pointer break-keep ${
                              isTagActive
                                ? 'bg-[#ff6b2b] text-white border-[#ff6b2b] font-bold shadow-2xs'
                                : 'text-[#42647c] bg-[#eef4f7] border-[#d6e3ea] hover:bg-[#fff7ed] hover:border-[#fed7aa] hover:text-[#ea580c]'
                            }`}
                            title={`클릭하여 #${cleanTag} 태그 검색`}
                          >
                            #{cleanTag}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Card Footer: Metadata & Actions */}
                  <div className="mt-3 pt-2 border-t border-[#e2edf2] flex items-center justify-between text-[11px] text-[#6d8494]">
                    <div className="flex items-center gap-2 font-mono">
                      <span>{item.date}</span>
                      <span>·</span>
                      <span className="flex items-center gap-0.5">
                        <Eye className="w-3 h-3" />
                        {item.views.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Like button */}
                      <button
                        onClick={() => onToggleLike(item.id)}
                        className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#fff0f3] text-[#e63946] border border-[#ffccd5] hover:bg-[#ffe3e8] active:scale-95 transition-all"
                        title="좋아요"
                      >
                        <Heart className="w-3 h-3 fill-current" />
                        <span className="font-mono text-[10px] font-bold">{item.likes}</span>
                      </button>

                      {/* Direct External Link */}
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="p-1 rounded text-[#597587] hover:text-[#1d3546] hover:bg-[#e8f1f5] transition-colors"
                        title="원본 링크 열기"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>

                      {/* Admin Tools: Pin, Edit & Delete */}
                      {isAdmin && (
                        <>
                          <button
                            onClick={() => onTogglePin(item.id)}
                            className={`p-1 rounded transition-colors ${
                              item.pinned ? 'text-[#ff6b2b] bg-[#fff2ec]' : 'text-[#8da4b3] hover:text-[#ff6b2b]'
                            }`}
                            title={item.pinned ? '대표작 해제' : '대표작 지정'}
                          >
                            <Pin className="w-3 h-3 fill-current" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1 rounded text-[#8da4b3] hover:text-[#2b7294] transition-colors cursor-pointer"
                            title="내용 수정하기"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setItemToDelete(item);
                            }}
                            className="p-1 rounded text-[#8da4b3] hover:text-red-600 transition-colors cursor-pointer"
                            title="삭제 (관리자)"
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

      {/* YouTube Modal Player */}
      {selectedVideo && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setSelectedVideo(null)}
        >
          <div
            className="bg-white border-2 border-[#ff6b2b] rounded-xl max-w-2xl w-full overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-[#f7fafc] px-3.5 py-2.5 border-b border-[#d8e5ec] flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {isGoogleDriveMedia(selectedVideo) ? (
                  <span className="px-2 py-0.5 bg-[#0f9d58] text-white text-[11px] font-bold rounded flex items-center gap-1 shrink-0 shadow-2xs">
                    <HardDrive className="w-3 h-3" />
                    Google Drive 비디오
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-red-600 text-white text-[11px] font-bold rounded shrink-0">
                    YouTube 플레이어
                  </span>
                )}
                <h3 className="text-xs sm:text-sm font-bold text-[#1f374a] break-keep line-clamp-1 sm:line-clamp-2 leading-tight flex-1">
                  {selectedVideo.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedVideo(null)}
                className="w-6 h-6 flex items-center justify-center rounded-full text-[#6d8494] hover:bg-[#e4eff4] text-sm font-bold shrink-0 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Embedded Player */}
            <div className="relative aspect-video bg-black">
              {selectedVideo.youtubeId ? (
                <iframe
                  src={getYouTubeEmbedUrl(selectedVideo.youtubeId)}
                  title={selectedVideo.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : isGoogleDriveMedia(selectedVideo) ? (
                (() => {
                  const driveId = extractGoogleDriveFileId(selectedVideo.url) || extractGoogleDriveFileId(selectedVideo.thumbnailUrl);
                  return driveId ? (
                    <iframe
                      src={`https://drive.google.com/file/d/${driveId}/preview`}
                      title={selectedVideo.title}
                      className="w-full h-full border-0"
                      allow="autoplay; encrypted-media"
                      allowFullScreen
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-white p-4 text-center">
                      <HardDrive className="w-10 h-10 text-[#34d399] mb-2" />
                      <p className="text-sm font-bold">Google Drive 동영상</p>
                      <a
                        href={selectedVideo.url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 px-4 py-1.5 bg-[#0f9d58] hover:bg-[#0b7a44] text-white rounded text-xs font-bold inline-flex items-center gap-1.5 shadow-xs"
                      >
                        <HardDrive className="w-3.5 h-3.5" />
                        Google Drive에서 시청하기
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  );
                })()
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-white p-4 text-center">
                  <p className="text-sm font-bold">외부 영상 링크</p>
                  <a
                    href={selectedVideo.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 px-4 py-1.5 bg-red-600 text-white rounded text-xs font-bold inline-flex items-center gap-1.5"
                  >
                    YouTube에서 시청하기
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-[#fafcfd] text-xs text-[#486375] flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1 mr-2 min-w-0">
                <p className="text-[11px] truncate">{selectedVideo.description}</p>
                {isGoogleDriveMedia(selectedVideo) && (
                  <a
                    href={selectedVideo.url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2 py-0.5 bg-[#0f9d58] hover:bg-[#0b7a44] text-white rounded text-[10px] font-bold inline-flex items-center gap-1 shrink-0 shadow-2xs"
                  >
                    <HardDrive className="w-2.5 h-2.5" />
                    <span>Google Drive 원본</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {isAdmin && (
                  <>
                    <button
                      onClick={() => {
                        const item = selectedVideo;
                        setSelectedVideo(null);
                        handleOpenEdit(item);
                      }}
                      className="px-2.5 py-1 bg-white border border-[#b8ced8] text-[#2b7294] font-medium rounded text-[11px] flex items-center gap-1 hover:bg-[#e8f2f6] cursor-pointer"
                      title="영상 정보 수정"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>수정</span>
                    </button>
                    <button
                      onClick={() => {
                        const item = selectedVideo;
                        setSelectedVideo(null);
                        setItemToDelete(item);
                      }}
                      className="px-2.5 py-1 bg-white border border-[#ffccd5] text-red-600 font-medium rounded text-[11px] flex items-center gap-1 hover:bg-[#fff5f5] cursor-pointer"
                      title="영상 삭제"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>삭제</span>
                    </button>
                  </>
                )}
                <a
                  href={selectedVideo.url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 bg-white border border-[#b8ced8] text-[#2b7294] font-medium rounded text-[11px] flex items-center gap-1 hover:bg-[#e8f2f6] shrink-0"
                >
                  <span>새 탭에서 열기</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Facebook Photo Viewer Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="bg-white border-2 border-[#1877f2] rounded-xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-[#f0f4fa] px-3.5 py-2.5 border-b border-[#c8d9e6] flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span
                  className={`px-2 py-0.5 text-white text-[11px] font-bold rounded flex items-center gap-1 shrink-0 ${
                    isGoogleDriveUrl(selectedPhoto.url) || isGoogleDriveUrl(selectedPhoto.thumbnailUrl)
                      ? 'bg-[#0f9d58]'
                      : 'bg-[#1877f2]'
                  }`}
                >
                  {isGoogleDriveUrl(selectedPhoto.url) || isGoogleDriveUrl(selectedPhoto.thumbnailUrl) ? (
                    <>
                      <HardDrive className="w-3 h-3" />
                      구글 드라이브 사진
                    </>
                  ) : (
                    <>
                      <Facebook className="w-3 h-3 fill-current" />
                      페이스북 사진
                    </>
                  )}
                </span>
                <h3 className="text-xs sm:text-sm font-bold text-[#1f374a] break-keep line-clamp-1 sm:line-clamp-2 leading-tight flex-1">
                  {selectedPhoto.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="w-6 h-6 flex items-center justify-center rounded-full text-[#6d8494] hover:bg-[#e4eff4] text-sm font-bold shrink-0 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* High-res Image preview */}
            <div className="bg-[#0f172a] flex items-center justify-center min-h-[260px] max-h-[60vh] overflow-hidden">
              <img
                src={transformIfGoogleDriveUrl(selectedPhoto.thumbnailUrl)}
                alt={selectedPhoto.title}
                referrerPolicy="no-referrer"
                className="max-h-[60vh] w-auto object-contain"
                onError={(e) => {
                  handleGoogleDriveImageError(e.currentTarget, selectedPhoto.thumbnailUrl);
                }}
              />
            </div>

            {/* Photo description and link to Facebook */}
            <div className="p-3.5 bg-white border-t border-[#e2edf2] flex flex-col gap-2">
              <p className="text-xs text-[#2b4152] leading-relaxed">
                {selectedPhoto.description}
              </p>
              <div className="flex items-center justify-between pt-1 text-[11px] text-[#6d8494]">
                <div className="flex items-center gap-2">
                  <span>등록일: {selectedPhoto.date}</span>
                  <span>·</span>
                  <span>좋아요 {selectedPhoto.likes}개</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {isAdmin && (
                    <>
                      <button
                        onClick={() => {
                          const item = selectedPhoto;
                          setSelectedPhoto(null);
                          handleOpenEdit(item);
                        }}
                        className="px-2.5 py-1 bg-white border border-[#b8ced8] text-[#2b7294] font-medium rounded text-xs flex items-center gap-1 hover:bg-[#e8f2f6] cursor-pointer"
                        title="사진 정보 수정"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>수정</span>
                      </button>
                      <button
                        onClick={() => {
                          const item = selectedPhoto;
                          setSelectedPhoto(null);
                          setItemToDelete(item);
                        }}
                        className="px-2.5 py-1 bg-white border border-[#ffccd5] text-red-600 font-medium rounded text-xs flex items-center gap-1 hover:bg-[#fff5f5] cursor-pointer"
                        title="사진 삭제"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>삭제</span>
                      </button>
                    </>
                  )}
                  {isGoogleDriveUrl(selectedPhoto.url) ? (
                    <a
                      href={selectedPhoto.url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1 bg-[#0f9d58] hover:bg-[#0b7a44] text-white font-medium rounded text-xs flex items-center gap-1 shadow-2xs"
                    >
                      <HardDrive className="w-3 h-3" />
                      <span>구글 드라이브 원본 보기</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <a
                      href={selectedPhoto.url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1 bg-[#1877f2] hover:bg-[#1567d3] text-white font-medium rounded text-xs flex items-center gap-1 shadow-2xs"
                    >
                      <Facebook className="w-3 h-3 fill-current" />
                      <span>페이스북 원본 게시물 보기</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Media Modal */}
      {editingMedia && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn"
          onClick={() => setEditingMedia(null)}
        >
          <div
            className="bg-white border-2 border-[#2b7294] rounded-xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-4 flex flex-col gap-3.5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-2 border-b border-[#e2edf2]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#2b7294] text-white flex items-center justify-center shadow-xs">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1f374a]">
                    사진 &amp; 영상 콘텐츠 정보 수정
                  </h3>
                  <p className="text-[11px] text-[#6d8494]">
                    등록된 영상 또는 사진의 제목, 설명, 앨범명, 링크 및 썸네일을 수정합니다.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setEditingMedia(null)}
                className="w-6 h-6 flex items-center justify-center rounded-full text-[#6d8494] hover:bg-[#e4eff4] text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Thumbnail Preview Banner */}
            <div className="flex items-center gap-3 p-2 bg-[#f4f8fa] border border-[#d2e2eb] rounded-lg">
              <div className="w-20 h-12 bg-black rounded overflow-hidden shrink-0 flex items-center justify-center">
                <img
                  src={transformIfGoogleDriveUrl(editThumbnailUrl || editingMedia.thumbnailUrl)}
                  alt="미리보기"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    handleGoogleDriveImageError(e.currentTarget, editThumbnailUrl || editingMedia.thumbnailUrl);
                  }}
                />
              </div>
              <div className="text-[11px] text-[#4d6678] min-w-0 flex-1">
                <span className="font-bold text-[#203a4c] block truncate">{editTitle || '제목 없음'}</span>
                <span className="text-[10px] text-[#718c9e] font-mono block">
                  {isGoogleDriveUrl(editUrl)
                    ? '구글 드라이브 사진'
                    : editType === 'youtube'
                    ? '유튜브 비디오'
                    : '페이스북 사진'}{' '}
                  · 등록일: {editingMedia.date}
                </span>
              </div>
            </div>

            {/* Edit Form */}
            <form onSubmit={handleSaveEdit} className="flex flex-col gap-3">
              {/* Title & Type */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#2a3f50] mb-1">
                    콘텐츠 제목 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="제목을 입력하세요"
                    className="w-full p-2 bg-white border border-[#bed2dc] rounded text-xs text-[#2a3f50] focus:border-[#2b7294] outline-hidden font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2a3f50] mb-1">
                    미디어 종류
                  </label>
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value as MediaType)}
                    className="w-full p-2 bg-white border border-[#bed2dc] rounded text-xs text-[#2a3f50] focus:border-[#2b7294] outline-hidden font-medium"
                  >
                    <option value="youtube">유튜브 영상</option>
                    <option value="facebook">페이스북 사진</option>
                  </select>
                </div>
              </div>

              {/* URL */}
              <div>
                <label className="block text-xs font-bold text-[#2a3f50] mb-1">
                  원본 링크 URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={editUrl}
                  onChange={(e) => setEditUrl(e.target.value)}
                  placeholder="https://www.youtube.com/... 또는 https://www.facebook.com/..."
                  className="w-full p-2 bg-white border border-[#bed2dc] rounded text-xs text-[#2a3f50] focus:border-[#2b7294] outline-hidden font-mono"
                  required
                />
              </div>

              {/* Thumbnail URL & Album */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-[#2a3f50] mb-1">
                    썸네일 이미지 주소 (URL)
                  </label>
                  <input
                    type="url"
                    value={editThumbnailUrl}
                    onChange={(e) => setEditThumbnailUrl(e.target.value)}
                    placeholder="이미지 주소 URL (미입력 시 기존 유지)"
                    className="w-full p-2 bg-white border border-[#bed2dc] rounded text-xs text-[#2a3f50] focus:border-[#2b7294] outline-hidden font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2a3f50] mb-1">
                    앨범 / 카테고리명
                  </label>
                  <input
                    type="text"
                    value={editAlbum}
                    onChange={(e) => setEditAlbum(e.target.value)}
                    placeholder="예: 시네마틱 필름, 서울 스냅, 계절의 기록"
                    className="w-full p-2 bg-white border border-[#bed2dc] rounded text-xs text-[#2a3f50] focus:border-[#2b7294] outline-hidden"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-[#2a3f50] mb-1">
                  상세 설명 및 소개글
                </label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={2}
                  placeholder="영상이나 사진의 촬영 배경, 비하인드 스토리, 사용 장비 등을 적어주세요."
                  className="w-full p-2 bg-white border border-[#bed2dc] rounded text-xs text-[#2a3f50] focus:border-[#2b7294] outline-hidden resize-none leading-relaxed"
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
                    value={editTagsInput}
                    onChange={(e) => setEditTagsInput(e.target.value)}
                    placeholder="시네마틱, 필름스냅, 서울, 4K"
                    className="w-full p-1.5 bg-white border border-[#bed2dc] rounded text-xs text-[#2a3f50]"
                  />
                </div>

                <label className="flex items-center gap-1.5 cursor-pointer mt-2 sm:mt-4 text-xs font-medium text-[#2d4253]">
                  <input
                    type="checkbox"
                    checked={editIsPinned}
                    onChange={(e) => setEditIsPinned(e.target.checked)}
                    className="accent-[#ff6b2b]"
                  />
                  <span>대표작(상단 고정)으로 설정</span>
                </label>
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#e2edf2]">
                <button
                  type="button"
                  onClick={() => setEditingMedia(null)}
                  className="px-3 py-1.5 bg-white border border-[#bed2dc] text-[#556e80] rounded text-xs font-medium"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#2b7294] hover:bg-[#205b77] text-white rounded text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>수정 내용 저장</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setItemToDelete(null)}
        >
          <div
            className="bg-white border-2 border-red-500 rounded-xl max-w-sm w-full p-4 shadow-2xl flex flex-col gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 text-red-600 font-bold text-sm">
              <Trash2 className="w-4 h-4" />
              <span>미디어 콘텐츠 삭제 확인</span>
            </div>

            <div className="p-2.5 bg-[#fff5f5] border border-[#fed7d7] rounded text-xs text-[#2d3748] flex flex-col gap-1.5">
              <p className="font-bold text-[#9b2c2c] truncate">
                "{itemToDelete.title}"
              </p>
              <p className="text-[11px] text-[#742a2a] leading-relaxed">
                이 미디어를 정말 삭제하시겠습니까?
                <br />
                삭제하면 모든 단말기 및 클라우드 데이터베이스에서 즉시 삭제되며 복구할 수 없습니다.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1 border-t border-[#edf2f7]">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="px-3 py-1.5 bg-white border border-[#cbd5e0] text-[#4a5568] rounded text-xs font-medium hover:bg-[#f7fafc] cursor-pointer"
              >
                취소
              </button>
              <button
                type="button"
                onClick={() => {
                  const id = itemToDelete.id;
                  setItemToDelete(null);
                  onDeleteItem(id);
                }}
                className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>삭제하기</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
