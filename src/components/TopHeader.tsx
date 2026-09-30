import React, { useState, useEffect } from 'react';
import { bgmEngine, BGM_PLAYLIST } from '../utils/audioSynth';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Music } from 'lucide-react';

interface TopHeaderProps {
  todayVisits: number;
  totalVisits: number;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ todayVisits, totalVisits }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [currentTrack, setCurrentTrack] = useState(bgmEngine.getCurrentTrack());
  const [trackIndex, setTrackIndex] = useState(0);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [progress, setProgress] = useState(25);

  useEffect(() => {
    const unsubscribe = bgmEngine.subscribe(() => {
      setIsPlaying(bgmEngine.getIsPlaying());
      setVolume(bgmEngine.getVolume());
      setCurrentTrack(bgmEngine.getCurrentTrack());
      setTrackIndex(bgmEngine.getTrackIndex());
    });
    return unsubscribe;
  }, []);

  // Visual progress bar animation when playing
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 0 : prev + 1));
    }, 800);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleTogglePlay = () => {
    bgmEngine.togglePlay();
  };

  const handleNext = () => {
    bgmEngine.nextTrack();
  };

  const handlePrev = () => {
    bgmEngine.prevTrack();
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    bgmEngine.setVolume(val);
  };

  const toggleMute = () => {
    if (volume > 0) {
      bgmEngine.setVolume(0);
    } else {
      bgmEngine.setVolume(0.5);
    }
  };

  return (
    <header className="mb-2 px-1">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2.5">
        
        {/* Left: Orange Mini-hompy Tile & Title & Stats */}
        <div className="flex flex-col gap-1">
          {/* Logo Tile + Title */}
          <div className="flex items-center gap-2.5">
            {/* Orange Mini-hompy logo tile */}
            <div className="px-2.5 py-1 bg-[#ff6b2b] text-white text-xs font-bold rounded shadow-sm flex items-center justify-center tracking-wider border border-[#e05619]">
              미니홈피
            </div>
            
            {/* Kwon Yong-woo's Video & Photo title */}
            <h1 className="text-base font-bold text-[#1f3a52] tracking-tight flex items-center gap-1.5">
              <span>권용우의 영상&amp;사진</span>
              <span className="text-xs font-normal text-[#5a7282] hidden sm:inline">
                (Kwon's Studio Archive)
              </span>
            </h1>
          </div>

          {/* Today / Total visitor count statistics */}
          <div className="flex items-center gap-2 text-xs font-medium text-[#4f6472]">
            <span className="text-[#3b5998]">TODAY</span>
            <span className="font-bold text-[#e63946] tabular-nums font-mono">{todayVisits.toLocaleString()}</span>
            <span className="text-[#a0b6bf]">|</span>
            <span className="text-[#555555]">TOTAL</span>
            <span className="font-bold text-[#2b2d42] tabular-nums font-mono">{totalVisits.toLocaleString()}</span>
            <span className="text-[11px] text-[#718794] hidden lg:inline ml-1 bg-white/70 px-1.5 py-0.5 rounded border border-[#c3d3da]">
              권용우 작가의 유튜브 &amp; 페이스북 공식 아카이브
            </span>
          </div>
        </div>

        {/* Right: Cyworld Retro BGM Music Player */}
        <div className="bg-[#f0f6fa] border border-[#bcd2dc] rounded-lg p-2 shadow-xs flex flex-col sm:flex-row items-center gap-2.5 min-w-[280px] lg:min-w-[340px]">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${isPlaying ? 'bg-[#ff6b2b] text-white animate-pulse' : 'bg-[#d6e4ea] text-[#5c7382]'}`}>
              <Music className="w-3.5 h-3.5" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-bold text-[#2d4050] truncate flex items-center gap-1">
                <span className="text-[10px] text-[#ff6b2b] font-mono">BGM</span>
                <span className="truncate">{currentTrack.title}</span>
              </div>
              <div className="text-[10px] text-[#6b8290] truncate">
                {currentTrack.artist} ({trackIndex + 1}/{BGM_PLAYLIST.length})
              </div>
            </div>
          </div>

          {/* Controller & Progress Bar */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
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
                className="w-5 h-5 flex items-center justify-center bg-white border border-[#b8ccd6] rounded text-[#486273] hover:bg-[#e4eff4] active:scale-95 transition-all text-xs"
              >
                <SkipForward className="w-3 h-3" />
              </button>
            </div>

            {/* Simulated progress bar controller */}
            <div className="w-16 h-1.5 bg-[#dbe8ee] rounded-full overflow-hidden border border-[#c4d6df] hidden sm:block">
              <div
                className="h-full bg-[#ff7e39] transition-all duration-500 ease-out"
                style={{ width: `${isPlaying ? progress : 15}%` }}
              />
            </div>

            {/* Volume Icon & Popover */}
            <div className="relative flex items-center">
              <button
                onClick={() => setShowVolumeSlider(!showVolumeSlider)}
                className="p-1 text-[#516b7c] hover:text-[#1e3442] transition-colors"
                title="볼륨 조절"
              >
                {volume === 0 ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>

              {showVolumeSlider && (
                <div className="absolute right-0 top-7 z-30 bg-white border border-[#b8ced8] shadow-md rounded p-2 flex items-center gap-2">
                  <button onClick={toggleMute} className="text-xs text-[#516b7c]">
                    {volume === 0 ? <VolumeX className="w-3 h-3 text-red-500" /> : <Volume2 className="w-3 h-3" />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-20 accent-[#ff6b2b] h-1.5 cursor-pointer"
                  />
                  <span className="text-[10px] font-mono text-[#5b7382] w-6">
                    {Math.round(volume * 100)}%
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </header>
  );
};
