import React, { useState, useRef, useEffect, useMemo } from 'react';
import { bgmEngine, BgmTrack, BgmPlayMode } from '../utils/audioSynth';
import {
  Music,
  Upload,
  Play,
  Pause,
  Trash2,
  Check,
  Sparkles,
  FolderUp,
  FileAudio,
  Disc3,
  Repeat,
  Repeat1,
  ListChecks,
  ArrowLeft,
  Search,
  X,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
  Radio,
  SlidersHorizontal,
  Plus,
  ListMusic,
  ChevronUp,
  ChevronDown,
  Shuffle,
  Square
} from 'lucide-react';

interface BgmManagerPanelProps {
  onReturnToGallery?: () => void;
}

type FilterTab = 'all' | 'custom' | 'builtin' | 'selected';

interface PendingAudioFile {
  id: string;
  file: File;
  title: string;
  artist: string;
  size: number;
}

export const BgmManagerPanel: React.FC<BgmManagerPanelProps> = ({ onReturnToGallery }) => {
  const [playlist, setPlaylist] = useState<BgmTrack[]>(bgmEngine.getPlaylist());
  const [currentTrackIndex, setCurrentTrackIndex] = useState(bgmEngine.getTrackIndex());
  const [isPlaying, setIsPlaying] = useState(bgmEngine.getIsPlaying());
  const [playMode, setPlayMode] = useState<BgmPlayMode>(bgmEngine.getPlayMode());
  const [selectedTrackCount, setSelectedTrackCount] = useState(bgmEngine.getSelectedTrackCount());
  const [volume, setVolume] = useState<number>(bgmEngine.getVolume());
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [prevVolume, setPrevVolume] = useState<number>(0.5);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<FilterTab>('all');

  // Upload State (Multi-file support)
  const [isDragging, setIsDragging] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<PendingAudioFile[]>([]);
  const [commonArtist, setCommonArtist] = useState('권용우 스튜디오 (My BGM)');
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [trackToDelete, setTrackToDelete] = useState<BgmTrack | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const ipadInputRef = useRef<HTMLInputElement>(null);
  const addMoreInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsubscribe = bgmEngine.subscribe(() => {
      setPlaylist(bgmEngine.getPlaylist());
      setCurrentTrackIndex(bgmEngine.getTrackIndex());
      setIsPlaying(bgmEngine.getIsPlaying());
      setPlayMode(bgmEngine.getPlayMode());
      setSelectedTrackCount(bgmEngine.getSelectedTrackCount());
      const curVol = bgmEngine.getVolume();
      setVolume(curVol);
      if (curVol <= 0.001) {
        setIsMuted(true);
      }
    });
    return unsubscribe;
  }, []);

  const currentTrack: BgmTrack = playlist[currentTrackIndex] || playlist[0] || {
    id: 'default',
    title: '재생 가능한 음악 없음',
    artist: '권용우 스튜디오',
    type: 'synth'
  };

  const handleToggleMute = () => {
    if (isMuted || volume <= 0.001) {
      const restoreVol = prevVolume > 0.05 ? prevVolume : 0.5;
      bgmEngine.setVolume(restoreVol);
      setVolume(restoreVol);
      setIsMuted(false);
    } else {
      setPrevVolume(volume);
      bgmEngine.setVolume(0);
      setVolume(0);
      setIsMuted(true);
    }
  };

  const handleVolumeChange = (newVal: number) => {
    bgmEngine.setVolume(newVal);
    setVolume(newVal);
    if (newVal <= 0.001) {
      setIsMuted(true);
    } else {
      setIsMuted(false);
      setPrevVolume(newVal);
    }
  };

  const handleStopAll = () => {
    bgmEngine.stopAll();
    setSuccessMsg('⏹️ 모든 음악 재생이 정지되었습니다. (모두 멈춤 완료)');
    setTimeout(() => setSuccessMsg(''), 3500);
  };

  const handleRandomPlay = () => {
    bgmEngine.playRandomTrack();
    const track = bgmEngine.getCurrentTrack();
    setSuccessMsg(`🔀 랜덤 재생 시작: "${track?.title}" — ${track?.artist}`);
    setTimeout(() => setSuccessMsg(''), 3500);
  };

  const isValidAudio = (file: File) => {
    const fileName = file.name || '';
    const ext = (fileName.split('.').pop() || '').toLowerCase();
    const isAudioExt = ['mp3', 'm4a', 'wav', 'aac', 'ogg', 'flac', 'caf', 'aiff', 'wma'].includes(ext);
    const isAudioMime = file.type.startsWith('audio/') || file.type.includes('mpeg') || file.type.includes('audio');
    const isGenericMime = !file.type || file.type === 'application/octet-stream' || file.type === 'binary/octet-stream';
    return isAudioExt || isAudioMime || isGenericMime;
  };

  const handleFilesSelect = (selectedList: FileList | File[]) => {
    setErrorMsg('');
    const filesArray = Array.from(selectedList);
    if (filesArray.length === 0) return;

    const validFiles = filesArray.filter(isValidAudio);
    if (validFiles.length === 0) {
      setErrorMsg('오디오 파일(MP3, M4A, WAV, AAC, FLAC 등)만 업로드할 수 있습니다.');
      return;
    }

    if (validFiles.length < filesArray.length) {
      setErrorMsg(`선택된 파일 중 ${filesArray.length - validFiles.length}개의 비오디오 파일은 제외되었습니다.`);
    }

    const newPending: PendingAudioFile[] = validFiles.map((file, idx) => {
      const cleanName = (file.name || '내 배경음악').replace(/\.[^/.]+$/, '');
      return {
        id: `${file.name}_${file.size}_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
        file,
        title: cleanName,
        artist: commonArtist || '권용우 스튜디오 (My BGM)',
        size: file.size
      };
    });

    setPendingFiles((prev) => [...prev, ...newPending]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFilesSelect(e.target.files);
      e.target.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesSelect(e.dataTransfer.files);
    }
  };

  const handleRemovePendingFile = (id: string) => {
    setPendingFiles((prev) => prev.filter((item) => item.id !== id));
  };

  const handleUpdatePendingTitle = (id: string, newTitle: string) => {
    setPendingFiles((prev) =>
      prev.map((item) => (item.id === id ? { ...item, title: newTitle } : item))
    );
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pendingFiles.length === 0) return;

    setIsUploading(true);
    setErrorMsg('');
    setUploadProgress({ current: 0, total: pendingFiles.length });

    try {
      if (pendingFiles.length === 1) {
        const item = pendingFiles[0];
        await bgmEngine.addCustomAudioTrack(item.file, item.title, commonArtist);
        setSuccessMsg(`"${item.title}" 배경음악이 등록되어 재생을 시작했습니다!`);
      } else {
        await bgmEngine.addCustomAudioTracks(
          pendingFiles.map((item) => ({
            file: item.file,
            customTitle: item.title,
            customArtist: commonArtist
          })),
          (completed, total) => {
            setUploadProgress({ current: completed, total });
          }
        );
        setSuccessMsg(`총 ${pendingFiles.length}곡의 배경음악이 성공적으로 등록되어 재생을 시작했습니다!`);
      }

      setPendingFiles([]);
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch {
      setErrorMsg('음악 파일 처리 중 오류가 발생했습니다. 다른 MP3 파일로 시도해보세요.');
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  };

  // Filter & Search Playlist
  const customTracks = playlist.filter((t) => t.isCustom);
  const builtinTracks = playlist.filter((t) => !t.isCustom);
  const selectedTracks = playlist.filter((t) => bgmEngine.isTrackSelected(t.id));

  const filteredPlaylist = useMemo(() => {
    return playlist.filter((track) => {
      // 1. Tab filter
      if (filterTab === 'custom' && !track.isCustom) return false;
      if (filterTab === 'builtin' && track.isCustom) return false;
      if (filterTab === 'selected' && !bgmEngine.isTrackSelected(track.id)) return false;

      // 2. Search query filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = track.title.toLowerCase().includes(q);
      const matchArtist = track.artist.toLowerCase().includes(q);
      const matchFileName = track.fileName ? track.fileName.toLowerCase().includes(q) : false;

      return matchTitle || matchArtist || matchFileName;
    });
  }, [playlist, filterTab, searchQuery]);

  const filteredCustom = filteredPlaylist.filter((t) => t.isCustom);
  const filteredBuiltin = filteredPlaylist.filter((t) => !t.isCustom);

  return (
    <div className="flex-1 min-h-0 flex flex-col gap-4 overflow-y-auto custom-retro-scrollbar pr-1 animate-fadeIn">
      {/* Top Banner / Navigation */}
      <div className="flex items-center justify-between pb-3 border-b border-[#e2edf2]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#ff6b2b] text-white flex items-center justify-center shadow-xs">
            <Music className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#1f374a] flex items-center gap-2">
              <span>음악 재생 &amp; 반복 설정 메뉴</span>
              <span className="text-[10px] bg-[#e1edf4] text-[#205675] px-1.5 py-0.2 rounded font-mono font-medium">
                총 {playlist.length}곡 (업로드 {customTracks.length}곡)
              </span>
            </h3>
            <p className="text-[11px] text-[#6d8494]">
              현재 설정된 배경음악 시각화, 재생목록 검색 및 1곡 반복·선택반복을 자유롭게 관리하세요.
            </p>
          </div>
        </div>

        {onReturnToGallery && (
          <button
            onClick={onReturnToGallery}
            className="px-2.5 py-1 text-xs text-[#527083] hover:text-[#1a3447] bg-[#f0f6fa] hover:bg-[#e2edf4] border border-[#bed2dc] rounded flex items-center gap-1 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>갤러리로 돌아가기</span>
          </button>
        )}
      </div>

      {/* Notification Msg */}
      {successMsg && (
        <div className="p-2.5 bg-[#eaf7ee] border border-[#a6dfb5] text-[#1b6b33] rounded-md text-xs flex items-center gap-2 animate-fadeIn">
          <Check className="w-4 h-4 shrink-0 text-[#1b6b33]" />
          <span className="font-medium">{successMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🌟 HERO: CURRENTLY PLAYING BGM VISUAL SHOWCASE (Vinyl + Equalizer + Meta) */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-br from-[#1a2b38] via-[#24394a] to-[#16222c] text-white rounded-xl p-3.5 sm:p-4 shadow-md border border-[#3b5366] relative overflow-hidden">
        {/* Background ambient lighting */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff6b2b]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#38bdf8]/10 rounded-full blur-2xl pointer-events-none" />

        {/* Top Header Tag */}
        <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-mono text-[#ff9f43] font-bold border border-white/15">
              <Radio className={`w-3 h-3 ${isPlaying ? 'text-[#ff6b2b] animate-pulse' : 'text-gray-400'}`} />
              <span>NOW PLAYING BGM</span>
            </span>

            {isPlaying ? (
              <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                음악 재생중
              </span>
            ) : (
              <span className="text-[10px] text-gray-400 font-medium">일시정지됨</span>
            )}
          </div>

          {/* Repeat Mode Badge */}
          <div className="flex items-center gap-1.5 text-[10px] font-bold">
            <span className="text-gray-400 hidden sm:inline">재생 방식:</span>
            <span className={`px-2 py-0.5 rounded border font-mono ${
              playMode === 'repeat_one'
                ? 'bg-[#ff6b2b]/20 text-[#ff9f43] border-[#ff6b2b]/40'
                : playMode === 'repeat_selected'
                ? 'bg-blue-500/20 text-blue-300 border-blue-400/40'
                : playMode === 'repeat_custom'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                : 'bg-white/15 text-gray-200 border-white/20'
            }`}>
              {playMode === 'repeat_one' && '🔂 1곡 무한 반복'}
              {playMode === 'repeat_selected' && `☑️ 선택반복 (${selectedTrackCount}곡)`}
              {playMode === 'repeat_custom' && `📁 업로드 음악만 (${customTracks.length}곡)`}
              {playMode === 'all' && '🔁 전체 순차 반복'}
            </span>
          </div>
        </div>

        {/* Center Main Stage: Vinyl Turntable + Track Information + Audio Wave */}
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5">
          {/* Vinyl Record Turntable */}
          <div className="relative shrink-0 flex items-center justify-center">
            {/* Outer Vinyl LP Disc with real CSS spin */}
            <div
              className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#11161b] border-4 border-[#2d3a46] shadow-xl flex items-center justify-center relative transition-transform ${
                isPlaying ? 'animate-[spin_4s_linear_infinite]' : ''
              }`}
            >
              {/* Grooves on vinyl */}
              <div className="absolute inset-1.5 rounded-full border border-white/10" />
              <div className="absolute inset-3 rounded-full border border-white/10" />
              <div className="absolute inset-5 rounded-full border border-white/10" />

              {/* Center Vinyl Label */}
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-[#ff6b2b] to-[#ff9f43] border-2 border-white/60 flex items-center justify-center text-white shadow-inner">
                <Disc3 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              {/* Spindle hole */}
              <div className="absolute w-2 h-2 rounded-full bg-black border border-white/40" />
            </div>

            {/* Tonearm graphic overlay */}
            <div
              className={`hidden sm:block absolute -top-1 -right-1 w-8 h-10 border-t-2 border-r-2 border-white/40 rounded-tr-lg pointer-events-none transition-transform duration-500 origin-top-right ${
                isPlaying ? 'rotate-12' : '-rotate-6'
              }`}
            />
          </div>

          {/* Track Information & Waveform Bars */}
          <div className="flex-1 min-w-0 flex flex-col justify-between gap-2.5 w-full text-center sm:text-left">
            <div>
              {/* Badges row */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 mb-1">
                {currentTrack.isCustom ? (
                  <span className="px-2 py-0.5 rounded text-[10px] bg-[#0ea5e9]/20 text-[#38bdf8] border border-[#0ea5e9]/40 font-mono font-bold">
                    MY UPLOADED BGM
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] bg-[#f59e0b]/20 text-[#fbbf24] border border-[#f59e0b]/40 font-mono font-bold">
                    CYWORLD CLASSIC BGM
                  </span>
                )}

                <span className="text-[10px] text-gray-400 font-mono">
                  Track {currentTrackIndex + 1} of {playlist.length}
                </span>
              </div>

              {/* Title & Artist */}
              <h4 className="text-sm sm:text-base font-bold text-white tracking-tight break-keep line-clamp-1 leading-snug">
                {currentTrack.title}
              </h4>
              <p className="text-xs text-[#94a9b8] truncate mt-0.5">
                {currentTrack.artist} {currentTrack.fileName && `· ${currentTrack.fileName}`}
              </p>
            </div>

            {/* Equalizer Frequency Bars + Track Progress bar */}
            <div className="flex items-center justify-between gap-3 pt-1 border-t border-white/10">
              {/* Equalizer Bars */}
              <div className="flex items-end gap-1 h-5 shrink-0">
                <span className={`w-1 rounded-full bg-[#ff6b2b] ${isPlaying ? 'animate-[bounce_0.8s_infinite]' : 'h-1.5'}`} style={{ height: isPlaying ? '14px' : '6px' }} />
                <span className={`w-1 rounded-full bg-[#ff9f43] ${isPlaying ? 'animate-[bounce_1.1s_infinite_0.15s]' : 'h-2'}`} style={{ height: isPlaying ? '18px' : '8px' }} />
                <span className={`w-1 rounded-full bg-[#feca57] ${isPlaying ? 'animate-[bounce_0.9s_infinite_0.3s]' : 'h-3'}`} style={{ height: isPlaying ? '20px' : '10px' }} />
                <span className={`w-1 rounded-full bg-[#ff9f43] ${isPlaying ? 'animate-[bounce_1.2s_infinite_0.1s]' : 'h-2'}`} style={{ height: isPlaying ? '16px' : '7px' }} />
                <span className={`w-1 rounded-full bg-[#ff6b2b] ${isPlaying ? 'animate-[bounce_0.7s_infinite_0.25s]' : 'h-1.5'}`} style={{ height: isPlaying ? '12px' : '5px' }} />
              </div>

              {/* Visual Progress percentage */}
              <div className="flex-1 max-w-[240px] bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#ff6b2b] to-[#ff9f43] h-full transition-all duration-300"
                  style={{ width: `${Math.round(((currentTrackIndex + 1) / playlist.length) * 100)}%` }}
                />
              </div>

              {/* Playback Controls & Volume in Hero Card */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => bgmEngine.prevTrack()}
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                  title="이전 곡"
                >
                  <SkipBack className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => bgmEngine.togglePlay()}
                  className="w-8 h-8 rounded-full bg-[#ff6b2b] hover:bg-[#e05619] text-white flex items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer"
                  title={isPlaying ? '일시 정지' : '재생'}
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => bgmEngine.nextTrack(true)}
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                  title="다음 곡"
                >
                  <SkipForward className="w-3.5 h-3.5" />
                </button>

                {/* Quick RANDOM PLAY button in Hero Card */}
                <button
                  type="button"
                  onClick={handleRandomPlay}
                  className="px-2.5 py-1 rounded bg-[#7c3aed] hover:bg-[#6d28d9] text-white flex items-center gap-1 text-[11px] font-bold shadow-md cursor-pointer transition-all active:scale-95 border border-purple-400/40 ml-1"
                  title="무작위로 곡을 선택하여 즉시 재생합니다 (랜덤 재생)"
                >
                  <Shuffle className="w-3 h-3" />
                  <span>랜덤 재생</span>
                </button>

                {/* Quick STOP ALL button in Hero Card */}
                <button
                  type="button"
                  onClick={handleStopAll}
                  className="px-2.5 py-1 rounded bg-[#dc2626] hover:bg-[#b91c1c] text-white flex items-center gap-1 text-[11px] font-bold shadow-md cursor-pointer transition-all active:scale-95 border border-red-400/40"
                  title="모든 음악 및 음원 재생을 완전히 정지합니다 (모두 멈춤)"
                >
                  <Square className="w-3 h-3 fill-current" />
                  <span>모두 멈춤</span>
                </button>

                {/* Volume slider */}
                <div className="hidden md:flex items-center gap-1 ml-2 pl-2 border-l border-white/15">
                  <button
                    type="button"
                    onClick={handleToggleMute}
                    className="text-gray-300 hover:text-white transition-colors cursor-pointer"
                    title={isMuted ? '음소거 해제' : '음소거'}
                  >
                    {isMuted || volume <= 0.001 ? (
                      <VolumeX className="w-3.5 h-3.5 text-red-400" />
                    ) : (
                      <Volume2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                    className="w-14 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#ff6b2b]"
                    title={`볼륨: ${Math.round(volume * 100)}%`}
                  />
                  <span className="text-[10px] text-gray-400 font-mono w-6 text-right">
                    {Math.round((isMuted ? 0 : volume) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. PLAYBACK REPEAT MODE CONTROLLER */}
      {/* ========================================================================= */}
      <div className="bg-[#f0f6fa] border border-[#bcd2dc] rounded-lg p-3.5 flex flex-col gap-3 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#1f374a]">
            <Repeat className="w-4 h-4 text-[#ff6b2b]" />
            <span>재생 모드 (반복 설정 메뉴)</span>
          </div>
          <span className="text-[11px] text-[#5c7382]">
            현재 설정: <strong className="text-[#ff6b2b]">
              {playMode === 'all' && '전체 순차 반복'}
              {playMode === 'repeat_one' && '1곡 무한 반복재생'}
              {playMode === 'repeat_selected' && `선택된 화일만 반복 (${selectedTrackCount}곡)`}
              {playMode === 'repeat_custom' && `업로드된 음악만 반복 (${customTracks.length}곡)`}
              {playMode === 'random' && '랜덤 무작위 반복재생 🔀'}
            </strong>
          </span>
        </div>

        {/* 5 Repeat Mode Selection Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {/* Mode 1: 1곡 반복재생 */}
          <button
            type="button"
            onClick={() => bgmEngine.setPlayMode('repeat_one')}
            className={`p-3 rounded-lg border text-left flex flex-col gap-1.5 transition-all cursor-pointer ${
              playMode === 'repeat_one'
                ? 'bg-[#fff5ee] border-[#ff6b2b] text-[#ff6b2b] shadow-xs ring-2 ring-[#ff6b2b]/30'
                : 'bg-white border-[#d2e0e8] text-[#4d6677] hover:border-[#ff6b2b]/50 hover:bg-[#fffcf9]'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold">
                <Repeat1 className="w-4 h-4 shrink-0" />
                <span>1곡 반복재생</span>
              </div>
              {playMode === 'repeat_one' && <Check className="w-4 h-4 stroke-[3]" />}
            </div>
            <p className="text-[10px] text-[#788e9c] leading-tight">
              현재 재생 중인 1곡만 무한 반복 재생합니다.
            </p>
          </button>

          {/* Mode 2: 선택된 화일만 반복 재생 */}
          <button
            type="button"
            onClick={() => bgmEngine.setPlayMode('repeat_selected')}
            className={`p-3 rounded-lg border text-left flex flex-col gap-1.5 transition-all cursor-pointer ${
              playMode === 'repeat_selected'
                ? 'bg-[#eff6ff] border-[#2563eb] text-[#2563eb] shadow-xs ring-2 ring-[#2563eb]/30'
                : 'bg-white border-[#d2e0e8] text-[#4d6677] hover:border-[#2563eb]/50 hover:bg-[#f8faff]'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold">
                <ListChecks className="w-4 h-4 shrink-0" />
                <span>선택된 화일만 반복</span>
              </div>
              {playMode === 'repeat_selected' && <Check className="w-4 h-4 stroke-[3]" />}
            </div>
            <p className="text-[10px] text-[#788e9c] leading-tight">
              체크박스로 선택한 화일만 계속 반복 재생합니다.
            </p>
          </button>

          {/* Mode 3: 업로드된 음악만 반복 재생 */}
          <button
            type="button"
            onClick={() => bgmEngine.setPlayMode('repeat_custom')}
            className={`p-3 rounded-lg border text-left flex flex-col gap-1.5 transition-all cursor-pointer ${
              playMode === 'repeat_custom'
                ? 'bg-[#ecfdf5] border-[#059669] text-[#059669] shadow-xs ring-2 ring-[#059669]/30'
                : 'bg-white border-[#d2e0e8] text-[#4d6677] hover:border-[#059669]/50 hover:bg-[#f6fdfa]'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold">
                <Disc3 className="w-4 h-4 shrink-0" />
                <span>업로드 음악만 반복</span>
              </div>
              {playMode === 'repeat_custom' && <Check className="w-4 h-4 stroke-[3]" />}
            </div>
            <p className="text-[10px] text-[#788e9c] leading-tight">
              직접 올린 내 오디오 화일들만 순환 반복합니다.
            </p>
          </button>

          {/* Mode 4: 전체 반복재생 */}
          <button
            type="button"
            onClick={() => bgmEngine.setPlayMode('all')}
            className={`p-3 rounded-lg border text-left flex flex-col gap-1.5 transition-all cursor-pointer ${
              playMode === 'all'
                ? 'bg-[#f4f7f9] border-[#2b7294] text-[#2b7294] shadow-xs ring-2 ring-[#2b7294]/30'
                : 'bg-white border-[#d2e0e8] text-[#4d6677] hover:border-[#2b7294]/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold">
                <Repeat className="w-4 h-4 shrink-0" />
                <span>전체 반복재생</span>
              </div>
              {playMode === 'all' && <Check className="w-4 h-4 stroke-[3]" />}
            </div>
            <p className="text-[10px] text-[#788e9c] leading-tight">
              목록의 모든 곡을 순차적으로 무한 반복합니다.
            </p>
          </button>

          {/* Mode 5: 랜덤 반복재생 (새로 추가됨) */}
          <button
            type="button"
            onClick={() => bgmEngine.setPlayMode('random')}
            className={`p-3 rounded-lg border text-left flex flex-col gap-1.5 transition-all cursor-pointer ${
              playMode === 'random'
                ? 'bg-[#f5f3ff] border-[#8b5cf6] text-[#7c3aed] shadow-xs ring-2 ring-[#8b5cf6]/30'
                : 'bg-white border-[#d2e0e8] text-[#4d6677] hover:border-[#8b5cf6]/50 hover:bg-[#faf5ff]'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold">
                <Shuffle className="w-4 h-4 shrink-0" />
                <span>랜덤 반복재생</span>
              </div>
              {playMode === 'random' && <Check className="w-4 h-4 stroke-[3]" />}
            </div>
            <p className="text-[10px] text-[#788e9c] leading-tight">
              순서 없이 전체 음악을 무작위로 섞어서 재생합니다.
            </p>
          </button>
        </div>

        {/* Quick Selection Toolbar for 'Repeat Selected' */}
        <div className="pt-2 border-t border-[#d2e2ec] flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-[#556e80] font-medium">선택 도구:</span>
            <button
              type="button"
              onClick={() => bgmEngine.selectAllCustom()}
              className="px-2.5 py-1 bg-white border border-[#b8ced8] text-[#2b7294] hover:bg-[#e4eff4] rounded text-[11px] font-medium cursor-pointer shadow-2xs transition-colors"
            >
              업로드 음악만 전체선택
            </button>
            <button
              type="button"
              onClick={() => bgmEngine.selectAll()}
              className="px-2.5 py-1 bg-white border border-[#b8ced8] text-[#4d6677] hover:bg-[#e4eff4] rounded text-[11px] font-medium cursor-pointer shadow-2xs transition-colors"
            >
              모든 곡 선택
            </button>
            <button
              type="button"
              onClick={() => bgmEngine.deselectAll()}
              className="px-2.5 py-1 bg-white border border-[#b8ced8] text-[#8fa6b5] hover:bg-[#ffebee] hover:text-red-600 rounded text-[11px] font-medium cursor-pointer shadow-2xs transition-colors"
            >
              선택해제
            </button>

            <div className="w-px h-3.5 bg-[#ccdce4] mx-0.5 hidden sm:block" />

            <button
              type="button"
              onClick={handleRandomPlay}
              className="px-2.5 py-1 bg-[#f5f3ff] border border-[#d8b4fe] text-[#7c3aed] hover:bg-[#ede9fe] rounded text-[11px] font-bold cursor-pointer shadow-2xs transition-colors flex items-center gap-1"
              title="무작위로 곡을 선택하여 즉시 재생합니다"
            >
              <Shuffle className="w-3 h-3" />
              <span>랜덤 재생</span>
            </button>

            <button
              type="button"
              onClick={handleStopAll}
              className="px-2.5 py-1 bg-[#fef2f2] border border-[#fecaca] text-[#dc2626] hover:bg-[#fee2e2] rounded text-[11px] font-bold cursor-pointer shadow-2xs transition-colors flex items-center gap-1"
              title="모든 음악 및 사운드 출력을 즉시 정지합니다"
            >
              <Square className="w-3 h-3 fill-current" />
              <span>모두 멈춤</span>
            </button>
          </div>

          <div className="text-[11px] text-[#4a6375] font-mono flex items-center gap-1">
            <span>선택된 반복 대상:</span>
            <span className="font-bold text-[#2563eb] bg-[#eff6ff] px-2 py-0.5 rounded border border-[#bfdbfe]">
              {selectedTrackCount}곡
            </span>
            <span className="text-[#889ea8]">/ {playlist.length}곡</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. File Upload Box (iPad / iOS Safari & PC Optimized) */}
      {/* ========================================================================= */}
      <div className="bg-[#fafbfc] border border-[#d2e0e8] rounded-lg p-3.5 flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-1">
          <div className="flex items-center gap-2">
            <FolderUp className="w-4 h-4 text-[#ff6b2b]" />
            <h4 className="text-xs font-bold text-[#1f374a]">
              새 음악 파일 올리기 (PC · iPad · 모바일 지원)
            </h4>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-[#718898]">
            <span className="bg-[#eaf3f8] text-[#2b7294] font-medium px-1.5 py-0.5 rounded border border-[#cde0ea]">
              📱 iPad 파일 앱(iCloud/다운로드) 지원
            </span>
            <span>MP3, M4A, WAV, AAC, FLAC 지원</span>
          </div>
        </div>

        {/* Error / Alert Message */}
        {errorMsg && (
          <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-md text-xs flex items-center justify-between animate-fadeIn">
            <span>{errorMsg}</span>
            <button
              type="button"
              onClick={() => setErrorMsg('')}
              className="text-red-500 hover:text-red-800 p-0.5 text-xs font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Drag & Drop / Direct Touch Tap Area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-lg p-4 text-center transition-all ${
            isDragging
              ? 'border-[#ff6b2b] bg-[#fff5ee]'
              : pendingFiles.length > 0
              ? 'border-[#2b7294] bg-[#f0f7fa]'
              : 'border-[#bcd0db] bg-white hover:bg-[#f8fafb]'
          }`}
        >
          {/* Transparent full-area file input to guarantee 100% native tap response on iPad Safari & PC */}
          <input
            type="file"
            multiple
            ref={fileInputRef}
            onChange={handleInputChange}
            accept="audio/*,audio/mpeg,audio/mp3,audio/x-m4a,audio/m4a,audio/wav,audio/x-wav,audio/aac,audio/flac,audio/ogg,.mp3,.m4a,.wav,.aac,.ogg,.flac,*/*"
            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
            title="음악 파일 선택 (다중 선택 가능)"
          />

          <div className="flex flex-col items-center justify-center gap-1.5 pointer-events-none">
            {pendingFiles.length > 0 ? (
              <>
                <FileAudio className="w-8 h-8 text-[#2b7294]" />
                <span className="text-xs font-bold text-[#1f374a]">
                  총 {pendingFiles.length}개의 음악 파일이 선택되었습니다.
                </span>
                <span className="text-[11px] text-[#556e80]">
                  클릭하거나 파일을 추가로 끌어다 놓아 더 많은 곡을 선택할 수 있습니다.
                </span>
              </>
            ) : (
              <>
                <Upload className="w-7 h-7 text-[#7892a2]" />
                <span className="text-xs font-bold text-[#2a3f50]">
                  음악 파일을 여기로 끌어다 놓거나 클릭하여 선택하세요 (다중 선택 지원)
                </span>
                <span className="text-[11px] text-[#7892a2]">
                  Windows 탐색기, Mac, iPad 파일 앱에서 Shift 또는 Ctrl 키로 여러 MP3 파일을 한 번에 선택할 수 있습니다.
                </span>
              </>
            )}
          </div>
        </div>

        {/* Explicit Mobile / iPad Trigger Button */}
        {pendingFiles.length === 0 && (
          <div className="flex items-center justify-center pt-1">
            <label className="relative inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#2b7294] hover:bg-[#205873] text-white rounded text-xs font-bold cursor-pointer shadow-xs transition-colors">
              <Upload className="w-3.5 h-3.5" />
              <span>📱 PC / iPad 파일 앱에서 MP3 다중 파일 선택하기</span>
              <input
                type="file"
                multiple
                ref={ipadInputRef}
                onChange={handleInputChange}
                accept="audio/*,audio/mpeg,audio/mp3,audio/x-m4a,audio/m4a,audio/wav,audio/x-wav,audio/aac,audio/flac,audio/ogg,.mp3,.m4a,.wav,.aac,.ogg,.flac,*/*"
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                title="음악 파일 선택 (다중 선택 가능)"
              />
            </label>
          </div>
        )}

        {/* Selected Files Metadata & Batch Management Form */}
        {pendingFiles.length > 0 && (
          <form onSubmit={handleUploadSubmit} className="flex flex-col gap-3 pt-2 border-t border-[#e2edf2]">
            {/* Header summary of selected files */}
            <div className="flex flex-wrap items-center justify-between gap-2 bg-[#f0f7fa] border border-[#cbe1ed] rounded-lg p-2.5">
              <div className="flex items-center gap-2">
                <ListMusic className="w-4 h-4 text-[#2b7294]" />
                <span className="text-xs font-bold text-[#1f374a]">
                  선택된 음악: <strong className="text-[#ff6b2b]">{pendingFiles.length}곡</strong>
                  <span className="text-[11px] font-normal text-[#556e80] ml-1">
                    (총 {(pendingFiles.reduce((sum, item) => sum + item.size, 0) / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </span>
              </div>

              {/* Add more files button */}
              <button
                type="button"
                onClick={() => addMoreInputRef.current?.click()}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-[#e4eff5] text-[#2b7294] border border-[#bcd3df] rounded text-xs font-bold shadow-2xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>파일 추가하기</span>
              </button>
              <input
                type="file"
                multiple
                ref={addMoreInputRef}
                onChange={handleInputChange}
                accept="audio/*,audio/mpeg,audio/mp3,audio/x-m4a,audio/m4a,audio/wav,audio/x-wav,audio/aac,audio/flac,audio/ogg,.mp3,.m4a,.wav,.aac,.ogg,.flac,*/*"
                className="hidden"
              />
            </div>

            {/* Scrollable list of pending tracks */}
            <div className="flex flex-col gap-1.5 max-h-[260px] overflow-y-auto pr-1">
              {pendingFiles.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-2 p-2 bg-white border border-[#d6e3ea] rounded-md shadow-2xs hover:border-[#b7cfdc] transition-all"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-[#eef5f8] text-[#346281] font-bold text-[10px] flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <FileAudio className="w-4 h-4 text-[#2b7294] shrink-0" />
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => handleUpdatePendingTitle(item.id, e.target.value)}
                      placeholder="곡 제목 입력"
                      className="flex-1 p-1 bg-[#fafcfd] border border-[#bed2dc] focus:bg-white focus:border-[#ff6b2b] rounded text-xs text-[#2a3f50] outline-hidden min-w-[140px]"
                      required
                    />
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-[#718898] font-mono whitespace-nowrap">
                      {(item.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemovePendingFile(item.id)}
                      className="p-1 text-[#93a7b5] hover:text-red-500 rounded hover:bg-red-50 transition-colors cursor-pointer"
                      title="이 곡 제외하기"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Common artist input */}
            <div>
              <label className="block text-[11px] font-bold text-[#2a3f50] mb-1">
                공통 아티스트 / 앨범 설명
              </label>
              <input
                type="text"
                value={commonArtist}
                onChange={(e) => setCommonArtist(e.target.value)}
                placeholder="가수 이름 또는 앨범명 (예: 권용우 스튜디오 BGM)"
                className="w-full p-2 bg-white border border-[#bed2dc] rounded text-xs text-[#2a3f50] outline-hidden focus:border-[#ff6b2b]"
              />
            </div>

            {/* Upload Progress Bar if uploading */}
            {isUploading && uploadProgress && (
              <div className="flex flex-col gap-1 p-2 bg-[#fff8f2] border border-[#ffcdb5] rounded-md animate-fadeIn">
                <div className="flex items-center justify-between text-xs font-bold text-[#e05619]">
                  <span>배경음악 등록 중...</span>
                  <span>
                    {uploadProgress.current} / {uploadProgress.total}곡 ({Math.round((uploadProgress.current / uploadProgress.total) * 100)}%)
                  </span>
                </div>
                <div className="w-full bg-[#f3ded2] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#ff6b2b] h-full transition-all duration-300"
                    style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => {
                  setPendingFiles([]);
                  setErrorMsg('');
                }}
                disabled={isUploading}
                className="text-xs text-[#6e8594] hover:text-red-600 disabled:opacity-50 cursor-pointer"
              >
                선택 전체 취소
              </button>

              <button
                type="submit"
                disabled={isUploading || pendingFiles.length === 0}
                className="px-4 py-2 bg-[#ff6b2b] hover:bg-[#ea580c] disabled:bg-gray-300 text-white rounded text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                {isUploading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>저장 및 등록 중 ({uploadProgress?.current || 0}/{uploadProgress?.total || pendingFiles.length})...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>
                      {pendingFiles.length === 1
                        ? '1곡 배경음악으로 등록 및 재생'
                        : `총 ${pendingFiles.length}곡 일괄 등록 및 바로 재생`}
                    </span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 3. MUSIC PLAYLIST SEARCH & FILTER BAR */}
      {/* ========================================================================= */}
      <div className="bg-[#f5f9fc] border border-[#d2e2ec] rounded-lg p-3 flex flex-col gap-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-[#6c8698] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="음악 제목, 아티스트, 파일명 검색..."
              className="w-full pl-8 pr-8 py-1.5 bg-white border border-[#bcd0dc] rounded-md text-xs text-[#1e3445] placeholder:text-[#90a6b5] outline-hidden focus:border-[#2b7294] transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8fa4b3] hover:text-[#2a3f50] cursor-pointer"
                title="검색어 지우기"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Results count badge */}
          <div className="text-[11px] text-[#556e80] flex items-center gap-1 shrink-0 self-end sm:self-auto font-mono">
            <span>검색결과:</span>
            <strong className="text-[#2b7294]">{filteredPlaylist.length}곡</strong>
            <span className="text-[#96a9b5]">/ 전체 {playlist.length}곡</span>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
          <button
            type="button"
            onClick={() => setFilterTab('all')}
            className={`px-2.5 py-1 rounded-md font-medium shrink-0 transition-colors cursor-pointer ${
              filterTab === 'all'
                ? 'bg-[#2b7294] text-white font-bold shadow-2xs'
                : 'bg-white border border-[#c4d6e2] text-[#4d6677] hover:bg-[#eaf2f6]'
            }`}
          >
            전체 ({playlist.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('custom')}
            className={`px-2.5 py-1 rounded-md font-medium shrink-0 transition-colors cursor-pointer ${
              filterTab === 'custom'
                ? 'bg-[#059669] text-white font-bold shadow-2xs'
                : 'bg-white border border-[#c4d6e2] text-[#4d6677] hover:bg-[#eaf2f6]'
            }`}
          >
            직접 올린 음악 ({customTracks.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('builtin')}
            className={`px-2.5 py-1 rounded-md font-medium shrink-0 transition-colors cursor-pointer ${
              filterTab === 'builtin'
                ? 'bg-[#ff6b2b] text-white font-bold shadow-2xs'
                : 'bg-white border border-[#c4d6e2] text-[#4d6677] hover:bg-[#eaf2f6]'
            }`}
          >
            싸이월드 명곡 ({builtinTracks.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('selected')}
            className={`px-2.5 py-1 rounded-md font-medium shrink-0 transition-colors cursor-pointer ${
              filterTab === 'selected'
                ? 'bg-[#2563eb] text-white font-bold shadow-2xs'
                : 'bg-white border border-[#c4d6e2] text-[#4d6677] hover:bg-[#eaf2f6]'
            }`}
          >
            선택반복 곡 ({selectedTracks.length})
          </button>

          {(searchQuery || filterTab !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setFilterTab('all');
              }}
              className="ml-auto text-[11px] text-[#8fa4b3] hover:text-red-600 underline cursor-pointer shrink-0"
            >
              필터 초기화
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. PLAYLIST SECTIONS */}
      {/* ========================================================================= */}
      {filteredPlaylist.length === 0 ? (
        <div className="py-12 text-center bg-[#fdfdfd] border border-dashed border-[#ccdbe2] rounded-lg flex flex-col items-center justify-center gap-2">
          <Search className="w-8 h-8 text-[#a3b9c7]" />
          <p className="text-xs font-bold text-[#445b6b]">
            "{searchQuery}" 검색 조건에 일치하는 음악이 없습니다.
          </p>
          <p className="text-[11px] text-[#718898]">
            다른 검색어를 입력하시거나 필터를 전체로 변경해보세요.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setFilterTab('all');
            }}
            className="mt-1 px-3 py-1 bg-white border border-[#bcd2dc] text-[#2b7294] rounded text-xs font-medium hover:bg-[#eef5f8] cursor-pointer"
          >
            전체 목록 보기
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Custom User Tracks */}
          {filteredCustom.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-[#2b7294] flex items-center gap-1">
                  <Disc3 className="w-3.5 h-3.5" />
                  <span>직접 올린 나의 배경음악 ({filteredCustom.length})</span>
                </span>
                <span className="text-[10px] text-[#718898]">체크박스: 선택반복 대상 / 행 클릭: 즉시 재생</span>
              </div>

              <div className="flex flex-col gap-1.5">
                {filteredCustom.map((track) => {
                  const globalIdx = playlist.findIndex((t) => t.id === track.id);
                  const isCurrent = globalIdx === currentTrackIndex;
                  const isSelected = bgmEngine.isTrackSelected(track.id);

                  return (
                    <div
                      key={track.id}
                      onClick={() => bgmEngine.selectTrack(globalIdx)}
                      className={`p-2.5 rounded-md border flex items-center justify-between gap-2 cursor-pointer transition-all ${
                        isCurrent
                          ? 'bg-[#fff5ee] border-[#ff7e39] shadow-xs ring-1 ring-[#ff7e39]/30'
                          : isSelected && playMode === 'repeat_selected'
                          ? 'bg-[#f4f8ff] border-[#bfdbfe]'
                          : 'bg-white border-[#d2e0e8] hover:bg-[#f6fafc]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* Checkbox for selective repeat playback */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            bgmEngine.toggleTrackSelected(track.id);
                          }}
                          className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-[#2563eb] border-[#2563eb] text-white shadow-2xs'
                              : 'bg-white border-[#adc2ce] hover:border-[#2563eb]'
                          }`}
                          title={isSelected ? '선택반복 대상에서 해제' : '선택반복 대상으로 지정'}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isCurrent) {
                              bgmEngine.togglePlay();
                            } else {
                              bgmEngine.selectTrack(globalIdx);
                            }
                          }}
                          className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-white ${
                            isCurrent && isPlaying ? 'bg-[#ff6b2b]' : 'bg-[#2b7294]'
                          }`}
                        >
                          {isCurrent && isPlaying ? (
                            <Pause className="w-3.5 h-3.5" />
                          ) : (
                            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                          )}
                        </button>

                        <div className="min-w-0">
                          <div className="text-xs font-bold text-[#1f374a] truncate flex items-center gap-1.5">
                            <span className="truncate">{track.title}</span>
                            <span className="text-[9px] bg-[#e3eff6] text-[#245874] px-1.5 py-0.2 rounded font-mono shrink-0">
                              MY BGM
                            </span>
                            {isSelected && (
                              <span className="text-[9px] bg-[#eff6ff] text-[#2563eb] border border-[#bfdbfe] px-1.5 py-0.2 rounded font-medium shrink-0">
                                반복선택
                              </span>
                            )}
                            {isCurrent && (
                              <span className="text-[10px] text-[#ff6b2b] font-bold flex items-center gap-0.5 animate-pulse shrink-0">
                                ● {playMode === 'repeat_one' ? '1곡반복 재생중' : '현재 재생중'}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-[#6d8494] truncate block">
                            {track.artist} {track.fileName && `· ${track.fileName}`}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Order Reorder buttons (위로 / 아래로 이동) */}
                        <div className="flex items-center bg-[#f0f4f8] rounded border border-[#d2e0e8] overflow-hidden">
                          <button
                            type="button"
                            disabled={globalIdx === 0}
                            onClick={(e) => {
                              e.stopPropagation();
                              bgmEngine.moveTrackUp(globalIdx);
                            }}
                            className="p-1 text-[#4d6677] hover:text-[#ff6b2b] hover:bg-white disabled:opacity-30 disabled:hover:text-[#4d6677] transition-colors cursor-pointer"
                            title="재생 순서 위로 이동 (▲)"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <div className="w-px h-3 bg-[#d2e0e8]" />
                          <button
                            type="button"
                            disabled={globalIdx === playlist.length - 1}
                            onClick={(e) => {
                              e.stopPropagation();
                              bgmEngine.moveTrackDown(globalIdx);
                            }}
                            className="p-1 text-[#4d6677] hover:text-[#ff6b2b] hover:bg-white disabled:opacity-30 disabled:hover:text-[#4d6677] transition-colors cursor-pointer"
                            title="재생 순서 아래로 이동 (▼)"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setTrackToDelete(track);
                          }}
                          className="p-1.5 text-[#8fa6b5] hover:text-red-600 rounded transition-colors shrink-0 cursor-pointer"
                          title="삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Built-in Classic Cyworld Tracks */}
          {filteredBuiltin.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-[#495e6d] flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#ff7e39]" />
                  <span>싸이월드 감성 레트로 명곡 BGM 프리셋 ({filteredBuiltin.length})</span>
                </span>
                <span className="text-[10px] text-[#718898]">레트로 신디사이저 멜로디</span>
              </div>

              <div className="flex flex-col gap-1.5">
                {filteredBuiltin.map((track) => {
                  const globalIdx = playlist.findIndex((t) => t.id === track.id);
                  const isCurrent = globalIdx === currentTrackIndex;
                  const isSelected = bgmEngine.isTrackSelected(track.id);

                  return (
                    <div
                      key={track.id}
                      onClick={() => bgmEngine.selectTrack(globalIdx)}
                      className={`p-2.5 rounded-md border flex items-center justify-between gap-2 cursor-pointer transition-all ${
                        isCurrent
                          ? 'bg-[#fff5ee] border-[#ff7e39] shadow-xs ring-1 ring-[#ff7e39]/30'
                          : isSelected && playMode === 'repeat_selected'
                          ? 'bg-[#f4f8ff] border-[#bfdbfe]'
                          : 'bg-white border-[#d2e0e8] hover:bg-[#f6fafc]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* Checkbox for selective repeat playback */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            bgmEngine.toggleTrackSelected(track.id);
                          }}
                          className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-[#2563eb] border-[#2563eb] text-white shadow-2xs'
                              : 'bg-white border-[#adc2ce] hover:border-[#2563eb]'
                          }`}
                          title={isSelected ? '선택반복 대상에서 해제' : '선택반복 대상으로 지정'}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isCurrent) {
                              bgmEngine.togglePlay();
                            } else {
                              bgmEngine.selectTrack(globalIdx);
                            }
                          }}
                          className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-white ${
                            isCurrent && isPlaying ? 'bg-[#ff6b2b]' : 'bg-[#5c7382]'
                          }`}
                        >
                          {isCurrent && isPlaying ? (
                            <Pause className="w-3.5 h-3.5" />
                          ) : (
                            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                          )}
                        </button>

                        <div className="min-w-0">
                          <div className="text-xs font-bold text-[#1f374a] truncate flex items-center gap-1.5">
                            <span className="truncate">{track.title}</span>
                            <span className="text-[9px] bg-[#f0f4f7] text-[#526a7a] px-1.5 py-0.2 rounded font-mono shrink-0">
                              CYWORLD
                            </span>
                            {isSelected && (
                              <span className="text-[9px] bg-[#eff6ff] text-[#2563eb] border border-[#bfdbfe] px-1.5 py-0.2 rounded font-medium shrink-0">
                                반복선택
                              </span>
                            )}
                            {isCurrent && (
                              <span className="text-[10px] text-[#ff6b2b] font-bold flex items-center gap-0.5 animate-pulse shrink-0">
                                ● {playMode === 'repeat_one' ? '1곡반복 재생중' : '현재 재생중'}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-[#6d8494] truncate block">
                            {track.artist}
                          </span>
                        </div>
                      </div>

                      {/* Order Reorder buttons (위로 / 아래로 이동) */}
                      <div className="flex items-center bg-[#f0f4f8] rounded border border-[#d2e0e8] overflow-hidden shrink-0">
                        <button
                          type="button"
                          disabled={globalIdx === 0}
                          onClick={(e) => {
                            e.stopPropagation();
                            bgmEngine.moveTrackUp(globalIdx);
                          }}
                          className="p-1 text-[#4d6677] hover:text-[#ff6b2b] hover:bg-white disabled:opacity-30 disabled:hover:text-[#4d6677] transition-colors cursor-pointer"
                          title="재생 순서 위로 이동 (▲)"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <div className="w-px h-3 bg-[#d2e0e8]" />
                        <button
                          type="button"
                          disabled={globalIdx === playlist.length - 1}
                          onClick={(e) => {
                            e.stopPropagation();
                            bgmEngine.moveTrackDown(globalIdx);
                          }}
                          className="p-1 text-[#4d6677] hover:text-[#ff6b2b] hover:bg-white disabled:opacity-30 disabled:hover:text-[#4d6677] transition-colors cursor-pointer"
                          title="재생 순서 아래로 이동 (▼)"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal for uploaded track */}
      {trackToDelete && (
        <div
          className="fixed inset-0 z-60 bg-black/70 backdrop-blur-2xs flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setTrackToDelete(null)}
        >
          <div
            className="bg-white border-2 border-red-500 rounded-xl max-w-sm w-full p-4 shadow-2xl flex flex-col gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 text-red-600 font-bold text-sm">
              <Trash2 className="w-4 h-4" />
              <span>배경음악 파일 삭제 확인</span>
            </div>

            <div className="p-2.5 bg-[#fff5f5] border border-[#fed7d7] rounded text-xs text-[#2d3748] flex flex-col gap-1">
              <p className="font-bold text-[#9b2c2c] truncate">
                "{trackToDelete.title}"
              </p>
              <p className="text-[11px] text-[#742a2a] leading-relaxed">
                이 배경음악을 재생목록 및 저장소에서 삭제하시겠습니까?
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1 border-t border-[#edf2f7]">
              <button
                type="button"
                onClick={() => setTrackToDelete(null)}
                className="px-3 py-1.5 bg-white border border-[#cbd5e0] text-[#4a5568] rounded text-xs font-medium hover:bg-[#f7fafc] cursor-pointer"
              >
                취소
              </button>
              <button
                type="button"
                onClick={async () => {
                  const id = trackToDelete.id;
                  setTrackToDelete(null);
                  await bgmEngine.removeCustomAudioTrack(id);
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
