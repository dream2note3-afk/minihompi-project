import React, { useState } from 'react';
import { RetroSticker } from '../types';
import { RETRO_STICKERS, RETRO_STICKER_CATEGORIES } from '../data/retroStickers';
import { RetroStickerBadge } from './RetroStickerBadge';
import { Sparkles, Stamp, Tag, X, Check, Library, ArrowRight } from 'lucide-react';

interface RetroStickerPickerProps {
  selectedSticker: RetroSticker | null;
  onSelectSticker: (sticker: RetroSticker | null) => void;
  onClose: () => void;
  onOpenLibrary?: () => void;
}

export const RetroStickerPicker: React.FC<RetroStickerPickerProps> = ({
  selectedSticker,
  onSelectSticker,
  onClose,
  onOpenLibrary
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filteredStickers = RETRO_STICKERS.filter((item) => {
    if (activeCategory === 'all') return true;
    return item.category === activeCategory;
  });

  return (
    <div className="bg-[#fffcf7] border-2 border-[#ff9f68] rounded-xl p-3.5 shadow-xl animate-fadeIn text-[#2b3a4a] relative">
      {/* Decorative Cyworld Header */}
      <div className="flex items-center justify-between border-b border-[#f3ddce] pb-2 mb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#ff6b2b] text-white flex items-center justify-center text-xs shadow-2xs">
            <Stamp className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#1f3a52] flex items-center gap-1.5">
              <span>싸이월드 레트로 감성 스티커</span>
              <span className="text-[10px] bg-[#ffebe1] text-[#e05619] px-1.5 py-0.2 rounded font-semibold border border-[#ffcdb8]">
                다이어리 &amp; 방명록 전용
              </span>
            </h4>
            <p className="text-[10px] text-[#7890a0]">
              글에 붙이고 싶은 스티커를 클릭하세요! 발자국 도장, 퍼가요, 도토리 등 감성 가득한 스탬프가 첨부됩니다.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-6 h-6 flex items-center justify-center rounded-full text-[#8299a9] hover:bg-[#ffece2] hover:text-[#e05619] transition-colors cursor-pointer text-xs font-bold"
          title="닫기"
        >
          ✕
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1 mb-2.5">
        {RETRO_STICKER_CATEGORIES.map((cat) => (
          <button
            type="button"
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-2.5 py-1 text-[11px] rounded-full font-medium whitespace-nowrap transition-all cursor-pointer ${
              activeCategory === cat.id
                ? 'bg-[#ff6b2b] text-white font-bold shadow-xs scale-102'
                : 'bg-white text-[#567183] border border-[#dce6ed] hover:bg-[#fff5ee]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Stickers Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-[220px] overflow-y-auto pr-1">
        {filteredStickers.map((item) => {
          const isSelected = selectedSticker?.id === item.id;
          return (
            <div
              key={item.id}
              onClick={() => {
                if (isSelected) {
                  onSelectSticker(null);
                } else {
                  onSelectSticker(item);
                }
              }}
              className={`group relative p-2 rounded-lg border cursor-pointer transition-all flex flex-col items-center justify-center text-center ${
                isSelected
                  ? 'border-[#ff6b2b] ring-2 ring-[#ff6b2b]/40 bg-[#fff5ee] shadow-sm scale-102'
                  : 'border-[#dfebf2] bg-white hover:border-[#ffaa78] hover:bg-[#fffaf7] hover:shadow-2xs'
              }`}
            >
              {isSelected && (
                <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#ff6b2b] text-white flex items-center justify-center shadow-xs z-10">
                  <Check className="w-2.5 h-2.5" />
                </div>
              )}

              {/* Realistic sticker thumbnail */}
              <div
                className={`w-full py-1.5 px-2 rounded-md border border-dashed flex items-center justify-center gap-1.5 bg-linear-to-b ${item.bgGradient} ${item.rotation || ''} group-hover:rotate-0 transition-transform`}
                style={{ borderColor: item.borderColor, color: item.textColor }}
              >
                <span className="text-base select-none">{item.emoji}</span>
                <span className="text-xs font-black tracking-tight">{item.label}</span>
              </div>

              <span className="text-[10px] text-[#6d8495] mt-1.5 font-medium truncate w-full">
                {item.subText || item.name}
              </span>
            </div>
          );
        })}
      </div>

      {/* Footer controls: Clear selection / Selected display */}
      <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-[#f3ddce] text-xs">
        <div className="flex items-center gap-1.5">
          {selectedSticker ? (
            <div className="flex items-center gap-1 text-[11px] text-[#e05619] font-bold">
              <span>선택됨:</span>
              <RetroStickerBadge sticker={selectedSticker} size="sm" />
            </div>
          ) : (
            <span className="text-[11px] text-[#8ea4b3]">스티커를 클릭하면 글에 바로 첨부됩니다.</span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {onOpenLibrary && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenLibrary();
              }}
              className="text-[11px] text-[#2b7294] hover:text-[#174860] hover:underline font-bold flex items-center gap-1 cursor-pointer"
            >
              <Library className="w-3.5 h-3.5 text-[#ff6b2b]" />
              <span>전체 라이브러리 (24종)</span>
            </button>
          )}
          {selectedSticker && (
            <button
              type="button"
              onClick={() => onSelectSticker(null)}
              className="text-[11px] text-[#869dae] hover:text-red-500 font-medium underline cursor-pointer"
            >
              선택 해제
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 bg-[#ff6b2b] hover:bg-[#e05619] text-white font-bold rounded-md text-[11px] shadow-2xs cursor-pointer transition-colors shrink-0"
          >
            적용 및 닫기
          </button>
        </div>
      </div>
    </div>
  );
};
