import React, { useState, useEffect } from 'react';
import { bgmEngine, BgmTrack, BgmPlayMode } from '../utils/audioSynth';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Music,
  FolderUp,
  Repeat,
  Repeat1,
  ListChecks,
  Disc3,
  Palette,
  Shuffle
} from 'lucide-react';
import { BgmManagerModal } from './BgmManagerModal';
import { RetroLogoBadge } from './RetroLogoBadge';
import { ThemePaletteId } from '../types';
import { RETRO_THEME_PALETTES } from '../utils/themePalettes';

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
  totalVisits,
  cloudSynced = true,
  themePalette,
  onSelectTheme,
  onOpenThemeSettings,
  isAdmin = false
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<BgmTrack>(bgmEngine.getCurrentTrack());
  const [trackIndex, setTrackIndex] = useState(0);
  const [playlist, setPlaylist] = useState<BgmTrack[]>(bgmEngine.getPlaylist());
  const [showBgmManager, setShowBgmManager] = useState(false);
  const [playMode, setPlayMode] = useState<BgmPlayMode>(bgmEngine.getPlayMode());
  const [selectedTrackCount, setSelectedTrackCount] = useState(bgmEngine.getSelectedTrackCount());

  useEffect(() => {
    const unsubscribe = bgmEngine.subscribe(() => {
      setIsPlaying(bgmEngine.getIsPlaying());
      setCurrentTrack(bgmEngine.getCurrentTrack());
      setTrackIndex(bgmEngine.getTrackIndex());
      setPlaylist(bgmEngine.getPlaylist());
      setPlayMode(bgmEngine.getPlayMode());
      setSelectedTrackCount(bgmEngine.getSelectedTrackCount());
    });
    return unsubscribe;
  }, []);

  const handleTogglePlay = () => {
    bgmEngine.togglePlay();
  };

  const handleNext = () => {
    bgmEngine.nextTrack();
  };

  const handlePrev = () => {
    bgmEngine.prevTrack();
  };

  const handleTogglePlayMode = () => {
    bgmEngine.cyclePlayMode();
  };

  return (
    <header className="mb-2 px-1">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2.5">
        
        {/* Left: Orange Mini-hompy Tile & Title & Stats */}
        <div className="flex flex-col gap-1">
          {/* Retro Logo Emblem Badge + Title */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            <RetroLogoBadge size="md" />
            
            {/* Kwon Yong-woo's Title */}
            <h1 className="text-sm sm:text-base md:text-lg font-bold text-[#1f3a52] tracking-tight flex flex-wrap items-center gap-1.5 break-keep">
              <span className="break-keep hover:text-[#ff6b2b] transition-colors">권용우의 행복한 인생</span>
              <span className="text-[11px] sm:text-xs font-normal text-[#5a7282] hidden sm:inline">
                (Kwon's Happy Life)
              </span>
            </h1>
          </div>

          {/* Today / Total visitor count statistics */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-medium text-[#4f6472]">
            <span className="text-[#3b5998]">TODAY</span>
            <span className="font-bold text-[#e63946] tabular-nums font-mono">{todayVisits.toLocaleString()}</span>
            <span className="text-[#a0b6bf]">|</span>
            <span className="text-[#555555]">TOTAL</span>
            <span className="font-bold text-[#2b2d42] tabular-nums font-mono">{totalVisits.toLocaleString()}</span>

            {/* Quick Retro Theme Skin Switcher */}
            {onSelectTheme && (
              <div className="flex items-center gap-1.5 bg-white/80 border border-[#b8ced8] px-2 py-0.5 rounded text-[11px] shadow-2xs">
                <Palette className="w-3 h-3 text-[#ff6b2b] shrink-0" />
                <span className="text-[#516b7c] font-medium hidden sm:inline">스킨 테마:</span>
                <div className="flex items-center gap-1">
                  {RETRO_THEME_PALETTES.map((t) => {
                    const isCurrent = (themePalette || 'classic_sky') === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => onSelectTheme(t.id)}
                        className={`w-3.5 h-3.5 rounded-full border transition-all cursor-pointer ${
                          isCurrent
                            ? 'scale-125 ring-2 ring-[#ff6b2b] shadow-xs'
                            : 'opacity-70 hover:opacity-100 hover:scale-110'
                        }`}
                        style={{ backgroundColor: t.bgHex, borderColor: t.borderHex }}
                        title={`${t.name} (클릭하여 스킨 변경)`}
                      />
                    );
                  })}
                </div>
                {onOpenThemeSettings && (
                  <button
                    type="button"
                    onClick={onOpenThemeSettings}
                    className="ml-0.5 text-[10px] text-[#718898] hover:text-[#ff6b2b] underline cursor-pointer"
                    title="스킨 테마 상세 설정 메뉴로 이동"
                  >
                    설정
                  </button>
                )}
              </div>
            )}

            <span className="text-[10px] sm:text-[11px] text-[#718794] hidden lg:inline ml-1 bg-white/70 px-1.5 py-0.5 rounded border border-[#c3d3da] break-keep">
              권용우의 유튜브 &amp; 페이스북 공식 아카이브
            </span>
          </div>
        </div>

        {/* Right: Cyworld Retro BGM Music Player (Hidden on smartphones per user request) */}
        <div className="hidden md:flex bg-[#f0f6fa] border border-[#bcd2dc] rounded-lg p-2 shadow-xs flex-col sm:flex-row items-center gap-2 sm:gap-2.5 md:w-auto md:min-w-[290px] lg:min-w-[340px]">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${isPlaying ? 'bg-[#ff6b2b] text-white animate-pulse' : 'bg-[#d6e4ea] text-[#5c7382]'}`}>
              <Music className="w-3.5 h-3.5" />
            </div>

            <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setShowBgmManager(true)}>
              <div className="text-[11px] font-bold text-[#2d4050] truncate flex items-center gap-1">
                <span className="text-[10px] text-[#ff6b2b] font-mono">BGM</span>
                <span className="truncate hover:text-[#ff6b2b] transition-colors">{currentTrack.title}</span>
                {currentTrack.isCustom && (
                  <span className="text-[9px] bg-[#e6f4ea] text-[#137333] px-1 py-0.2 rounded font-mono font-bold shrink-0">
                    MY
                  </span>
                )}
              </div>
              <div className="text-[10px] text-[#6b8290] truncate flex items-center gap-1">
                <span className="truncate">{currentTrack.artist}</span>
                <span>({trackIndex + 1}/{playlist.length})</span>
              </div>
            </div>
          </div>

          {/* Controller & Progress Bar */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            {/* Direct Music Upload Button - Admin Only */}
            {isAdmin && (
              <button
                onClick={() => setShowBgmManager(true)}
                className="px-2 py-1 bg-white hover:bg-[#ffece0] text-[#e05619] hover:text-[#c4430a] border border-[#ffcdb5] rounded text-[10px] font-bold flex items-center gap-1 shadow-2xs transition-colors shrink-0 cursor-pointer"
                title="배경음악 직접 올리기 & 재생목록 관리"
              >
                <FolderUp className="w-3 h-3" />
                <span>음악 올리기</span>
              </button>
            )}
            {/* Play/Pause & Skip buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrev}
                title="이전 곡"
                className="w-5 h-5 flex items-center justify-center bg-white border border-[#b8ccd6] rounded text-[#486273] hover:bg-[#e4eff4] active:scale-95 transition-all text-xs"
              >
                <SkipBack className="w-3 h-3" />
              </button>

              <button
                onClick={handleTogglePlay}
                title={isPlaying ? '일시정지' : '재생'}
                className="px-2 py-0.5 flex items-center justify-center gap-1 bg-[#2b7294] hover:bg-[#205b77] text-white border border-[#1b4b62] rounded text-[11px] font-medium shadow-2xs active:scale-95 transition-all"
              >
                {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-current" />}
                <span className="text-[10px]">{isPlaying ? 'STOP' : 'PLAY'}</span>
              </button>

              <button
                onClick={handleNext}
                title="다음 곡"
                className="w-5 h-5 flex items-center justify-center bg-white border border-[#b8ccd6] rounded text-[#486273] hover:bg-[#e4eff4] active:scale-95 transition-all text-xs cursor-pointer"
              >
                <SkipForward className="w-3 h-3" />
              </button>

              {/* Repeat Mode Quick Toggle Button */}
              <button
                onClick={handleTogglePlayMode}
                title={`반복 재생 모드 변경 (클릭 시 전환)\n현재: ${
                  playMode === 'all'
                    ? '전체 순차 반복'
                    : playMode === 'repeat_one'
                    ? '1곡 무한 반복재생'
                    : playMode === 'repeat_selected'
                    ? `선택된 화일만 반복 (${selectedTrackCount}곡)`
                    : playMode === 'repeat_custom'
                    ? '업로드된 음악만 반복'
                    : '랜덤 무작위 재생'
                }`}
                className={`px-1.5 py-0.5 flex items-center gap-1 border rounded text-[10px] font-bold transition-all cursor-pointer ${
                  playMode === 'repeat_one'
                    ? 'bg-[#fff5ee] border-[#ff6b2b] text-[#ff6b2b] shadow-2xs'
                    : playMode === 'repeat_selected'
                    ? 'bg-[#eff6ff] border-[#2563eb] text-[#2563eb] shadow-2xs'
                    : playMode === 'repeat_custom'
                    ? 'bg-[#ecfdf5] border-[#059669] text-[#059669] shadow-2xs'
                    : playMode === 'random'
                    ? 'bg-[#f5f3ff] border-[#8b5cf6] text-[#7c3aed] shadow-2xs'
                    : 'bg-white border-[#b8ccd6] text-[#5c7382] hover:bg-[#e4eff4]'
                }`}
              >
                {playMode === 'repeat_one' && (
                  <>
                    <Repeat1 className="w-3 h-3" />
                    <span>1곡반복</span>
                  </>
                )}
                {playMode === 'repeat_selected' && (
                  <>
                    <ListChecks className="w-3 h-3" />
                    <span>선택반복({selectedTrackCount})</span>
                  </>
                )}
                {playMode === 'repeat_custom' && (
                  <>
                    <Disc3 className="w-3 h-3" />
                    <span>업로드반복</span>
                  </>
                )}
                {playMode === 'random' && (
                  <>
                    <Shuffle className="w-3 h-3" />
                    <span>랜덤반복</span>
                  </>
                )}
                {playMode === 'all' && (
                  <>
                    <Repeat className="w-3 h-3" />
                    <span className="hidden xl:inline">전체반복</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* BGM Management Modal */}
      <BgmManagerModal
        isOpen={showBgmManager}
        onClose={() => setShowBgmManager(false)}
      />
    </header>
  );
};
