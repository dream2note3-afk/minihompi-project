import React, { useState, useMemo } from 'react';
import { RetroSticker, GuestbookEntry } from '../types';
import { RETRO_STICKERS, RETRO_STICKER_CATEGORIES, calculateStickerStats } from '../data/retroStickers';
import { RetroStickerBadge } from './RetroStickerBadge';
import { Search, Library, X, Check, Flame, Sparkles, Tag, ArrowRight } from 'lucide-react';

interface StickerLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: GuestbookEntry[];
  selectedSticker: RetroSticker | null;
  onSelectSticker: (sticker: RetroSticker) => void;
}

export const StickerLibraryModal: React.FC<StickerLibraryModalProps> = ({
  isOpen,
  onClose,
  entries,
  selectedSticker,
  onSelectSticker
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [previewSticker, setPreviewSticker] = useState<RetroSticker | null>(
    selectedSticker || RETRO_STICKERS[0]
  );

  const { stats } = useMemo(() => calculateStickerStats(entries, RETRO_STICKERS), [entries]);

  // Map of sticker id to its rank and count
  const statsMap = useMemo(() => {
    const map = new Map<string, { rank: number; count: number; percentage: number }>();
    stats.forEach((s) => map.set(s.sticker.id, { rank: s.rank, count: s.count, percentage: s.percentage }));
    return map;
  }, [stats]);

  const filteredStickers = useMemo(() => {
    let result = [...RETRO_STICKERS];

    // Category filter
    if (selectedCategory === 'popular') {
      // Sort by popularity rank
      result.sort((a, b) => {
        const rankA = statsMap.get(a.id)?.rank || 999;
        const rankB = statsMap.get(b.id)?.rank || 999;
        return rankA - rankB;
      });
    } else if (selectedCategory !== 'all') {
      result = result.filter((s) => s.category === selectedCategory);
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter((s) => {
        return (
          s.name.toLowerCase().includes(q) ||
          s.label.toLowerCase().includes(q) ||
          (s.subText && s.subText.toLowerCase().includes(q)) ||
          (s.description && s.description.toLowerCase().includes(q)) ||
          (s.tags && s.tags.some((t) => t.toLowerCase().includes(q))) ||
          s.emoji.includes(q)
        );
      });
    }

    return result;
  }, [selectedCategory, searchQuery, statsMap]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white border-2 border-[#ff9f68] rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-[#fff9f5] border-b border-[#f3ddce] px-4 py-3 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#ff6b2b] text-white flex items-center justify-center shadow-xs">
              <Library className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#1f3a52] flex items-center gap-1.5">
                <span>방명록 레트로 스티커 라이브러리</span>
                <span className="text-[11px] bg-[#ffebe1] text-[#e05619] px-2 py-0.5 rounded-full font-bold border border-[#ffcdb8]">
                  총 {RETRO_STICKERS.length}종
                </span>
              </h3>
              <p className="text-[11px] text-[#718898]">
                2000년대 싸이월드 명대사, 아날로그 필름 스탬프, Y2K 감성 배지를 골라 방명록에 붙여보세요!
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full text-[#7a91a0] hover:bg-[#ffebe1] hover:text-[#e05619] transition-colors cursor-pointer text-sm font-bold"
            title="닫기"
          >
            ✕
          </button>
        </div>

        {/* Search & Categories Bar */}
        <div className="p-3 sm:p-4 bg-[#fbfdfd] border-b border-[#e5eef3] flex flex-col gap-2.5 shrink-0">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#8fa4b3] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="스티커 이름, 키워드 검색 (예: 퍼가요, 도토리, 35mm, BGM, 발자국 등)"
              className="w-full pl-9 pr-8 py-2 bg-white border border-[#c5d8e3] rounded-lg text-xs text-[#203a4e] placeholder:text-[#9bb1be] focus:border-[#ff6b2b] outline-hidden shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#8fa4b3] hover:text-red-500 font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
            {RETRO_STICKER_CATEGORIES.map((cat) => (
              <button
                type="button"
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 text-xs rounded-full font-medium whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                  selectedCategory === cat.id
                    ? 'bg-[#ff6b2b] text-white font-bold shadow-xs scale-102'
                    : 'bg-white text-[#557082] border border-[#d2e2ec] hover:bg-[#fff5ee] hover:border-[#ffaa78]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Body: Left grid of stickers, Right detailed preview */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 grid grid-cols-1 md:grid-cols-3 gap-3.5 bg-[#f6fafc]">
          {/* Stickers Grid (2 cols on md) */}
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {filteredStickers.length === 0 ? (
              <div className="col-span-full py-12 text-center text-xs text-[#859caa] bg-white border border-dashed border-[#ccdce4] rounded-xl">
                검색된 스티커가 없습니다. 다른 검색어로 찾아보세요! 🔍
              </div>
            ) : (
              filteredStickers.map((item) => {
                const isSelected = selectedSticker?.id === item.id;
                const isPreview = previewSticker?.id === item.id;
                const stat = statsMap.get(item.id);

                return (
                  <div
                    key={item.id}
                    onClick={() => setPreviewSticker(item)}
                    className={`group bg-white p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between relative shadow-2xs ${
                      isSelected
                        ? 'border-[#ff6b2b] ring-2 ring-[#ff6b2b]/30 bg-[#fff9f5]'
                        : isPreview
                        ? 'border-[#ffaa78] shadow-sm'
                        : 'border-[#d6e5ed] hover:border-[#adc8d6] hover:shadow-xs'
                    }`}
                  >
                    {/* Top Row: Rank Tag + Active Check */}
                    <div className="flex items-center justify-between gap-1 mb-2">
                      <div className="flex items-center gap-1">
                        {stat && stat.rank <= 3 && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-0.5">
                            <Flame className="w-2.5 h-2.5 text-amber-600 fill-current" />
                            <span>인기 {stat.rank}위</span>
                          </span>
                        )}
                        <span className="text-[10px] text-[#718898] bg-[#f0f6fa] px-1.5 py-0.2 rounded border border-[#d8e6ee]">
                          반응 {stat?.count || item.basePopularity}회
                        </span>
                      </div>

                      {isSelected && (
                        <span className="text-[10px] font-bold bg-[#ff6b2b] text-white px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                          <Check className="w-2.5 h-2.5" />
                          <span>현재 선택됨</span>
                        </span>
                      )}
                    </div>

                    {/* Sticker Visual Badge */}
                    <div className="py-2 flex items-center justify-center">
                      <RetroStickerBadge sticker={item} size="md" />
                    </div>

                    {/* Sticker Description & Tags */}
                    <div className="mt-2 pt-2 border-t border-[#edf3f6] flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#1f3a52]">{item.name}</span>
                        <span className="text-[10px] text-[#8aa1b1] font-mono">{item.emoji}</span>
                      </div>
                      <p className="text-[11px] text-[#607787] line-clamp-1">
                        {item.description || item.subText}
                      </p>
                    </div>

                    {/* Select Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectSticker(item);
                        onClose();
                      }}
                      className="mt-2.5 w-full py-1.5 bg-[#f0f7fb] hover:bg-[#ff6b2b] text-[#2b7294] hover:text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 border border-[#cde0eb] hover:border-[#ff6b2b] shadow-2xs cursor-pointer"
                    >
                      <span>이 스티커로 방명록 쓰기</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Right: Selected / Hovered Sticker Detail Preview Panel */}
          {previewSticker && (
            <div className="hidden md:flex flex-col bg-white border border-[#cbe1ec] rounded-xl p-4 shadow-sm sticky top-0 h-fit">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#1f3a52] pb-2 border-b border-[#e5eef3]">
                <Sparkles className="w-3.5 h-3.5 text-[#ff6b2b]" />
                <span>스티커 상세 정보 &amp; 미니홈피 미리보기</span>
              </div>

              {/* Large Centered Visual */}
              <div className="py-4 my-2 flex flex-col items-center justify-center bg-[#fafdfd] border border-dashed border-[#d2e4ee] rounded-xl">
                <RetroStickerBadge sticker={previewSticker} size="md" />
                <span className="text-xs font-bold text-[#1f3a52] mt-3">
                  {previewSticker.name}
                </span>
                <span className="text-[11px] text-[#718898] mt-0.5">
                  {previewSticker.subText}
                </span>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1 text-xs text-[#4d6677] mb-3">
                <span className="text-[11px] font-bold text-[#233f54]">스티커 소개:</span>
                <p className="text-[11px] leading-relaxed bg-[#f6fafc] p-2.5 rounded-lg border border-[#e2edf3]">
                  {previewSticker.description || previewSticker.subText}
                </p>
              </div>

              {/* Tags */}
              {previewSticker.tags && previewSticker.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {previewSticker.tags.map((t) => (
                    <span
                      key={t}
                      className="text-[10px] bg-[#f0f6fa] text-[#4d7087] border border-[#d2e2ec] px-1.5 py-0.2 rounded"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}

              {/* Simulated Note Preview */}
              <div className="bg-[#fffcf7] border-2 border-dashed border-[#ffcdb8] rounded-lg p-2.5 mb-4 text-xs">
                <span className="text-[10px] text-[#e05619] font-bold block mb-1">
                  📝 방명록 부착 예시:
                </span>
                <p className="text-[11px] text-[#334756] italic">
                  "영상 색감이 너무 예뻐요! 스튜디오 파이팅~"
                </p>
                <div className="mt-2 flex justify-end">
                  <RetroStickerBadge sticker={previewSticker} size="sm" />
                </div>
              </div>

              {/* Big Action Button */}
              <button
                type="button"
                onClick={() => {
                  onSelectSticker(previewSticker);
                  onClose();
                }}
                className="w-full py-2 bg-[#ff6b2b] hover:bg-[#e05619] text-white font-bold rounded-lg text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
              >
                <Check className="w-3.5 h-3.5" />
                <span>이 스티커 선택하고 글 작성하기</span>
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-[#fff9f5] border-t border-[#f3ddce] flex items-center justify-between text-xs text-[#718898] shrink-0">
          <span>
            총 <strong className="text-[#ff6b2b]">{RETRO_STICKERS.length}종</strong>의 레트로 스티커가 등록되어 있습니다.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 bg-white border border-[#bcd3df] hover:bg-[#f0f6fa] text-[#2b7294] font-bold rounded text-xs cursor-pointer shadow-2xs"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
