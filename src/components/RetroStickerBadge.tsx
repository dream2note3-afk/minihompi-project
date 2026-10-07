import React from 'react';
import { RetroSticker } from '../types';
import { Sparkles, X } from 'lucide-react';

interface RetroStickerBadgeProps {
  sticker: RetroSticker;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onRemove?: () => void;
  className?: string;
}

export const RetroStickerBadge: React.FC<RetroStickerBadgeProps> = ({
  sticker,
  size = 'md',
  interactive = false,
  onRemove,
  className = ''
}) => {
  const rotationClass = sticker.rotation || 'rotate-0';

  if (size === 'sm') {
    return (
      <div
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-dashed shadow-2xs select-none transition-transform bg-linear-to-r ${sticker.bgGradient} ${rotationClass} hover:rotate-0 hover:scale-105 ${className}`}
        style={{ borderColor: sticker.borderColor, color: sticker.textColor }}
        title={`${sticker.name}: ${sticker.subText || ''}`}
      >
        <span className="text-xs leading-none">{sticker.emoji}</span>
        <span className="text-[10px] font-bold tracking-tight whitespace-nowrap">
          {sticker.label}
        </span>
        {onRemove && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="w-3.5 h-3.5 rounded-full bg-black/10 hover:bg-red-500 hover:text-white flex items-center justify-center text-[8px] ml-0.5 cursor-pointer transition-colors"
          >
            <X className="w-2.5 h-2.5" />
          </button>
        )}
      </div>
    );
  }

  // Medium / Large display (Standard retro sticker stamp)
  return (
    <div
      className={`relative inline-flex flex-col items-center justify-center p-2 rounded-lg border-2 border-dashed shadow-xs select-none transition-all bg-linear-to-b ${sticker.bgGradient} ${rotationClass} hover:rotate-0 hover:scale-105 hover:shadow-md ${className}`}
      style={{
        borderColor: sticker.borderColor,
        color: sticker.textColor
      }}
    >
      {/* Decorative top stamp notch or ribbon accent */}
      <div
        className="absolute -top-1.5 left-1/2 -translate-x-1/2 px-1.5 py-0.2 text-[8px] font-black rounded-sm uppercase tracking-wider text-white shadow-2xs"
        style={{ backgroundColor: sticker.borderColor }}
      >
        STICKER
      </div>

      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px] font-bold shadow-xs hover:bg-red-600 transition-colors cursor-pointer z-10"
          title="스티커 첨부 취소"
        >
          ✕
        </button>
      )}

      {/* Main Sticker Content */}
      <div className="flex items-center gap-1.5 mt-0.5">
        <div className="w-7 h-7 rounded-full bg-white/80 border border-current/20 flex items-center justify-center text-base shadow-2xs shrink-0">
          {sticker.emoji}
        </div>
        <div className="flex flex-col items-start leading-tight">
          <span className="text-xs font-black tracking-tight flex items-center gap-0.5">
            <span>{sticker.label}</span>
          </span>
          {sticker.subText && (
            <span className="text-[9px] font-medium opacity-85 tracking-tighter">
              {sticker.subText}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
