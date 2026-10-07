import React from 'react';
import { GuestbookEntry, RetroSticker } from '../types';
import { RETRO_STICKERS, calculateStickerStats, StickerStatItem } from '../data/retroStickers';
import { RetroStickerBadge } from './RetroStickerBadge';
import { Flame, Trophy, Library, ArrowRight, Sparkles, TrendingUp, Check } from 'lucide-react';

interface PopularStickerStatsProps {
  entries: GuestbookEntry[];
  selectedSticker: RetroSticker | null;
  onSelectSticker: (sticker: RetroSticker) => void;
  onOpenLibrary: () => void;
}

export const PopularStickerStats: React.FC<PopularStickerStatsProps> = ({
  entries,
  selectedSticker,
  onSelectSticker,
  onOpenLibrary
}) => {
  const { stats, totalUsage, topSticker } = calculateStickerStats(entries, RETRO_STICKERS);
  const top5 = stats.slice(0, 5);

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <span className="w-5 h-5 rounded-full bg-amber-400 text-amber-950 font-black text-[11px] flex items-center justify-center shadow-xs">
            1
          </span>
        );
      case 2:
        return (
          <span className="w-5 h-5 rounded-full bg-slate-300 text-slate-800 font-black text-[11px] flex items-center justify-center shadow-xs">
            2
          </span>
        );
      case 3:
        return (
          <span className="w-5 h-5 rounded-full bg-amber-600 text-white font-black text-[11px] flex items-center justify-center shadow-xs">
            3
          </span>
        );
      default:
        return (
          <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-bold text-[11px] flex items-center justify-center border border-slate-200">
            {rank}
          </span>
        );
    }
  };

  return (
    <div className="bg-[#fcfefe] border border-[#cbe1ec] rounded-xl p-3.5 shadow-2xs mb-4">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#e2edf3]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#ff6b2b] text-white flex items-center justify-center text-xs shadow-2xs">
            <Flame className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-[#1f3a52] flex items-center gap-1.5">
              <span>인기 스티커 랭킹 TOP 5</span>
              <span className="text-[10px] bg-[#fff0ea] text-[#d95213] border border-[#ffcdb5] px-1.5 py-0.2 rounded font-semibold">
                실시간 집계
              </span>
            </h4>
            <p className="text-[10px] text-[#718898]">
              방문객들이 방명록에 가장 많이 남긴 인기 레트로 스티커 통계입니다.
            </p>
          </div>
        </div>

        {/* Action: Open Sticker Library */}
        <button
          type="button"
          onClick={onOpenLibrary}
          className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1 bg-white hover:bg-[#f0f6fa] text-[#2b7294] hover:text-[#184d66] border border-[#bcd3e0] rounded-md text-xs font-bold transition-all shadow-2xs cursor-pointer shrink-0"
        >
          <Library className="w-3.5 h-3.5 text-[#ff6b2b]" />
          <span>전체 스티커 라이브러리 (24종)</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-3 gap-2 py-2.5">
        <div className="bg-[#fff9f5] border border-[#ffd8c4] rounded-lg p-2 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] text-[#a4532b] font-medium flex items-center gap-0.5">
            <Trophy className="w-3 h-3 text-[#ff6b2b]" />
            1위 인기 스티커
          </span>
          <span className="text-xs font-bold text-[#e05619] truncate max-w-full mt-0.5">
            {topSticker?.label || '왔다감! 🐾'}
          </span>
        </div>

        <div className="bg-[#f0f7fb] border border-[#cbe2ef] rounded-lg p-2 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] text-[#486f8a] font-medium flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3 text-[#2b7294]" />
            누적 스티커 반응수
          </span>
          <span className="text-xs font-bold text-[#1f3a52] mt-0.5">
            {totalUsage}회
          </span>
        </div>

        <div className="bg-[#f8fafc] border border-[#d8e5ec] rounded-lg p-2 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] text-[#5e7889] font-medium flex items-center gap-0.5">
            <Sparkles className="w-3 h-3 text-[#ea833a]" />
            보유 스티커 라이브러리
          </span>
          <span className="text-xs font-bold text-[#1f3a52] mt-0.5">
            총 {RETRO_STICKERS.length}종
          </span>
        </div>
      </div>

      {/* Top 5 Stickers List */}
      <div className="flex flex-col gap-1.5 pt-1">
        {top5.map((item) => {
          const isSelected = selectedSticker?.id === item.sticker.id;
          return (
            <div
              key={item.sticker.id}
              className={`flex items-center justify-between p-2 rounded-lg border transition-all ${
                isSelected
                  ? 'bg-[#fff5ee] border-[#ff8c4b] ring-1 ring-[#ff8c4b]/30 shadow-2xs'
                  : 'bg-white border-[#e0ecf2] hover:bg-[#fafcfe] hover:border-[#bcd3e0]'
              }`}
            >
              {/* Left: Rank + Sticker Preview + Name */}
              <div className="flex items-center gap-2 min-w-0">
                {getRankBadge(item.rank)}
                <div className="shrink-0">
                  <RetroStickerBadge sticker={item.sticker} size="sm" />
                </div>
                <div className="hidden sm:flex flex-col min-w-0">
                  <span className="text-[11px] font-bold text-[#233c4f] truncate">
                    {item.sticker.name}
                  </span>
                  <span className="text-[9px] text-[#7d95a5] truncate">
                    {item.sticker.subText}
                  </span>
                </div>
              </div>

              {/* Right: Usage count + Percentage Progress Bar + Quick Select Button */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="flex flex-col items-end min-w-[70px]">
                  <span className="text-[11px] font-bold text-[#1f3a52]">
                    {item.count}회 <span className="text-[10px] text-[#718898] font-normal">({item.percentage}%)</span>
                  </span>
                  <div className="w-16 h-1.5 bg-[#e4edf2] rounded-full overflow-hidden mt-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        item.rank === 1
                          ? 'bg-[#ff6b2b]'
                          : item.rank === 2
                          ? 'bg-[#3b82f6]'
                          : item.rank === 3
                          ? 'bg-[#10b981]'
                          : 'bg-[#8ba3b3]'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(10, item.percentage * 4))}%` }}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectSticker(item.sticker)}
                  className={`px-2 py-1 rounded text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    isSelected
                      ? 'bg-[#ff6b2b] text-white shadow-2xs'
                      : 'bg-[#f0f6fa] hover:bg-[#ffebe1] text-[#2b7294] hover:text-[#d95213] border border-[#cbe1ed]'
                  }`}
                  title="이 인기 스티커를 방명록에 바로 첨부합니다"
                >
                  {isSelected ? (
                    <>
                      <Check className="w-3 h-3" />
                      <span>선택됨</span>
                    </>
                  ) : (
                    <span>첨부하기</span>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
