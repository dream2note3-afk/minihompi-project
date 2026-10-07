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
  X,
  Disc3,
  Repeat,
  Repeat1,
  ListChecks,
  Search,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
  Radio,
  Plus,
  ListMusic,
  ChevronUp,
  ChevronDown,
  Shuffle,
  Square
} from 'lucide-react';

interface BgmManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type FilterTab = 'all' | 'custom' | 'builtin' | 'selected';

interface PendingAudioFile {
  id: string;
  file: File;
  title: string;
  artist: string;
  size: number;
}

export const BgmManagerModal: React.FC<BgmManagerModalProps> = ({ isOpen, onClose }) => {
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

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white border-2 border-[#2b7294] rounded-xl max-w-2xl w-full max-h-[92vh] overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-[#f0f6fa] px-4 py-3 border-b border-[#c8d9e6] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#ff6b2b] text-white flex items-center justify-center shadow-xs">
              <Music className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1f374a] flex items-center gap-2">
                <span>배경음악(BGM) 관리 &amp; 반복 재생 설정</span>
                <span className="text-[10px] bg-[#e1edf4] text-[#205675] px-1.5 py-0.2 rounded font-mono font-medium">
                  총 {playlist.length}곡
                </span>
              </h3>
              <p className="text-[11px] text-[#6d8494]">
                현재 설정된 BGM 시각화, 재생목록 검색 및 1곡 반복·선택반복을 설정하세요.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-md text-[#6d8494] hover:bg-[#e4eff4] hover:text-[#1f374a] text-base font-bold transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-3.5 sm:p-4 overflow-y-auto flex-1 flex flex-col gap-3.5">
          {/* Notification Msg */}
          {successMsg && (
            <div className="p-2.5 bg-[#eaf7ee] border border-[#a6dfb5] text-[#1b6b33] rounded-md text-xs flex items-center gap-2 animate-fadeIn">
              <Check className="w-4 h-4 shrink-0 text-[#1b6b33]" />
              <span className="font-medium">{successMsg}</span>
            </div>
          )}

          {/* 🌟 HERO: NOW PLAYING BGM VISUAL SHOWCASE */}
          <div className="bg-gradient-to-br from-[#1a2b38] via-[#24394a] to-[#16222c] text-white rounded-xl p-3 sm:p-3.5 shadow-md border border-[#3b5366] relative overflow-hidden">
            <div className="flex items-center justify-between mb-2.5 border-b border-white/10 pb-1.5">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/10 text-[9px] sm:text-[10px] font-mono text-[#ff9f43] font-bold border border-white/15">
                  <Radio className={`w-3 h-3 ${isPlaying ? 'text-[#ff6b2b] animate-pulse' : 'text-gray-400'}`} />
                  <span>NOW PLAYING BGM</span>
                </span>
                {isPlaying ? (
                  <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                    재생중
                  </span>
                ) : (
                  <span className="text-[10px] text-gray-400 font-medium">일시정지됨</span>
                )}
              </div>

              {/* Repeat Mode Badge */}
              <span className="px-2 py-0.5 rounded border text-[10px] font-mono font-bold bg-[#ff6b2b]/20 text-[#ff9f43] border-[#ff6b2b]/40">
                {playMode === 'repeat_one' && '🔂 1곡 무한 반복'}
                {playMode === 'repeat_selected' && `☑️ 선택반복 (${selectedTrackCount}곡)`}
                {playMode === 'repeat_custom' && `📁 업로드 음악 (${customTracks.length}곡)`}
                {playMode === 'all' && '🔁 전체 순차 반복'}
              </span>
            </div>

            {/* Turntable & Track Info */}
            <div className="flex items-center gap-3.5">
              <div className="relative shrink-0 flex items-center justify-center">
                <div
                  className={`w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-[#11161b] border-2 border-[#2d3a46] shadow-xl flex items-center justify-center relative transition-transform ${
                    isPlaying ? 'animate-[spin_4s_linear_infinite]' : ''
                  }`}
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#ff6b2b] to-[#ff9f43] border border-white/60 flex items-center justify-center text-white">
                    <Disc3 className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] bg-[#0ea5e9]/20 text-[#38bdf8] border border-[#0ea5e9]/40 px-1 py-0.2 rounded font-mono font-bold">
                    {currentTrack.isCustom ? 'MY BGM' : 'CYWORLD'}
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono">
                    Track {currentTrackIndex + 1}/{playlist.length}
                  </span>
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-white truncate mt-0.5">
                  {currentTrack.title}
                </h4>
                <p className="text-[11px] text-[#94a9b8] truncate">
                  {currentTrack.artist}
                </p>

                {/* Controls in Hero Card */}
                <div className="flex items-center gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => bgmEngine.prevTrack()}
                    className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                    title="이전 곡"
                  >
                    <SkipBack className="w-3 h-3" />
                  </button>

                  <button
                    type="button"
                    onClick={() => bgmEngine.togglePlay()}
                    className="w-7 h-7 rounded-full bg-[#ff6b2b] hover:bg-[#e05619] text-white flex items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer"
                    title={isPlaying ? '일시 정지' : '재생'}
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => bgmEngine.nextTrack(true)}
                    className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                    title="다음 곡"
                  >
                    <SkipForward className="w-3 h-3" />
                  </button>

                  {/* Quick RANDOM PLAY button in Modal */}
                  <button
                    type="button"
                    onClick={handleRandomPlay}
                    className="px-2 py-0.5 rounded bg-[#7c3aed] hover:bg-[#6d28d9] text-white flex items-center gap-1 text-[10px] font-bold shadow-xs cursor-pointer transition-all active:scale-95 border border-purple-400/40"
                    title="무작위로 곡을 선택하여 즉시 재생합니다"
                  >
                    <Shuffle className="w-2.5 h-2.5" />
                    <span>랜덤</span>
                  </button>

                  {/* Quick STOP ALL button in Modal */}
                  <button
                    type="button"
                    onClick={handleStopAll}
                    className="px-2 py-0.5 rounded bg-[#dc2626] hover:bg-[#b91c1c] text-white flex items-center gap-1 text-[10px] font-bold shadow-xs cursor-pointer transition-all active:scale-95 border border-red-400/40"
                    title="모든 음악 재생을 완전히 정지합니다 (모두 멈춤)"
                  >
                    <Square className="w-2.5 h-2.5 fill-current" />
                    <span>멈춤</span>
                  </button>

                  {/* Volume Slider */}
                  <div className="flex items-center gap-1 ml-auto">
                    <button
                      type="button"
                      onClick={handleToggleMute}
                      className="text-gray-300 hover:text-white transition-colors cursor-pointer"
                    >
                      {isMuted || volume <= 0.001 ? (
                        <VolumeX className="w-3 h-3 text-red-400" />
                      ) : (
                        <Volume2 className="w-3 h-3" />
                      )}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={isMuted ? 0 : volume}
                      onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                      className="w-14 sm:w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#ff6b2b]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Repeat Mode Selector */}
          <div className="bg-[#f0f6fa] border border-[#bcd2dc] rounded-lg p-2.5 sm:p-3 flex flex-col gap-2 shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-1">
              <span className="text-xs font-bold text-[#1f374a] flex items-center gap-1">
                <Repeat className="w-3.5 h-3.5 text-[#ff6b2b]" />
                <span>재생 모드 (반복 설정)</span>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => bgmEngine.setPlayMode('repeat_one')}
                className={`p-2 rounded border text-left flex items-center justify-between transition-all cursor-pointer ${
                  playMode === 'repeat_one'
                    ? 'bg-[#fff5ee] border-[#ff6b2b] text-[#ff6b2b] font-bold shadow-xs'
                    : 'bg-white border-[#d2e0e8] text-[#4d6677] hover:bg-[#fffcf9]'
                }`}
              >
                <div className="flex items-center gap-1 text-xs">
                  <Repeat1 className="w-3.5 h-3.5" />
                  <span>1곡 반복</span>
                </div>
                {playMode === 'repeat_one' && <Check className="w-3 h-3 stroke-[3]" />}
              </button>

              <button
                type="button"
                onClick={() => bgmEngine.setPlayMode('repeat_selected')}
                className={`p-2 rounded border text-left flex items-center justify-between transition-all cursor-pointer ${
                  playMode === 'repeat_selected'
                    ? 'bg-[#eff6ff] border-[#2563eb] text-[#2563eb] font-bold shadow-xs'
                    : 'bg-white border-[#d2e0e8] text-[#4d6677] hover:bg-[#f8faff]'
                }`}
              >
                <div className="flex items-center gap-1 text-xs">
                  <ListChecks className="w-3.5 h-3.5" />
                  <span>선택 반복</span>
                </div>
                {playMode === 'repeat_selected' && <Check className="w-3 h-3 stroke-[3]" />}
              </button>

              <button
                type="button"
                onClick={() => bgmEngine.setPlayMode('repeat_custom')}
                className={`p-2 rounded border text-left flex items-center justify-between transition-all cursor-pointer ${
                  playMode === 'repeat_custom'
                    ? 'bg-[#ecfdf5] border-[#059669] text-[#059669] font-bold shadow-xs'
                    : 'bg-white border-[#d2e0e8] text-[#4d6677] hover:bg-[#f6fdfa]'
                }`}
              >
                <div className="flex items-center gap-1 text-xs">
                  <Disc3 className="w-3.5 h-3.5" />
                  <span>업로드 반복</span>
                </div>
                {playMode === 'repeat_custom' && <Check className="w-3 h-3 stroke-[3]" />}
              </button>

              <button
                type="button"
                onClick={() => bgmEngine.setPlayMode('all')}
                className={`p-2 rounded border text-left flex items-center justify-between transition-all cursor-pointer ${
                  playMode === 'all'
                    ? 'bg-[#f4f7f9] border-[#2b7294] text-[#2b7294] font-bold shadow-xs'
                    : 'bg-white border-[#d2e0e8] text-[#4d6677]'
                }`}
              >
                <div className="flex items-center gap-1 text-xs">
                  <Repeat className="w-3.5 h-3.5" />
                  <span>전체 반복</span>
                </div>
                {playMode === 'all' && <Check className="w-3 h-3 stroke-[3]" />}
              </button>

              {/* Mode 5: 랜덤 반복 */}
              <button
                type="button"
                onClick={() => bgmEngine.setPlayMode('random')}
                className={`p-2 rounded border text-left flex items-center justify-between transition-all cursor-pointer ${
                  playMode === 'random'
                    ? 'bg-[#f5f3ff] border-[#8b5cf6] text-[#7c3aed] font-bold shadow-xs ring-1 ring-[#8b5cf6]/30'
                    : 'bg-white border-[#d2e0e8] text-[#4d6677] hover:bg-[#faf5ff]'
                }`}
              >
                <div className="flex items-center gap-1 text-xs">
                  <Shuffle className="w-3.5 h-3.5" />
                  <span>랜덤 반복</span>
                </div>
                {playMode === 'random' && <Check className="w-3 h-3 stroke-[3]" />}
              </button>
            </div>
          </div>

          {/* iPad & PC Background Music File Upload Box */}
          <div className="bg-[#fafbfc] border border-[#d2e0e8] rounded-lg p-3 flex flex-col gap-2.5">
            <div className="flex flex-wrap items-center justify-between gap-1">
              <div className="flex items-center gap-1.5">
                <FolderUp className="w-4 h-4 text-[#ff6b2b]" />
                <h4 className="text-xs font-bold text-[#1f374a]">
                  새 배경음악 올리기 (iPad · 모바일 · PC)
                </h4>
              </div>
              <span className="text-[10px] bg-[#eaf3f8] text-[#2b7294] font-medium px-1.5 py-0.5 rounded border border-[#cde0ea]">
                📱 iPad 파일 앱(iCloud/다운로드) 지원
              </span>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-2 bg-red-50 border border-red-200 text-red-700 rounded text-xs flex items-center justify-between animate-fadeIn">
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
              className={`relative border-2 border-dashed rounded-lg p-3 text-center transition-all ${
                isDragging
                  ? 'border-[#ff6b2b] bg-[#fff5ee]'
                  : pendingFiles.length > 0
                  ? 'border-[#2b7294] bg-[#f0f7fa]'
                  : 'border-[#bcd0db] bg-white hover:bg-[#f8fafb]'
              }`}
            >
              <input
                type="file"
                multiple
                ref={fileInputRef}
                onChange={handleInputChange}
                accept="audio/*,audio/mpeg,audio/mp3,audio/x-m4a,audio/m4a,audio/wav,audio/x-wav,audio/aac,audio/flac,audio/ogg,.mp3,.m4a,.wav,.aac,.ogg,.flac,*/*"
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                title="음악 파일 선택 (다중 선택 가능)"
              />

              <div className="flex flex-col items-center justify-center gap-1 pointer-events-none">
                {pendingFiles.length > 0 ? (
                  <>
                    <FileAudio className="w-7 h-7 text-[#2b7294]" />
                    <span className="text-xs font-bold text-[#1f374a]">
                      총 {pendingFiles.length}개의 음악 파일이 선택되었습니다.
                    </span>
                    <span className="text-[10px] text-[#556e80]">
                      클릭하거나 파일을 추가로 끌어다 놓아 더 많은 곡을 선택할 수 있습니다.
                    </span>
                  </>
                ) : (
                  <>
                    <Upload className="w-6 h-6 text-[#7892a2]" />
                    <span className="text-xs font-bold text-[#2a3f50]">
                      음악 파일을 여기로 끌어다 놓거나 터치하여 선택하세요 (다중 선택 가능)
                    </span>
                    <span className="text-[10px] text-[#7892a2]">
                      Shift나 Ctrl 키를 누르고 여러 MP3 파일을 한 번에 선택할 수 있습니다.
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Explicit Mobile / iPad Trigger Button */}
            {pendingFiles.length === 0 && (
              <div className="flex items-center justify-center">
                <label className="relative inline-flex items-center gap-1 px-3 py-1 bg-[#2b7294] hover:bg-[#205873] text-white rounded text-[11px] font-bold cursor-pointer shadow-xs transition-colors">
                  <Upload className="w-3 h-3" />
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
              <form onSubmit={handleUploadSubmit} className="flex flex-col gap-2.5 pt-1.5 border-t border-[#e2edf2]">
                {/* Header summary of selected files */}
                <div className="flex flex-wrap items-center justify-between gap-1.5 bg-[#f0f7fa] border border-[#cbe1ed] rounded-lg p-2">
                  <div className="flex items-center gap-1.5">
                    <ListMusic className="w-3.5 h-3.5 text-[#2b7294]" />
                    <span className="text-xs font-bold text-[#1f374a]">
                      선택된 음악: <strong className="text-[#ff6b2b]">{pendingFiles.length}곡</strong>
                      <span className="text-[10px] font-normal text-[#556e80] ml-1">
                        (총 {(pendingFiles.reduce((sum, item) => sum + item.size, 0) / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </span>
                  </div>

                  {/* Add more files button */}
                  <button
                    type="button"
                    onClick={() => addMoreInputRef.current?.click()}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-white hover:bg-[#e4eff5] text-[#2b7294] border border-[#bcd3df] rounded text-[11px] font-bold shadow-2xs transition-colors cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
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
                <div className="flex flex-col gap-1 max-h-[200px] overflow-y-auto pr-1">
                  {pendingFiles.map((item, index) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-2 p-1.5 bg-white border border-[#d6e3ea] rounded shadow-2xs hover:border-[#b7cfdc] transition-all"
                    >
                      <div className="flex items-center gap-1.5 flex-1 min-w-0">
                        <span className="w-4 h-4 rounded-full bg-[#eef5f8] text-[#346281] font-bold text-[9px] flex items-center justify-center shrink-0">
                          {index + 1}
                        </span>
                        <FileAudio className="w-3.5 h-3.5 text-[#2b7294] shrink-0" />
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => handleUpdatePendingTitle(item.id, e.target.value)}
                          placeholder="곡 제목 입력"
                          className="flex-1 p-1 bg-[#fafcfd] border border-[#bed2dc] focus:bg-white focus:border-[#ff6b2b] rounded text-xs text-[#2a3f50] outline-hidden min-w-[120px]"
                          required
                        />
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[9px] text-[#718898] font-mono whitespace-nowrap">
                          {(item.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemovePendingFile(item.id)}
                          className="p-0.5 text-[#93a7b5] hover:text-red-500 rounded hover:bg-red-50 transition-colors cursor-pointer"
                          title="이 곡 제외하기"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Common artist input */}
                <div>
                  <label className="block text-[10px] font-bold text-[#2a3f50] mb-0.5">
                    공통 아티스트 / 앨범 설명
                  </label>
                  <input
                    type="text"
                    value={commonArtist}
                    onChange={(e) => setCommonArtist(e.target.value)}
                    placeholder="가수 이름 또는 앨범명 (예: 권용우 스튜디오 BGM)"
                    className="w-full p-1.5 bg-white border border-[#bed2dc] rounded text-xs text-[#2a3f50] outline-hidden focus:border-[#ff6b2b]"
                  />
                </div>

                {/* Upload Progress Bar if uploading */}
                {isUploading && uploadProgress && (
                  <div className="flex flex-col gap-1 p-1.5 bg-[#fff8f2] border border-[#ffcdb5] rounded animate-fadeIn">
                    <div className="flex items-center justify-between text-[11px] font-bold text-[#e05619]">
                      <span>배경음악 등록 중...</span>
                      <span>
                        {uploadProgress.current} / {uploadProgress.total}곡 ({Math.round((uploadProgress.current / uploadProgress.total) * 100)}%)
                      </span>
                    </div>
                    <div className="w-full bg-[#f3ded2] h-1.5 rounded-full overflow-hidden">
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
                    className="px-3.5 py-1.5 bg-[#ff6b2b] hover:bg-[#ea580c] disabled:bg-gray-300 text-white rounded text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    {isUploading ? (
                      <>
                        <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>저장 중 ({uploadProgress?.current || 0}/{uploadProgress?.total || pendingFiles.length})...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3 h-3 stroke-[3]" />
                        <span>
                          {pendingFiles.length === 1
                            ? '1곡 배경음악 등록 및 재생'
                            : `총 ${pendingFiles.length}곡 일괄 등록 및 바로 재생`}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-[#f5f9fc] border border-[#d2e2ec] rounded-lg p-2.5 flex flex-col gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#6c8698] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="음악 제목, 가수, 파일명 검색..."
                className="w-full pl-8 pr-8 py-1.5 bg-white border border-[#bcd0dc] rounded-md text-xs text-[#1e3445] outline-hidden focus:border-[#2b7294]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8fa4b3] hover:text-[#2a3f50] cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
              <button
                type="button"
                onClick={() => setFilterTab('all')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium shrink-0 cursor-pointer ${
                  filterTab === 'all'
                    ? 'bg-[#2b7294] text-white font-bold'
                    : 'bg-white border border-[#c4d6e2] text-[#4d6677]'
                }`}
              >
                전체 ({playlist.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterTab('custom')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium shrink-0 cursor-pointer ${
                  filterTab === 'custom'
                    ? 'bg-[#059669] text-white font-bold'
                    : 'bg-white border border-[#c4d6e2] text-[#4d6677]'
                }`}
              >
                업로드 ({customTracks.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterTab('builtin')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium shrink-0 cursor-pointer ${
                  filterTab === 'builtin'
                    ? 'bg-[#ff6b2b] text-white font-bold'
                    : 'bg-white border border-[#c4d6e2] text-[#4d6677]'
                }`}
              >
                싸이월드 ({builtinTracks.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterTab('selected')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium shrink-0 cursor-pointer ${
                  filterTab === 'selected'
                    ? 'bg-[#2563eb] text-white font-bold'
                    : 'bg-white border border-[#c4d6e2] text-[#4d6677]'
                }`}
              >
                선택반복 ({selectedTracks.length})
              </button>
            </div>
          </div>

          {/* Playlist Rendering */}
          <div className="flex flex-col gap-1.5 max-h-[260px] overflow-y-auto pr-1">
            {filteredPlaylist.length === 0 ? (
              <div className="py-8 text-center bg-[#fafbfc] border border-dashed border-[#ccdbe2] rounded text-xs text-[#718898]">
                검색 조건에 맞는 음악이 없습니다.
              </div>
            ) : (
              filteredPlaylist.map((track) => {
                const globalIdx = playlist.findIndex((t) => t.id === track.id);
                const isCurrent = globalIdx === currentTrackIndex;
                const isSelected = bgmEngine.isTrackSelected(track.id);

                return (
                  <div
                    key={track.id}
                    onClick={() => bgmEngine.selectTrack(globalIdx)}
                    className={`p-2 rounded-md border flex items-center justify-between gap-2 cursor-pointer transition-all ${
                      isCurrent
                        ? 'bg-[#fff5ee] border-[#ff7e39] shadow-xs'
                        : isSelected && playMode === 'repeat_selected'
                        ? 'bg-[#f4f8ff] border-[#bfdbfe]'
                        : 'bg-white border-[#d2e0e8] hover:bg-[#f6fafc]'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          bgmEngine.toggleTrackSelected(track.id);
                        }}
                        className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                          isSelected ? 'bg-[#2563eb] border-[#2563eb] text-white' : 'bg-white border-[#adc2ce]'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
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
                        className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-white ${
                          isCurrent && isPlaying ? 'bg-[#ff6b2b]' : 'bg-[#2b7294]'
                        }`}
                      >
                        {isCurrent && isPlaying ? (
                          <Pause className="w-3 h-3" />
                        ) : (
                          <Play className="w-3 h-3 fill-current ml-0.5" />
                        )}
                      </button>

                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[#1f374a] truncate flex items-center gap-1">
                          <span className="truncate">{track.title}</span>
                          {track.isCustom ? (
                            <span className="text-[9px] bg-[#e3eff6] text-[#245874] px-1 rounded font-mono">
                              MY
                            </span>
                          ) : (
                            <span className="text-[9px] bg-[#f0f4f7] text-[#526a7a] px-1 rounded font-mono">
                              CY
                            </span>
                          )}
                          {isCurrent && (
                            <span className="text-[10px] text-[#ff6b2b] font-bold animate-pulse">
                              ● 재생중
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-[#6d8494] truncate block">
                          {track.artist}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {/* Order Reorder buttons (위로 / 아래로 이동) */}
                      <div className="flex items-center bg-[#f0f4f8] rounded border border-[#d2e0e8] overflow-hidden">
                        <button
                          type="button"
                          disabled={globalIdx === 0}
                          onClick={(e) => {
                            e.stopPropagation();
                            bgmEngine.moveTrackUp(globalIdx);
                          }}
                          className="p-0.5 text-[#4d6677] hover:text-[#ff6b2b] hover:bg-white disabled:opacity-30 disabled:hover:text-[#4d6677] transition-colors cursor-pointer"
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
                          className="p-0.5 text-[#4d6677] hover:text-[#ff6b2b] hover:bg-white disabled:opacity-30 disabled:hover:text-[#4d6677] transition-colors cursor-pointer"
                          title="재생 순서 아래로 이동 (▼)"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {track.isCustom && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setTrackToDelete(track);
                          }}
                          className="p-1 text-[#8fa6b5] hover:text-red-600 rounded transition-colors shrink-0 cursor-pointer"
                          title="삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-[#f0f6fa] px-4 py-2.5 border-t border-[#c8d9e6] flex items-center justify-between">
          <span className="text-[11px] text-[#6b8292]">
            음악을 클릭하면 즉시 재생되며, 상단 헤더 BGM 플레이어와 동기화됩니다.
          </span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 bg-[#2b7294] hover:bg-[#205b77] text-white rounded text-xs font-bold transition-colors cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>

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
            <p className="text-xs text-gray-700">
              "{trackToDelete.title}" 음원을 삭제하시겠습니까?
            </p>
            <div className="flex items-center justify-end gap-2 pt-1 border-t border-[#edf2f7]">
              <button
                type="button"
                onClick={() => setTrackToDelete(null)}
                className="px-3 py-1 bg-white border rounded text-xs"
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
                className="px-3 py-1 bg-red-600 text-white rounded text-xs font-bold"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
