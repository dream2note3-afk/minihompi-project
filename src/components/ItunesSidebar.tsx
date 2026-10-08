import React, { useState, useMemo } from 'react';
import { MyCdAlbum, CdFilterType } from '../types';
import {
  Music,
  Disc3,
  Star,
  Heart,
  Pin,
  ChevronDown,
  ChevronRight,
  Search,
  X,
  ArrowUpDown,
  Shuffle,
  Plus,
  Download,
  ListMusic,
  Radio
} from 'lucide-react';

export interface ItunesSidebarProps {
  albums: MyCdAlbum[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedGenre: string;
  onSelectGenre: (genre: string) => void;
  filterType: CdFilterType;
  onFilterTypeChange: (type: CdFilterType) => void;
  sortOption: 'newest' | 'year_desc' | 'year_asc' | 'song_asc' | 'artist_asc' | 'rating' | 'plays';
  onSortOptionChange: (sort: 'newest' | 'year_desc' | 'year_asc' | 'song_asc' | 'artist_asc' | 'rating' | 'plays') => void;
  onOpenAddModal?: () => void;
  onOpenBackupModal?: () => void;
  onShufflePlay?: () => void;
  isAdmin?: boolean;
}

export const ItunesSidebar: React.FC<ItunesSidebarProps> = ({
  albums,
  searchQuery,
  onSearchChange,
  selectedGenre,
  onSelectGenre,
  filterType,
  onFilterTypeChange,
  sortOption,
  onSortOptionChange,
  onOpenAddModal,
  onOpenBackupModal,
  onShufflePlay,
  isAdmin = false
}) => {
  // Accordion state for genre sub-menu (iTunes style)
  const [isGenreExpanded, setIsGenreExpanded] = useState<boolean>(true);

  // Dynamically extract all registered genres from current albums with their counts
  const genreStats = useMemo(() => {
    const counts: Record<string, number> = {};
    albums.forEach((album) => {
      const g = (album.genre || '기타').trim();
      counts[g] = (counts[g] || 0) + 1;
    });

    // Sort by count descending, then alphabetically
    return Object.entries(counts).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }, [albums]);

  // Counts for library sections
  const fiveStarsCount = useMemo(() => albums.filter((a) => a.rating >= 5).length, [albums]);
  const favoritesCount = useMemo(() => albums.filter((a) => a.isFavorite).length, [albums]);
  const pinnedCount = useMemo(() => albums.filter((a) => a.pinned).length, [albums]);
  const unlinkedCount = useMemo(() => albums.filter((a) => !a.audioUrl || a.audioUrl.trim() === '').length, [albums]);

  return (
    <div className="w-full flex flex-col gap-2.5 text-[#1e293b] select-none">
      {/* iTunes Section Header */}
      <div className="px-2 py-1.5 bg-linear-to-r from-[#2e1065] via-[#4c1d95] to-[#6b21a8] text-white rounded-lg shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-1.5 min-w-0">
          <Disc3 className="w-3.5 h-3.5 text-[#c4b5fd] animate-spin" style={{ animationDuration: '8s' }} />
          <span className="text-xs font-bold tracking-tight truncate">음악 보관함 (Library)</span>
        </div>
        <span className="text-[10px] font-mono text-purple-200 bg-white/15 px-1.5 py-0.5 rounded-full shrink-0">
          {albums.length}개
        </span>
      </div>

      {/* 1. 보관함 기본 항목 (All, 5-Star, Favorites, Pinned) */}
      <div className="flex flex-col gap-0.5">
        <div className="px-2 py-0.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
          라이브러리
        </div>

        {/* 전체 앨범 */}
        <button
          type="button"
          onClick={() => {
            onFilterTypeChange('all');
            onSelectGenre('all');
          }}
          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors cursor-pointer text-left ${
            filterType === 'all' && selectedGenre === 'all'
              ? 'bg-[#7c3aed] text-white font-bold shadow-xs'
              : 'hover:bg-[#f1f5f9] text-[#334155]'
          }`}
        >
          <div className="flex items-center gap-2">
            <Music className={`w-3.5 h-3.5 ${filterType === 'all' && selectedGenre === 'all' ? 'text-white' : 'text-[#7c3aed]'}`} />
            <span>전체 음반</span>
          </div>
          <span
            className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
              filterType === 'all' && selectedGenre === 'all'
                ? 'bg-white/20 text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {albums.length}
          </span>
        </button>

        {/* 5성급 명반 */}
        <button
          type="button"
          onClick={() => {
            onFilterTypeChange('five_stars');
            onSelectGenre('all');
          }}
          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors cursor-pointer text-left ${
            filterType === 'five_stars'
              ? 'bg-[#ca8a04] text-white font-bold shadow-xs'
              : 'hover:bg-[#fefce8] text-[#854d0e]'
          }`}
        >
          <div className="flex items-center gap-2">
            <Star className={`w-3.5 h-3.5 fill-current ${filterType === 'five_stars' ? 'text-white' : 'text-[#eab308]'}`} />
            <span>5성급 명반</span>
          </div>
          <span
            className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
              filterType === 'five_stars' ? 'bg-white/20 text-white' : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            {fiveStarsCount}
          </span>
        </button>

        {/* 즐겨찾기 */}
        <button
          type="button"
          onClick={() => {
            onFilterTypeChange('favorites');
            onSelectGenre('all');
          }}
          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors cursor-pointer text-left ${
            filterType === 'favorites'
              ? 'bg-[#e11d48] text-white font-bold shadow-xs'
              : 'hover:bg-[#fff1f2] text-[#9f1239]'
          }`}
        >
          <div className="flex items-center gap-2">
            <Heart className={`w-3.5 h-3.5 fill-current ${filterType === 'favorites' ? 'text-white' : 'text-[#f43f5e]'}`} />
            <span>즐겨찾기 음원</span>
          </div>
          <span
            className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
              filterType === 'favorites' ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-800'
            }`}
          >
            {favoritesCount}
          </span>
        </button>

        {/* 대표작 */}
        <button
          type="button"
          onClick={() => {
            onFilterTypeChange('pinned');
            onSelectGenre('all');
          }}
          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors cursor-pointer text-left ${
            filterType === 'pinned'
              ? 'bg-[#2563eb] text-white font-bold shadow-xs'
              : 'hover:bg-[#eff6ff] text-[#1e40af]'
          }`}
        >
          <div className="flex items-center gap-2">
            <Pin className={`w-3.5 h-3.5 fill-current ${filterType === 'pinned' ? 'text-white' : 'text-[#3b82f6]'}`} />
            <span>대표작 지정곡</span>
          </div>
          <span
            className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
              filterType === 'pinned' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-800'
            }`}
          >
            {pinnedCount}
          </span>
        </button>

        {/* R2 링크 미등록곡 (사용자가 링크 수작업 등록할 목록) */}
        <button
          type="button"
          onClick={() => {
            onFilterTypeChange('unlinked');
            onSelectGenre('all');
          }}
          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors cursor-pointer text-left ${
            filterType === 'unlinked'
              ? 'bg-[#ea580c] text-white font-bold shadow-xs'
              : 'hover:bg-[#fff7ed] text-[#c2410c]'
          }`}
          title="Cloudflare R2 스트리밍 링크가 아직 등록되지 않은 소장 음원 목록"
        >
          <div className="flex items-center gap-2">
            <Radio className={`w-3.5 h-3.5 ${filterType === 'unlinked' ? 'text-white' : 'text-[#ea580c]'}`} />
            <span className="truncate">R2 링크 미등록곡</span>
          </div>
          <span
            className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
              filterType === 'unlinked'
                ? 'bg-white/20 text-white'
                : unlinkedCount > 0
                ? 'bg-amber-100 text-amber-900 font-bold animate-pulse'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            {unlinkedCount}
          </span>
        </button>
      </div>

      {/* 2. 장르 (iTunes style: 클릭 시 현재 등록된 모든 장르를 읽어서 하위 메뉴로 출력) */}
      <div className="flex flex-col gap-0.5 border-t border-[#e2e8f0] pt-2">
        <button
          type="button"
          onClick={() => setIsGenreExpanded(!isGenreExpanded)}
          className="w-full flex items-center justify-between px-2 py-1 rounded hover:bg-[#f1f5f9] text-xs font-bold text-[#334155] cursor-pointer transition-colors"
          title="클릭하여 등록된 장르 하위 메뉴 접기/펼치기"
        >
          <div className="flex items-center gap-1.5 text-purple-700">
            <ListMusic className="w-3.5 h-3.5" />
            <span>장르 (Genres)</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-gray-500 font-normal">
            <span>{genreStats.length}개</span>
            {isGenreExpanded ? (
              <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
            )}
          </div>
        </button>

        {/* 장르 하위 메뉴 목록 (아이튠즈 스타일) */}
        {isGenreExpanded && (
          <div className="mt-0.5 pl-2 ml-1.5 border-l-2 border-purple-200 flex flex-col gap-0.5 max-h-44 overflow-y-auto custom-retro-scrollbar py-0.5">
            {/* 전체 장르 초기화 */}
            <button
              type="button"
              onClick={() => {
                onSelectGenre('all');
                onFilterTypeChange('all');
              }}
              className={`w-full flex items-center justify-between px-2 py-1 rounded text-[11px] transition-colors cursor-pointer text-left ${
                selectedGenre === 'all'
                  ? 'bg-purple-100 text-purple-900 font-bold'
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <span className="truncate">전체 장르</span>
              <span className="text-[10px] font-mono text-gray-400">({albums.length})</span>
            </button>

            {/* 현재 등록된 앨범들의 실제 장르 목록 */}
            {genreStats.map(([genre, count]) => {
              const isSelected = selectedGenre === genre;
              return (
                <button
                  key={genre}
                  type="button"
                  onClick={() => {
                    onSelectGenre(genre);
                    onFilterTypeChange('all');
                  }}
                  className={`w-full flex items-center justify-between px-2 py-1 rounded text-[11px] transition-colors cursor-pointer text-left ${
                    isSelected
                      ? 'bg-[#7c3aed] text-white font-bold shadow-2xs'
                      : 'hover:bg-purple-50 text-gray-700'
                  }`}
                  title={`${genre} (${count}곡/앨범)`}
                >
                  <span className="truncate pr-1">• {genre}</span>
                  <span
                    className={`text-[10px] font-mono px-1 py-0.1 rounded-full shrink-0 ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. 검색 및 정렬 (아이튠즈 상단 검색바를 좌측 사이드바에 통합) */}
      <div className="flex flex-col gap-1.5 border-t border-[#e2e8f0] pt-2">
        <div className="px-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
          검색 &amp; 정렬
        </div>

        {/* 검색 인풋 */}
        <div className="relative w-full">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="곡명·가수·앨범 검색..."
            className="w-full pl-8 pr-7 py-1.5 bg-[#f8fafc] border border-[#cbd5e1] rounded-lg text-xs text-[#1e293b] outline-hidden focus:border-[#7c3aed] focus:bg-white transition-all placeholder:text-gray-400"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer"
              title="검색어 지우기"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* 정렬 드롭다운 */}
        <div className="flex items-center gap-1.5 bg-[#f8fafc] border border-[#cbd5e1] rounded-lg px-2 py-1">
          <ArrowUpDown className="w-3 h-3 text-purple-600 shrink-0" />
          <select
            value={sortOption}
            onChange={(e) => onSortOptionChange(e.target.value as any)}
            className="w-full bg-transparent text-xs text-[#334155] outline-hidden cursor-pointer font-medium py-0.5"
          >
            <option value="newest">최신 등록순</option>
            <option value="year_desc">발매연도순 (최신순)</option>
            <option value="year_asc">발매연도순 (오래된순)</option>
            <option value="song_asc">노래 제목순 (가나다)</option>
            <option value="artist_asc">아티스트순 (가나다)</option>
            <option value="rating">별점 선호도순</option>
            <option value="plays">재생 횟수순</option>
          </select>
        </div>
      </div>

      {/* 4. 빠른 실행 및 등록 버튼 */}
      <div className="flex flex-col gap-1.5 border-t border-[#e2e8f0] pt-2">
        {/* 랜덤 1곡 감상 */}
        {onShufflePlay && (
          <button
            type="button"
            onClick={onShufflePlay}
            className="w-full py-1.5 px-2.5 bg-[#faf5ff] hover:bg-[#f3e8ff] text-[#6b21a8] border border-[#d8b4fe] rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer active:scale-98"
            title="소장곡 중 랜덤으로 1곡 즉시 감상"
          >
            <Shuffle className="w-3.5 h-3.5 text-[#9333ea]" />
            <span>랜덤 1곡 즉시 감상</span>
          </button>
        )}

        {/* 관리자 전용: 새 음반 등록 & 백업/복원 */}
        {isAdmin && (
          <div className="flex flex-col gap-1.5 mt-0.5">
            {onOpenAddModal && (
              <button
                type="button"
                onClick={onOpenAddModal}
                className="w-full py-1.5 px-2.5 bg-[#ff6b2b] hover:bg-[#ea580c] text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer active:scale-98"
                title="새로운 소장 CD 음반 등록"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>새 소장 CD/음원 등록</span>
              </button>
            )}

            {onOpenBackupModal && (
              <button
                type="button"
                onClick={onOpenBackupModal}
                className="w-full py-1.5 px-2 bg-white hover:bg-gray-50 text-[#475569] border border-[#cbd5e1] rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                title="데이터 백업 및 JSON 복원"
              >
                <Download className="w-3 h-3 text-purple-600" />
                <span>소장 음반 백업/복원</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* 5. 아카이브 소장 정보 카드 (기존 상단 배너 설명 문구 축약 이동) */}
      <div className="mt-1 p-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg text-center">
        <p className="text-[11px] font-bold text-[#1e293b]">
          권용우의 40년 음악 컬렉션
        </p>
        <p className="text-[10px] text-[#64748b] mt-0.5 leading-snug">
          약 4만곡 · 2,500 앨범 소장
        </p>
        <p className="text-[9px] text-purple-700 font-mono mt-1 bg-purple-50 py-0.5 rounded border border-purple-100">
          고음질 FLAC · MP3 보관
        </p>
      </div>
    </div>
  );
};
