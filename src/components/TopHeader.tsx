import React from 'react';
import { RetroLogoBadge } from './RetroLogoBadge';
import { ThemePaletteId } from '../types';

interface TopHeaderProps {
  todayVisits: number;
  totalVisits: number;
  cloudSynced?: boolean;
  themePalette?: ThemePaletteId;
  onSelectTheme?: (id: ThemePaletteId) => void;
  onOpenThemeSettings?: () => void;
  isAdmin?: boolean;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  todayVisits,
  totalVisits
}) => {
  return (
    <header className="mb-1 px-1">
      <div className="flex items-center justify-between gap-2 w-full">
        {/* Left: Retro Logo Emblem Badge + Kwon Yong-woo's Title */}
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <RetroLogoBadge size="md" />
          
          {/* Kwon Yong-woo's Title */}
          <h1 className="text-sm sm:text-base md:text-lg font-bold text-[#1f3a52] tracking-tight flex items-center gap-1.5 truncate">
            <span className="truncate hover:text-[#ff6b2b] transition-colors">권용우의 행복한 인생</span>
            <span className="text-[11px] sm:text-xs font-normal text-[#5a7282] hidden sm:inline shrink-0">
              (Kwon's Happy Life)
            </span>
          </h1>
        </div>

        {/* Right: TODAY / TOTAL visitor count statistics (상단 우측으로 이동하여 한 행 절약) */}
        <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-medium text-[#4f6472] shrink-0 bg-white/80 border border-[#b8ced8] px-2.5 py-1 rounded-md shadow-2xs">
          <span className="text-[#3b5998] font-bold">TODAY</span>
          <span className="font-bold text-[#e63946] tabular-nums font-mono text-xs sm:text-sm">
            {todayVisits.toLocaleString()}
          </span>
          <span className="text-[#a0b6bf]">|</span>
          <span className="text-[#555555] font-bold">TOTAL</span>
          <span className="font-bold text-[#2b2d42] tabular-nums font-mono text-xs sm:text-sm">
            {totalVisits.toLocaleString()}
          </span>
        </div>
      </div>
    </header>
  );
};
