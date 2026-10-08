import React, { useState, useRef, useEffect, useMemo } from 'react';
import { MyCdAlbum, CdFilterType } from '../types';
import {
  saveCdAudioToDB,
  getCdAudioFromDB,
  deleteCdAudioFromDB,
  findCdAudio,
  getNormalizedAudioBlob
} from '../utils/audioStorage';
import {
  bgmEngine,
  playCdSynthMelody,
  unlockAudioContext
} from '../utils/audioSynth';
import {
  extractAudioFileMetadata,
  ExtractedAudioMetadata,
  repairKoreanMojibake,
  getKoreanLyricsForSong,
  KNOWN_KOREAN_LYRICS
} from '../utils/audioMetadataParser';
import {
  Disc3,
  Play,
  Pause,
  Music,
  Plus,
  Search,
  X,
  Upload,
  Heart,
  Star,
  Trash2,
  Edit3,
  Pin,
  Check,
  Copy,
  Volume2,
  VolumeX,
  Sliders,
  FileText,
  Image as ImageIcon,
  Info,
  RotateCw,
  Repeat,
  FolderOpen,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Disc,
  Library,
  Radio,
  FileAudio,
  ListMusic,
  AlertTriangle,
  Download,
  Cloud,
  RefreshCw,
  FileUp,
  Link,
  CheckCircle2,
  FolderPlus,
  ArrowRight,
  UploadCloud,
  Layers
} from 'lucide-react';
import {
  cloudSyncLocalAlbumsToCloud,
  compressCoverDataUrl
} from '../services/firestoreSync';

interface MyCdCollectionGalleryProps {
  albums: MyCdAlbum[];
  onAddAlbum: (album: MyCdAlbum) => void;
  onAddAlbums?: (albums: MyCdAlbum[]) => void;
  onUpdateAlbum: (id: string, updated: Partial<MyCdAlbum>) => void;
  onDeleteAlbum: (id: string) => void;
  isAdmin?: boolean;
  // External iTunes sidebar controls
  searchQuery?: string;
  onSearchQueryChange?: (q: string) => void;
  selectedGenre?: string;
  onSelectedGenreChange?: (genre: string) => void;
  filterType?: CdFilterType;
  onFilterTypeChange?: (type: CdFilterType) => void;
  sortOption?: 'newest' | 'year_desc' | 'year_asc' | 'song_asc' | 'artist_asc' | 'rating' | 'plays';
  onSortOptionChange?: (sort: 'newest' | 'year_desc' | 'year_asc' | 'song_asc' | 'artist_asc' | 'rating' | 'plays') => void;
  externalAddModalOpen?: boolean;
  onExternalAddModalClose?: () => void;
  externalBackupModalOpen?: boolean;
  onExternalBackupModalClose?: () => void;
  shuffleTrigger?: number;
}

export interface BatchCdUploadItem {
  id: string;
  file: File;
  songTitle: string;
  artist: string;
  albumTitle: string;
  albumArtist: string;
  composer: string;
  genre: string;
  releaseYear: string;
  trackNumber: number;
  totalTracks: number;
  discNumber: number;
  totalDiscs: number;
  bpm?: number;
  comments: string;
  lyrics: string;
  koreanLyrics: string;
  coverPreviewUrl: string;
  bitrate: string;
  channels: string;
  sampleRate: string;
  encodedBy: string;
  duration: number;
  formattedDuration: string;
  fileSize: string;
  isExtracted: boolean;
}

type ModalTab = 'details' | 'artwork' | 'lyrics' | 'options' | 'sorting' | 'file';

const GENRE_OPTIONS = [
  'Religious',
  'CCM/Gospel',
  'Pop',
  'Folk',
  'Folk/Ballad',
  'Folk/Acoustic',
  'Classical',
  'Rock',
  'Jazz',
  'Ballad',
  'OST',
  'World',
  '기타'
];

const CD_EQ_BARS = [
  { anim: 'cd-eq-bounce-1', dur: '0.42s', delay: '0.00s', minH: 15 },
  { anim: 'cd-eq-bounce-2', dur: '0.36s', delay: '0.08s', minH: 22 },
  { anim: 'cd-eq-bounce-3', dur: '0.50s', delay: '0.15s', minH: 12 },
  { anim: 'cd-eq-bounce-4', dur: '0.32s', delay: '0.02s', minH: 25 },
  { anim: 'cd-eq-bounce-1', dur: '0.45s', delay: '0.18s', minH: 18 },
  { anim: 'cd-eq-bounce-2', dur: '0.38s', delay: '0.05s', minH: 30 },
  { anim: 'cd-eq-bounce-3', dur: '0.48s', delay: '0.22s', minH: 14 },
  { anim: 'cd-eq-bounce-4', dur: '0.30s', delay: '0.01s', minH: 24 },
  { anim: 'cd-eq-bounce-1', dur: '0.40s', delay: '0.12s', minH: 16 },
  { anim: 'cd-eq-bounce-2', dur: '0.34s', delay: '0.04s', minH: 26 },
  { anim: 'cd-eq-bounce-3', dur: '0.46s', delay: '0.19s', minH: 14 },
  { anim: 'cd-eq-bounce-4', dur: '0.33s', delay: '0.03s', minH: 24 },
  { anim: 'cd-eq-bounce-1', dur: '0.52s', delay: '0.25s', minH: 10 },
  { anim: 'cd-eq-bounce-2', dur: '0.37s', delay: '0.07s', minH: 28 },
  { anim: 'cd-eq-bounce-3', dur: '0.44s', delay: '0.14s', minH: 15 },
  { anim: 'cd-eq-bounce-4', dur: '0.31s', delay: '0.02s', minH: 20 },
  { anim: 'cd-eq-bounce-1', dur: '0.49s', delay: '0.21s', minH: 12 },
  { anim: 'cd-eq-bounce-2', dur: '0.39s', delay: '0.10s', minH: 25 }
];

export const MyCdCollectionGallery: React.FC<MyCdCollectionGalleryProps> = ({
  albums,
  onAddAlbum,
  onAddAlbums,
  onUpdateAlbum,
  onDeleteAlbum,
  isAdmin = false,
  searchQuery: externalSearchQuery,
  onSearchQueryChange,
  selectedGenre: externalSelectedGenre,
  onSelectedGenreChange,
  filterType: externalFilterType,
  onFilterTypeChange,
  sortOption: externalSortOption,
  onSortOptionChange,
  externalAddModalOpen = false,
  onExternalAddModalClose,
  externalBackupModalOpen = false,
  onExternalBackupModalClose,
  shuffleTrigger
}) => {
  // Search & Filter (Internal fallback if not controlled by iTunes sidebar)
  const [internalSearchQuery, setInternalSearchQuery] = useState('');
  const [internalSelectedGenre, setInternalSelectedGenre] = useState<string>('all');
  const [internalFilterType, setInternalFilterType] = useState<CdFilterType>('all');
  const [internalSortOption, setInternalSortOption] = useState<'newest' | 'year_desc' | 'year_asc' | 'song_asc' | 'artist_asc' | 'rating' | 'plays'>('newest');

  const searchQuery = externalSearchQuery !== undefined ? externalSearchQuery : internalSearchQuery;
  const setSearchQuery = onSearchQueryChange || setInternalSearchQuery;

  const selectedGenre = externalSelectedGenre !== undefined ? externalSelectedGenre : internalSelectedGenre;
  const setSelectedGenre = onSelectedGenreChange || setInternalSelectedGenre;

  const filterType = externalFilterType !== undefined ? externalFilterType : internalFilterType;
  const setFilterType = onFilterTypeChange || setInternalFilterType;

  const sortOption = externalSortOption !== undefined ? externalSortOption : internalSortOption;
  const setSortOption = (onSortOptionChange as any) || setInternalSortOption;

  // Active Playback State
  const [playingAlbumId, setPlayingAlbumId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioUrlMap, setAudioUrlMap] = useState<Record<string, string>>({});
  const [volume, setVolume] = useState(0.8);
  // Playback Repeat Mode: 'single' (1곡) | 'loop_one' (무한반복) | 'all' (전체재생)
  const [repeatMode, setRepeatMode] = useState<'single' | 'loop_one' | 'all'>('single');
  const repeatModeRef = useRef<'single' | 'loop_one' | 'all'>('single');
  useEffect(() => {
    repeatModeRef.current = repeatMode;
  }, [repeatMode]);

  const cycleRepeatMode = () => {
    setRepeatMode((prev) => {
      if (prev === 'single') return 'loop_one';
      if (prev === 'loop_one') return 'all';
      return 'single';
    });
  };

  const playingAlbumIdRef = useRef<string | null>(null);
  useEffect(() => {
    playingAlbumIdRef.current = playingAlbumId;
  }, [playingAlbumId]);

  const filteredAlbumsRef = useRef<MyCdAlbum[]>(albums);
  const playNextTrackRef = useRef<(id?: string) => void>(() => {});

  // Hi-Fi Player In-Banner Lyrics State
  const [showPlayerLyrics, setShowPlayerLyrics] = useState(false);
  const [playerLyricsViewMode, setPlayerLyricsViewMode] = useState<'korean' | 'original' | 'bilingual'>('korean');
  const [lyricsFontSize, setLyricsFontSize] = useState<'sm' | 'base' | 'lg'>('base');
  const [lyricsCopied, setLyricsCopied] = useState(false);

  // Audio element ref and synth preview ref
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const synthPlaybackRef = useRef<{ stop: () => void; setVolume?: (vol: number) => void } | null>(null);
  const prevVolumeRef = useRef<number>(0.8);

  // Floating On-Screen Volume HUD state
  const [showVolumeToast, setShowVolumeToast] = useState(false);
  const volumeToastTimerRef = useRef<number | null>(null);

  const handleVolumeChange = (newVol: number, triggerToast = false) => {
    const clamped = Math.max(0, Math.min(1, Math.round(newVol * 100) / 100));
    setVolume(clamped);
    if (clamped > 0) {
      prevVolumeRef.current = clamped;
    }
    if (audioRef.current) {
      audioRef.current.volume = clamped;
    }
    if (synthPlaybackRef.current && synthPlaybackRef.current.setVolume) {
      synthPlaybackRef.current.setVolume(clamped);
    }
    // Sync with global BGM engine volume
    bgmEngine.setVolume(clamped);

    if (triggerToast) {
      setShowVolumeToast(true);
      if (volumeToastTimerRef.current) {
        window.clearTimeout(volumeToastTimerRef.current);
      }
      volumeToastTimerRef.current = window.setTimeout(() => {
        setShowVolumeToast(false);
      }, 1200);
    }
  };

  // Keyboard Left / Right Arrow keys Volume Control
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Do not intercept when user is typing in form inputs or textareas
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        // Left arrow: Volume Down (-5%)
        handleVolumeChange(Math.max(0, volume - 0.05), true);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        // Right arrow: Volume Up (+5%)
        handleVolumeChange(Math.min(1, volume + 0.05), true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (volumeToastTimerRef.current) {
        window.clearTimeout(volumeToastTimerRef.current);
      }
    };
  }, [volume]);

  // Mouse Wheel Volume Control (마우스 휠 상/하로 볼륨 조절)
  const handleWheelVolume = (e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const step = 0.05;
    if (e.deltaY < 0 || e.deltaX < 0) {
      // Scroll Up or Tilt Left: Volume Up (+5%)
      handleVolumeChange(Math.min(1, volume + step), true);
    } else if (e.deltaY > 0 || e.deltaX > 0) {
      // Scroll Down or Tilt Right: Volume Down (-5%)
      handleVolumeChange(Math.max(0, volume - step), true);
    }
  };

  const handleToggleMute = () => {
    if (volume > 0) {
      prevVolumeRef.current = volume;
      handleVolumeChange(0, true);
    } else {
      handleVolumeChange(prevVolumeRef.current > 0 ? prevVolumeRef.current : 0.8, true);
    }
  };

  // Modal State: View / Edit Album Info (iTunes-Style Modal)
  const [infoModalAlbum, setInfoModalAlbum] = useState<MyCdAlbum | null>(null);
  const [infoModalTab, setInfoModalTab] = useState<ModalTab>('details');
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [editedAlbum, setEditedAlbum] = useState<Partial<MyCdAlbum>>({});
  const [infoModalLyricsMode, setInfoModalLyricsMode] = useState<'korean' | 'original' | 'bilingual'>('korean');

  // Modal State: Add New CD Album (Single & Multi-file Batch)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const isAddModalVisible = (externalAddModalOpen ?? false) || isAddModalOpen;
  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    onExternalAddModalClose?.();
  };
  const [addModalTab, setAddModalTab] = useState<'batch' | 'single'>('batch');

  // Drag & Drop onto Window/Gallery State (iTunes Style)
  const [isWindowDragging, setIsWindowDragging] = useState(false);
  const dragCounterRef = useRef(0);
  const multiFileInputRef = useRef<HTMLInputElement | null>(null);
  const folderInputRef = useRef<HTMLInputElement | null>(null);

  // Batch Extraction & Progress State
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number; currentTitle: string }>({
    current: 0,
    total: 0,
    currentTitle: ''
  });
  const [batchResults, setBatchResults] = useState<MyCdAlbum[]>([]);
  const [isBatchCompleted, setIsBatchCompleted] = useState(false);

  // Quick Link Modal State (수작업 개별 Cloudflare R2 링크 등록용)
  const [quickLinkModalAlbum, setQuickLinkModalAlbum] = useState<MyCdAlbum | null>(null);
  const [quickLinkUrl, setQuickLinkUrl] = useState('');
  const [quickLinkPlaying, setQuickLinkPlaying] = useState(false);
  const quickLinkAudioRef = useRef<HTMLAudioElement | null>(null);

  const [newAudioFile, setNewAudioFile] = useState<File | null>(null);
  const [newAudioUrl, setNewAudioUrl] = useState('');
  const [newCoverFile, setNewCoverFile] = useState<File | null>(null);
  const [newCoverPreview, setNewCoverPreview] = useState<string>('');
  const [newSongTitle, setNewSongTitle] = useState('');
  const [newArtist, setNewArtist] = useState('');
  const [newAlbumTitle, setNewAlbumTitle] = useState('');
  const [newAlbumArtist, setNewAlbumArtist] = useState('');
  const [newComposer, setNewComposer] = useState('');
  const [newGenre, setNewGenre] = useState('Religious');
  const [newReleaseYear, setNewReleaseYear] = useState('2026');
  const [newTrackNumber, setNewTrackNumber] = useState(1);
  const [newTotalTracks, setNewTotalTracks] = useState(12);
  const [newDiscNumber, setNewDiscNumber] = useState(1);
  const [newTotalDiscs, setNewTotalDiscs] = useState(1);
  const [newRating, setNewRating] = useState(5);
  const [newIsFavorite, setNewIsFavorite] = useState(true);
  const [newComments, setNewComments] = useState('');
  const [newLyrics, setNewLyrics] = useState('');
  const [newKoreanLyrics, setNewKoreanLyrics] = useState('');
  const [newBpm, setNewBpm] = useState<number | undefined>(undefined);
  const [newBitrate, setNewBitrate] = useState('192kbps');
  const [newChannels, setNewChannels] = useState('2(스테레오)');
  const [newSampleRate, setNewSampleRate] = useState('44.100kHz');
  const [newEncodedBy, setNewEncodedBy] = useState('iTunes 10.6.3.25');
  const [newFormattedDuration, setNewFormattedDuration] = useState('00:02:57');
  const [newDuration, setNewDuration] = useState(177);
  const [isExtractingMeta, setIsExtractingMeta] = useState(false);
  const [extractionNotice, setExtractionNotice] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1 Album 1 Song Principle: Duplicate Album Detection & Confirmation Modal
  const [showDuplicateConfirmModal, setShowDuplicateConfirmModal] = useState(false);

  // Detect if an album with the same album title already exists in the collection
  const duplicateAlbum = useMemo(() => {
    if (!newAlbumTitle.trim()) return null;
    const cleanNew = newAlbumTitle.trim().toLowerCase().replace(/\s+/g, '');
    return albums.find((a) => {
      const cleanExisting = (a.albumTitle || '').trim().toLowerCase().replace(/\s+/g, '');
      return cleanExisting === cleanNew;
    }) || null;
  }, [albums, newAlbumTitle]);

  // Delete confirmation modal
  const [albumToDelete, setAlbumToDelete] = useState<MyCdAlbum | null>(null);

  // Backup & Multi-device Cloud Sync State
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const isBackupModalVisible = (externalBackupModalOpen ?? false) || isBackupModalOpen;
  const handleCloseBackupModal = () => {
    setIsBackupModalOpen(false);
    onExternalBackupModalClose?.();
  };

  // External Shuffle trigger from iTunes sidebar
  useEffect(() => {
    if (shuffleTrigger && shuffleTrigger > 0 && albums.length > 0) {
      const randIdx = Math.floor(Math.random() * albums.length);
      handlePlayAlbum(albums[randIdx]);
    }
  }, [shuffleTrigger]);
  const [isSyncingCloud, setIsSyncingCloud] = useState(false);
  const [syncToast, setSyncToast] = useState('');
  const [backupInputText, setBackupInputText] = useState('');
  const [backupNotice, setBackupNotice] = useState('');
  const backupFileInputRef = useRef<HTMLInputElement | null>(null);

  // Copy lyrics to clipboard helper
  const handleCopyLyrics = async (text: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setLyricsCopied(true);
      setTimeout(() => setLyricsCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  // Helper: Render bilingual stanzas for Hi-Fi player
  const renderBilingualPlayerLyrics = (original: string, korean: string) => {
    const origStanzas = original.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);
    const korStanzas = korean.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);
    const maxLen = Math.max(origStanzas.length, korStanzas.length);

    if (maxLen === 0) {
      return <p className="text-center py-6 text-purple-400">등록된 가사가 없습니다.</p>;
    }

    return (
      <div className="space-y-4">
        {Array.from({ length: maxLen }).map((_, idx) => (
          <div key={idx} className="p-3 bg-purple-950/70 border border-purple-700/40 rounded-lg">
            <div className="text-[10px] font-bold text-amber-300 mb-1.5 flex items-center gap-1">
              <span>Section #{idx + 1}</span>
            </div>
            {origStanzas[idx] && (
              <p className="text-xs text-purple-200 font-mono whitespace-pre-wrap leading-relaxed mb-2 pb-2 border-b border-purple-800/60">
                {origStanzas[idx]}
              </p>
            )}
            {korStanzas[idx] ? (
              <p className="text-xs font-medium text-white whitespace-pre-wrap leading-relaxed">
                {korStanzas[idx]}
              </p>
            ) : (
              <p className="text-xs text-purple-400 italic">한글 번역 준비 중</p>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Helper: Render bilingual stanzas for Info Modal
  const renderBilingualModalLyrics = (original: string, korean: string) => {
    const origStanzas = original.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);
    const korStanzas = korean.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);
    const maxLen = Math.max(origStanzas.length, korStanzas.length);

    if (maxLen === 0) {
      return <p className="text-center py-6 text-gray-400">등록된 가사가 없습니다.</p>;
    }

    return (
      <div className="space-y-4">
        {Array.from({ length: maxLen }).map((_, idx) => (
          <div key={idx} className="p-3.5 bg-[#fbfbfe] border border-[#e2e8f0] rounded-lg">
            <div className="text-[11px] font-bold text-[#7c3aed] mb-1.5 flex items-center gap-1">
              <span>소절 (Section) #{idx + 1}</span>
            </div>
            {origStanzas[idx] && (
              <p className="text-xs text-[#475569] font-mono whitespace-pre-wrap leading-relaxed mb-2 pb-2 border-b border-[#e2e8f0]">
                {origStanzas[idx]}
              </p>
            )}
            {korStanzas[idx] ? (
              <p className="text-xs font-semibold text-[#1e293b] whitespace-pre-wrap leading-relaxed">
                {korStanzas[idx]}
              </p>
            ) : (
              <p className="text-xs text-gray-400 italic">한글 번역 가사 준비 중</p>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Load IndexedDB audio blobs for albums & auto-repair/populate Korean lyrics
  useEffect(() => {
    albums.forEach(async (album) => {
      // 1. Populate Korean lyrics if missing, or repair mojibake
      let needsUpdate = false;
      let targetKorean = album.koreanLyrics;
      let targetOriginal = album.lyrics;

      if (!targetKorean) {
        const foundKorean = getKoreanLyricsForSong(album.songTitle, album.artist, album.lyrics);
        if (foundKorean) {
          targetKorean = foundKorean;
          needsUpdate = true;
        }
      } else if (targetKorean.includes('\uFFFD') || /[\u0080-\u00FF]{2,}/.test(targetKorean)) {
        const repaired = repairKoreanMojibake(targetKorean, album.songTitle, album.artist);
        if (repaired && repaired !== targetKorean) {
          targetKorean = repaired;
          needsUpdate = true;
        }
      }

      if (
        targetOriginal &&
        (targetOriginal.includes('\uFFFD') ||
          album.songTitle.includes('별빛') ||
          album.artist.includes('임영웅') ||
          /[\u0080-\u00FF]{2,}/.test(targetOriginal))
      ) {
        const repaired = repairKoreanMojibake(targetOriginal, album.songTitle, album.artist);
        if (repaired && repaired !== targetOriginal) {
          targetOriginal = repaired;
          needsUpdate = true;
        }
      }

      if (needsUpdate) {
        onUpdateAlbum(album.id, {
          ...(targetKorean !== album.koreanLyrics ? { koreanLyrics: targetKorean } : {}),
          ...(targetOriginal !== album.lyrics ? { lyrics: targetOriginal } : {})
        });
      }

      // 2. Resolve audio blob from IndexedDB
      if (!audioUrlMap[album.id]) {
        try {
          const stored = await findCdAudio(album.id, album.audioFileName, album.songTitle);
          if (stored && stored.blob) {
            const normalized = getNormalizedAudioBlob(stored.blob, stored.fileName || album.audioFileName || 'audio.mp3');
            const url = URL.createObjectURL(normalized);
            setAudioUrlMap((prev) => ({ ...prev, [album.id]: url }));
          } else if (stored && stored.dataUrl) {
            setAudioUrlMap((prev) => ({ ...prev, [album.id]: stored.dataUrl! }));
          } else if (album.audioDataUrl) {
            setAudioUrlMap((prev) => ({ ...prev, [album.id]: album.audioDataUrl! }));
          }
        } catch (err) {
          console.warn('Error loading CD audio from IndexedDB:', err);
        }
      }
    });
  }, [albums]);

  // Audio playback event handling
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    const audio = audioRef.current;
    audio.volume = volume;
    audio.loop = false;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      setDuration(audio.duration || 0);
    };

    const handleEnded = () => {
      const mode = repeatModeRef.current;
      if (mode === 'loop_one') {
        audio.currentTime = 0;
        audio.play().catch(console.warn);
      } else if (mode === 'all') {
        playNextTrackRef.current();
      } else {
        setIsPlaying(false);
      }
    };

    const handleError = (e: any) => {
      console.warn('CD Audio playback error', e);
      setIsPlaying(false);
    };

    const handleStopAll = () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current.src = '';
      }
      if (synthPlaybackRef.current) {
        synthPlaybackRef.current.stop();
        synthPlaybackRef.current = null;
      }
      setIsPlaying(false);
      setPlayingAlbumId(null);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    window.addEventListener('app-audio-stop-all', handleStopAll);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      window.removeEventListener('app-audio-stop-all', handleStopAll);
      try {
        audio.pause();
        audio.currentTime = 0;
        audio.src = '';
      } catch {}
      if (synthPlaybackRef.current) {
        synthPlaybackRef.current.stop();
        synthPlaybackRef.current = null;
      }
      setIsPlaying(false);
    };
  }, [volume]);

  const handlePlayAlbum = async (album: MyCdAlbum, forcePlay = false) => {
    // 0. Synchronously unlock and resume Web Audio API AudioContext during click gesture
    unlockAudioContext();

    // 1. If currently playing this same album, pause it
    if (!forcePlay && playingAlbumId === album.id && isPlaying) {
      if (audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
      }
      if (synthPlaybackRef.current) {
        synthPlaybackRef.current.stop();
        synthPlaybackRef.current = null;
      }
      setIsPlaying(false);
      return;
    }

    // 2. Stop any existing playback (both audio element & synth)
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (synthPlaybackRef.current) {
      synthPlaybackRef.current.stop();
      synthPlaybackRef.current = null;
    }

    // 3. Pause BGM background music so it doesn't clash with CD listening
    if (bgmEngine.getIsPlaying()) {
      bgmEngine.pause();
    }

    // 4. Resolve audio source:
    // HIGHEST PRIORITY: External URL (Cloudflare R2 / CDN link) as requested by user!
    // "방문자가 리스트에서 재생(Play) 버튼을 눌렀을 때, 로컬 첨부파일이 아니라 입력해 둔 외부 URL 주소(R2 링크)가 오디오 태그의 src로 작동하도록 코드를 수정해 줘."
    let src = (album.audioUrl || '').trim();

    // Secondary fallback: in-memory map -> IndexedDB -> audioDataUrl
    if (!src) {
      src = audioUrlMap[album.id];
    }
    if (!src) {
      const stored = await findCdAudio(album.id, album.audioFileName, album.songTitle);
      if (stored && stored.blob) {
        const normalized = getNormalizedAudioBlob(stored.blob, stored.fileName || album.audioFileName || 'audio.mp3');
        src = URL.createObjectURL(normalized);
        setAudioUrlMap((prev) => ({ ...prev, [album.id]: src }));
      } else if (stored && stored.dataUrl) {
        src = stored.dataUrl;
        setAudioUrlMap((prev) => ({ ...prev, [album.id]: src }));
      } else if (album.audioDataUrl) {
        src = album.audioDataUrl;
      }
    }

    // 5. Play Real Audio if src exists! (with download protection for visitor streaming)
    if (src) {
      if (!audioRef.current) {
        audioRef.current = new Audio();
      }
      // Disable audio download controls
      try {
        (audioRef.current as any).controlsList = 'nodownload';
      } catch {}
      audioRef.current.src = src;
      audioRef.current.volume = volume;
      audioRef.current.currentTime = 0;

      try {
        await audioRef.current.play();
        setPlayingAlbumId(album.id);
        setIsPlaying(true);
        onUpdateAlbum(album.id, { playCount: (album.playCount || 0) + 1 });
        return;
      } catch (err) {
        console.warn('Direct audio play failed, falling back to melody synth:', err);
      }
    }

    // 6. If no physical audio file was uploaded, fallback to Web Audio API Acoustic Synth Preview!
    // Music ALWAYS plays and is never silent!
    synthPlaybackRef.current = playCdSynthMelody(
      album.songTitle,
      (time, total) => {
        setCurrentTime(time);
        setDuration(total);
      },
      () => {
        const mode = repeatModeRef.current;
        if (mode === 'loop_one') {
          handlePlayAlbum(album, true);
        } else if (mode === 'all') {
          playNextTrackRef.current(album.id);
        } else {
          setIsPlaying(false);
          synthPlaybackRef.current = null;
        }
      },
      volume
    );
    setPlayingAlbumId(album.id);
    setIsPlaying(true);
    onUpdateAlbum(album.id, { playCount: (album.playCount || 0) + 1 });
  };

  const playNextTrack = (currentId?: string) => {
    const list = filteredAlbumsRef.current.length > 0 ? filteredAlbumsRef.current : albums;
    if (!list || list.length === 0) {
      setIsPlaying(false);
      return;
    }
    const targetId = currentId || playingAlbumIdRef.current;
    const currentIndex = list.findIndex((a) => a.id === targetId);
    let nextIndex = 0;
    if (currentIndex !== -1) {
      nextIndex = (currentIndex + 1) % list.length;
    }
    const nextAlbum = list[nextIndex];
    if (nextAlbum) {
      handlePlayAlbum(nextAlbum, true);
    } else {
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    playNextTrackRef.current = playNextTrack;
  });

  const handlePausePlayback = () => {
    audioRef.current?.pause();
    if (synthPlaybackRef.current) {
      synthPlaybackRef.current.stop();
      synthPlaybackRef.current = null;
    }
    setIsPlaying(false);
  };

  const handleSeek = (time: number) => {
    if (audioRef.current && isFinite(time)) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  // Open full iTunes-style modal
  const handleOpenInfoModal = (album: MyCdAlbum, tab: ModalTab = 'details') => {
    let effectiveAlbum = album;
    if (!album.koreanLyrics) {
      const foundKorean = getKoreanLyricsForSong(album.songTitle, album.artist, album.lyrics);
      if (foundKorean) {
        effectiveAlbum = { ...album, koreanLyrics: foundKorean };
        onUpdateAlbum(album.id, { koreanLyrics: foundKorean });
      }
    }
    setInfoModalAlbum(effectiveAlbum);
    setInfoModalTab(tab);
    setIsEditingInfo(false);
    setEditedAlbum({ ...effectiveAlbum });
    setInfoModalLyricsMode('korean');
  };

  const handleSaveEditedInfo = () => {
    if (!infoModalAlbum || !editedAlbum) return;
    onUpdateAlbum(infoModalAlbum.id, editedAlbum);
    setInfoModalAlbum({ ...infoModalAlbum, ...editedAlbum } as MyCdAlbum);
    setIsEditingInfo(false);
  };

  // File selection for new CD upload with automatic metadata extraction
  const handleAudioFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewAudioFile(file);
    setIsExtractingMeta(true);
    setExtractionNotice('첨부화일에서 ID3 태그 및 오디오 속성값을 정밀 추출하고 있습니다...');

    try {
      const meta = await extractAudioFileMetadata(file);

      if (meta.title) setNewSongTitle(meta.title);
      if (meta.artist) setNewArtist(meta.artist);
      if (meta.album) setNewAlbumTitle(meta.album);
      if (meta.albumArtist) setNewAlbumArtist(meta.albumArtist);
      if (meta.composer) setNewComposer(meta.composer);
      if (meta.genre) setNewGenre(meta.genre);
      if (meta.year) setNewReleaseYear(meta.year);
      if (meta.trackNumber) setNewTrackNumber(meta.trackNumber);
      if (meta.totalTracks) setNewTotalTracks(meta.totalTracks);
      if (meta.discNumber) setNewDiscNumber(meta.discNumber);
      if (meta.totalDiscs) setNewTotalDiscs(meta.totalDiscs);
      if (meta.comment) setNewComments(meta.comment);
      if (meta.lyrics) setNewLyrics(meta.lyrics);
      if (meta.bpm) setNewBpm(meta.bpm);
      if (meta.coverDataUrl) setNewCoverPreview(meta.coverDataUrl);
      if (meta.bitrate) setNewBitrate(meta.bitrate);
      if (meta.channels) setNewChannels(meta.channels);
      if (meta.sampleRate) setNewSampleRate(meta.sampleRate);
      if (meta.encodedBy) setNewEncodedBy(meta.encodedBy);
      if (meta.duration) setNewDuration(meta.duration);
      if (meta.formattedDuration) setNewFormattedDuration(meta.formattedDuration);

      // Auto-extract or match Korean lyrics
      const autoKorean = getKoreanLyricsForSong(meta.title || file.name, meta.artist, meta.lyrics);
      if (autoKorean) {
        setNewKoreanLyrics(autoKorean);
      }

      setExtractionNotice(
        `✅ 첨부화일 속성값 추출 완료! [제목: ${meta.title || file.name} | 아티스트: ${meta.artist || '미지정'} | 앨범: ${meta.album || '미지정'} | 트랙: #${meta.trackNumber || 1} | 길이: ${meta.formattedDuration || '00:02:57'} | 비트 전송률: ${meta.bitrate || '192kbps'} | 샘플 속도: ${meta.sampleRate || '44.100kHz'} | 인코딩: ${meta.encodedBy || 'iTunes 10.6.3.25'}]${autoKorean ? ' (한글 가사 자동 매칭 완료)' : ''}`
      );
    } catch (err) {
      console.warn('Metadata extract error', err);
      setExtractionNotice('화일명 기본 정보가 적용되었습니다.');
    } finally {
      setIsExtractingMeta(false);
    }
  };

  // Quick preset loader for "08 Danny Boy.mp3" from user screenshot
  const handleLoadDannyBoyPreset = () => {
    setNewSongTitle('Danny Boy');
    setNewArtist('Andy Williams');
    setNewAlbumTitle('Williams The Best Fo Andy Williams');
    setNewAlbumArtist('Andy Williams');
    setNewComposer('Frederic Weatherly');
    setNewGenre('Pop');
    setNewReleaseYear('1962');
    setNewTrackNumber(8);
    setNewTotalTracks(18);
    setNewDiscNumber(1);
    setNewTotalDiscs(1);
    setNewRating(5);
    setNewIsFavorite(true);
    setNewComments('08 Danny Boy.mp3 속성값 — 참여 음악가: Andy Williams / 비트 전송률: 192kbps / 길이: 00:02:57');
    setNewCoverPreview('https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80');
    setNewBitrate('192kbps');
    setNewChannels('2(스테레오)');
    setNewSampleRate('44.100kHz');
    setNewEncodedBy('iTunes 10.6.3.25');
    setNewFormattedDuration('00:02:57');
    setNewDuration(177);
    setNewLyrics(`Oh, Danny Boy, the pipes, the pipes are calling
From glen to glen, and down the mountain side,
The summer's gone, and all the roses falling,
It's you, it's you must go and I must bide.

But come ye back when summer's in the meadow,
Or when the valley's hushed and white with snow,
It's I'll be here in sunshine or in shadow,
Oh, Danny Boy, oh Danny Boy, I love you so!

But when ye come, and all the flowers are dying,
If I am dead, as dead I well may be,
You'll come and find the place where I am lying,
And kneel and say an Ave there for me.`);
    setNewKoreanLyrics(KNOWN_KOREAN_LYRICS['danny boy'] || '');
    setExtractionNotice('✨ "08 Danny Boy.mp3" 스크린샷의 모든 속성값 및 한글 번역 가사가 자동 입력되었습니다!');
  };

  const handleCoverFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewCoverFile(file);
    const reader = new FileReader();
    reader.onload = async () => {
      const raw = reader.result as string;
      const compressed = await compressCoverDataUrl(raw, 400, 0.8);
      setNewCoverPreview(compressed);
    };
    reader.readAsDataURL(file);
  };

  // Multi-device Cloud Sync Handler
  const handleSyncToCloud = async () => {
    setIsSyncingCloud(true);
    try {
      // 1. Sync to Central Server so iPad immediately receives ALL albums in real time
      const serverRes = await fetch('/api/albums/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ albums })
      });
      const serverJson = await serverRes.json();

      // 2. Also attempt Firestore in the background
      cloudSyncLocalAlbumsToCloud(albums).catch((err) => console.warn('Firestore backup note:', err));

      const count = serverJson.count || albums.length;
      setSyncToast(`✅ 총 ${count}개 소장 음반이 서버 및 모든 기기에 실시간 동기화되었습니다! iPad에서도 즉시 확인하실 수 있습니다.`);
      setTimeout(() => setSyncToast(''), 6000);
    } catch {
      setSyncToast('⚠️ 동기화 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      setTimeout(() => setSyncToast(''), 5000);
    } finally {
      setIsSyncingCloud(false);
    }
  };

  // Export CD collection to JSON file
  const handleExportJson = () => {
    try {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(albums, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `kwon_cd_collection_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      setBackupNotice(`✅ 총 ${albums.length}개 소장 음반 백업 파일(JSON)이 다운로드되었습니다. iPad에서 이 파일을 불러오시면 즉시 모든 앨범이 나타납니다!`);
    } catch (e) {
      console.warn(e);
      setBackupNotice('❌ 백업 파일 생성 중 오류가 발생했습니다.');
    }
  };

  // Import CD collection from file or text
  const handleImportJsonFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const text = reader.result as string;
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed) && parsed.length > 0) {
          if (onAddAlbums) {
            onAddAlbums(parsed);
          } else {
            parsed.forEach((a) => onAddAlbum(a));
          }
          await fetch('/api/albums/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ albums: parsed })
          }).catch(() => {});
          await cloudSyncLocalAlbumsToCloud(parsed);
          setBackupNotice(`🎉 ${parsed.length}개 소장 음반을 성공적으로 불러왔습니다! 클라우드와 기기에 모두 저장되었습니다.`);
        } else {
          setBackupNotice('⚠️ 올바른 앨범 백업 파일 형식이 아닙니다.');
        }
      } catch {
        setBackupNotice('⚠️ 백업 파일을 읽는 도중 오류가 발생했습니다.');
      }
    };
    reader.readAsText(file);
  };

  const handleImportJsonText = async () => {
    if (!backupInputText.trim()) return;
    try {
      const parsed = JSON.parse(backupInputText.trim());
      if (Array.isArray(parsed) && parsed.length > 0) {
        if (onAddAlbums) {
          onAddAlbums(parsed);
        } else {
          parsed.forEach((a) => onAddAlbum(a));
        }
        await fetch('/api/albums/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ albums: parsed })
        }).catch(() => {});
        await cloudSyncLocalAlbumsToCloud(parsed);
        setBackupNotice(`🎉 ${parsed.length}개 소장 음반을 성공적으로 불러왔습니다! 클라우드와 기기에 모두 저장되었습니다.`);
        setBackupInputText('');
      } else {
        setBackupNotice('⚠️ JSON 데이터 형식이 올바르지 않습니다.');
      }
    } catch {
      setBackupNotice('⚠️ 유효한 JSON 문자열이 아닙니다. 형식을 확인해주세요.');
    }
  };

  const executeAddAlbum = async (replaceExisting = false) => {
    setIsSubmitting(true);
    const albumId = replaceExisting && duplicateAlbum ? duplicateAlbum.id : `mycd-${Date.now()}`;
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '.');

    let audioFileName = newAudioFile?.name || `${newSongTitle}.mp3`;
    let audioFileSize = newAudioFile
      ? `${(newAudioFile.size / (1024 * 1024)).toFixed(1)} MB`
      : replaceExisting && duplicateAlbum?.audioFileSize
      ? duplicateAlbum.audioFileSize
      : '4.2 MB';
    let coverUrl =
      newCoverPreview ||
      (replaceExisting && duplicateAlbum?.coverImageUrl
        ? duplicateAlbum.coverImageUrl
        : 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80');

    if (coverUrl && coverUrl.startsWith('data:image')) {
      coverUrl = await compressCoverDataUrl(coverUrl, 400, 0.8);
    }

    // Save audio blob in IndexedDB
    if (newAudioFile) {
      try {
        await saveCdAudioToDB(albumId, newAudioFile, newAudioFile.name);
        const objUrl = URL.createObjectURL(newAudioFile);
        setAudioUrlMap((prev) => ({ ...prev, [albumId]: objUrl }));
      } catch (err) {
        console.warn('Could not save CD audio blob to IndexedDB:', err);
      }
    }

    const finalKorean = newKoreanLyrics.trim() || getKoreanLyricsForSong(newSongTitle, newArtist, newLyrics);

    const albumPayload: MyCdAlbum = {
      id: albumId,
      songTitle: newSongTitle.trim(),
      artist: newArtist.trim(),
      albumTitle: newAlbumTitle.trim(),
      albumArtist: newAlbumArtist.trim() || newArtist.trim(),
      composer: newComposer.trim(),
      showComposer: true,
      genre: newGenre,
      releaseYear: newReleaseYear.trim() || '2026',
      trackNumber: newTrackNumber || 1,
      totalTracks: newTotalTracks || 12,
      discNumber: newDiscNumber || 1,
      totalDiscs: newTotalDiscs || 1,
      isCompilation: false,
      rating: newRating || 5,
      isFavorite: newIsFavorite,
      bpm: newBpm,
      comments: newComments.trim() || '권용우 소장 CD 아카이브',
      lyrics: newLyrics.trim(),
      koreanLyrics: finalKorean,
      coverImageUrl: coverUrl,
      audioFileName,
      audioUrl: newAudioUrl.trim(),
      audioFileSize,
      audioDuration: newDuration || 177,
      formattedDuration: newFormattedDuration || '00:02:57',
      audioFormat: 'MPEG 오디오 (MP3)',
      bitrate: newBitrate || '192kbps',
      channels: newChannels || '2(스테레오)',
      sampleRate: newSampleRate || '44.100kHz',
      encodedBy: newEncodedBy || 'iTunes 10.6.3.25',
      hasIndexedDbAudio: !!newAudioFile,
      pinned: false,
      dateAdded: todayStr,
      playCount: replaceExisting && duplicateAlbum ? duplicateAlbum.playCount : 0
    };

    if (replaceExisting && duplicateAlbum) {
      onUpdateAlbum(duplicateAlbum.id, albumPayload);
    } else {
      onAddAlbum(albumPayload);
    }

    setIsSubmitting(false);
    setShowDuplicateConfirmModal(false);
    handleCloseAddModal();
    setNewKoreanLyrics('');
    setNewAudioUrl('');

    // Reset Form
    setNewAudioFile(null);
    setNewCoverFile(null);
    setNewCoverPreview('');
    setNewSongTitle('');
    setNewArtist('');
    setNewAlbumTitle('');
    setNewAlbumArtist('');
    setNewComposer('');
    setNewComments('');
    setNewLyrics('');
    setExtractionNotice('');
  };

  const handleSubmitNewAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      alert('관리자 모드에서만 소장 음반을 등록하실 수 있습니다.');
      return;
    }
    if (!newSongTitle.trim() || !newArtist.trim() || !newAlbumTitle.trim()) {
      alert('노래 제목, 아티스트, 앨범명은 필수 입력 항목입니다.');
      return;
    }

    // 1앨범당 대표곡 1곡 원칙 검사: 동일한 앨범명의 음원이 이미 등록되어 있는 경우 확인 모달 팝업
    if (duplicateAlbum) {
      setShowDuplicateConfirmModal(true);
      return;
    }

    await executeAddAlbum(false);
  };

  // Filtered & Sorted Albums
  const filteredAlbums = useMemo(() => {
    let result = [...albums];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (a) =>
          a.songTitle.toLowerCase().includes(q) ||
          a.artist.toLowerCase().includes(q) ||
          a.albumTitle.toLowerCase().includes(q) ||
          (a.composer && a.composer.toLowerCase().includes(q)) ||
          (a.comments && a.comments.toLowerCase().includes(q)) ||
          a.genre.toLowerCase().includes(q) ||
          a.releaseYear.includes(q)
      );
    }

    // Genre filter
    if (selectedGenre !== 'all') {
      result = result.filter((a) => a.genre === selectedGenre);
    }

    // Category pill filter
    if (filterType === 'favorites') {
      result = result.filter((a) => a.isFavorite);
    } else if (filterType === 'five_stars') {
      result = result.filter((a) => a.rating >= 5);
    } else if (filterType === 'pinned') {
      result = result.filter((a) => a.pinned);
    } else if (filterType === 'unlinked') {
      result = result.filter((a) => !a.audioUrl || a.audioUrl.trim() === '');
    }

    // Sort
    result.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;

      switch (sortOption) {
        case 'year_desc':
          return b.releaseYear.localeCompare(a.releaseYear);
        case 'year_asc':
          return a.releaseYear.localeCompare(b.releaseYear);
        case 'song_asc':
          return a.songTitle.localeCompare(b.songTitle);
        case 'artist_asc':
          return a.artist.localeCompare(b.artist);
        case 'rating':
          return b.rating - a.rating;
        case 'plays':
          return (b.playCount || 0) - (a.playCount || 0);
        case 'newest':
        default:
          return (b.dateAdded || '').localeCompare(a.dateAdded || '');
      }
    });

    return result;
  }, [albums, searchQuery, selectedGenre, filterType, sortOption]);

  useEffect(() => {
    filteredAlbumsRef.current = filteredAlbums;
  }, [filteredAlbums]);

  // Unlinked albums count & list for easy sequential manual link registration
  const unlinkedAlbums = useMemo(() => albums.filter((a) => !a.audioUrl || a.audioUrl.trim() === ''), [albums]);

  // Helper: Extract audio files from DataTransfer (supports multi-selection files and folder hierarchy)
  const extractFilesFromDataTransfer = async (dataTransfer: DataTransfer): Promise<File[]> => {
    const result: File[] = [];
    const isAudio = (f: File) => {
      const ext = f.name.split('.').pop()?.toLowerCase() || '';
      return (
        (f.type.startsWith('audio/') || ['mp3', 'm4a', 'flac', 'wav', 'aac', 'ogg', 'wma', 'aiff', 'alac'].includes(ext)) &&
        !f.name.startsWith('._')
      );
    };

    const items = dataTransfer.items;
    if (items && items.length > 0 && typeof (items[0] as any).webkitGetAsEntry === 'function') {
      const queue: any[] = [];
      for (let i = 0; i < items.length; i++) {
        const entry = (items[i] as any).webkitGetAsEntry?.();
        if (entry) queue.push(entry);
      }

      const traverse = async (entry: any): Promise<void> => {
        if (entry.isFile) {
          await new Promise<void>((resolve) => {
            entry.file((file: File) => {
              if (isAudio(file)) result.push(file);
              resolve();
            }, () => resolve());
          });
        } else if (entry.isDirectory) {
          const reader = entry.createReader();
          const readAllEntries = async (): Promise<any[]> => {
            const entriesList: any[] = [];
            const readChunk = async () => {
              const chunk = await new Promise<any[]>((resolve) => {
                reader.readEntries((entries: any[]) => resolve(entries || []), () => resolve([]));
              });
              if (chunk.length > 0) {
                entriesList.push(...chunk);
                await readChunk();
              }
            };
            await readChunk();
            return entriesList;
          };

          const entries = await readAllEntries();
          for (const child of entries) {
            await traverse(child);
          }
        }
      };

      while (queue.length > 0) {
        const entry = queue.shift();
        await traverse(entry);
      }
    }

    if (result.length === 0 && dataTransfer.files && dataTransfer.files.length > 0) {
      for (let i = 0; i < dataTransfer.files.length; i++) {
        const f = dataTransfer.files[i];
        if (isAudio(f)) result.push(f);
      }
    }

    return result;
  };

  // Main Batch Processing Engine
  const processBatchFiles = async (files: File[]) => {
    if (!isAdmin) {
      alert('관리자 모드에서만 소장 음반을 일괄 등록하실 수 있습니다.');
      return;
    }
    const audioFiles = files.filter((f) => {
      const ext = f.name.split('.').pop()?.toLowerCase() || '';
      return (
        (f.type.startsWith('audio/') || ['mp3', 'm4a', 'flac', 'wav', 'aac', 'ogg', 'wma', 'aiff', 'alac'].includes(ext)) &&
        !f.name.startsWith('._')
      );
    });

    if (audioFiles.length === 0) {
      alert('등록 가능한 오디오 파일(MP3, M4A, FLAC 등)을 찾지 못했습니다.');
      return;
    }

    // Natural sort by filename (so track order like 01 ..., 02 ... is preserved)
    audioFiles.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));

    setIsBatchProcessing(true);
    setIsBatchCompleted(false);
    setBatchProgress({ current: 0, total: audioFiles.length, currentTitle: audioFiles[0].name });
    setBatchResults([]);

    const createdAlbums: MyCdAlbum[] = [];
    const DEFAULT_COVERS = [
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=600&q=80'
    ];

    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '.');

    for (let i = 0; i < audioFiles.length; i++) {
      const file = audioFiles[i];
      setBatchProgress({ current: i + 1, total: audioFiles.length, currentTitle: file.name });

      try {
        const meta = await extractAudioFileMetadata(file);

        let finalCover = meta.coverDataUrl;
        if (finalCover) {
          try {
            finalCover = await compressCoverDataUrl(finalCover, 360, 0.8);
          } catch {
            // ignore
          }
        } else {
          finalCover = DEFAULT_COVERS[i % DEFAULT_COVERS.length];
        }

        const songTitle = meta.title || file.name.replace(/\.[^/.]+$/, '').trim();
        const artist = meta.artist || '미지정 아티스트';
        const albumTitle = meta.album || (meta.title ? `${meta.title} Single` : '소장 음원 컬렉션');
        const autoKorean = getKoreanLyricsForSong(songTitle, artist, meta.lyrics);

        const newAlbum: MyCdAlbum = {
          id: `cd-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 7)}`,
          songTitle,
          artist,
          albumTitle,
          albumArtist: meta.albumArtist || artist,
          composer: meta.composer || '',
          showComposer: false,
          grouping: '',
          genre: meta.genre || 'Pop',
          releaseYear: meta.year || `${new Date().getFullYear()}`,
          trackNumber: meta.trackNumber || (i + 1),
          totalTracks: meta.totalTracks || audioFiles.length,
          discNumber: meta.discNumber || 1,
          totalDiscs: meta.totalDiscs || 1,
          isCompilation: false,
          rating: 5,
          isFavorite: false,
          bpm: meta.bpm,
          playCount: 0,
          comments: meta.comment || `${file.name} 일괄 자동 등록 (ID3 메타데이터 추출)`,
          lyrics: meta.lyrics || '',
          koreanLyrics: autoKorean || '',
          coverImageUrl: finalCover,
          audioFileName: file.name,
          audioUrl: '', // Cloudflare R2 링크는 사용자가 수작업으로 등록하도록 비워둠
          audioFileSize: meta.fileSizeFormatted || `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          audioDuration: meta.duration || 177,
          formattedDuration: meta.formattedDuration || '00:02:57',
          audioFormat: meta.audioFormat || 'MPEG 오디오 (MP3)',
          bitrate: meta.bitrate || '192kbps',
          channels: meta.channels || '2(스테레오)',
          sampleRate: meta.sampleRate || '44.100kHz',
          encodedBy: meta.encodedBy || 'iTunes 10.6.3.25',
          dateAdded: todayStr,
          pinned: false,
          likes: 0
        };

        // Save audio blob in IndexedDB for local play fallback if available
        try {
          await saveCdAudioToDB(newAlbum.id, file, file.name);
          const objUrl = URL.createObjectURL(file);
          setAudioUrlMap((prev) => ({ ...prev, [newAlbum.id]: objUrl }));
        } catch {
          // ignore
        }

        createdAlbums.push(newAlbum);
        setBatchResults((prev) => [...prev, newAlbum]);
      } catch (err) {
        console.warn(`Error parsing file ${file.name}:`, err);
      }

      await new Promise((r) => setTimeout(r, 6));
    }

    if (createdAlbums.length > 0) {
      if (onAddAlbums) {
        onAddAlbums(createdAlbums);
      } else {
        createdAlbums.forEach((a) => onAddAlbum(a));
      }
      setIsBatchCompleted(true);
    }
  };

  // Window drag & drop handlers
  const handleWindowDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current += 1;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsWindowDragging(true);
    }
  };

  const handleWindowDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleWindowDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current -= 1;
    if (dragCounterRef.current <= 0) {
      dragCounterRef.current = 0;
      setIsWindowDragging(false);
    }
  };

  const handleWindowDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current = 0;
    setIsWindowDragging(false);

    if (!isAdmin) {
      alert('관리자 모드에서만 소장 음반을 등록하실 수 있습니다.');
      return;
    }

    const files = await extractFilesFromDataTransfer(e.dataTransfer);
    if (files.length > 0) {
      processBatchFiles(files);
    }
  };

  const handleMultiFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      processBatchFiles(filesArray);
    }
    e.target.value = '';
  };

  const handleFolderInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      processBatchFiles(filesArray);
    }
    e.target.value = '';
  };

  // Quick Link Modal Handlers
  const openQuickLinkModal = (album: MyCdAlbum) => {
    if (quickLinkAudioRef.current) {
      quickLinkAudioRef.current.pause();
      quickLinkAudioRef.current = null;
    }
    setQuickLinkPlaying(false);
    setQuickLinkModalAlbum(album);
    setQuickLinkUrl(album.audioUrl || '');
  };

  const handleToggleTestPlay = () => {
    if (quickLinkPlaying) {
      if (quickLinkAudioRef.current) {
        quickLinkAudioRef.current.pause();
        quickLinkAudioRef.current = null;
      }
      setQuickLinkPlaying(false);
    } else {
      if (!quickLinkUrl.trim()) return;
      const testAudio = new Audio(quickLinkUrl.trim());
      quickLinkAudioRef.current = testAudio;
      testAudio.play().then(() => {
        setQuickLinkPlaying(true);
      }).catch((err) => {
        console.warn('Playback error:', err);
        alert('해당 URL로 음원을 재생할 수 없습니다. URL 주소 및 파일 링크를 확인해주세요.');
      });
      testAudio.onended = () => setQuickLinkPlaying(false);
      testAudio.onerror = () => {
        setQuickLinkPlaying(false);
        alert('음원 로딩 오류: 올바른 오디오 파일 링크인지 확인해주세요.');
      };
    }
  };

  const handleSaveQuickLink = (andNext: boolean = false) => {
    if (!quickLinkModalAlbum) return;
    const url = quickLinkUrl.trim();
    onUpdateAlbum(quickLinkModalAlbum.id, { audioUrl: url });

    // Sync to central server
    fetch('/api/albums/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        albums: albums.map((a) => a.id === quickLinkModalAlbum.id ? { ...a, audioUrl: url } : a)
      })
    }).catch(() => {});

    if (quickLinkAudioRef.current) {
      quickLinkAudioRef.current.pause();
      quickLinkAudioRef.current = null;
      setQuickLinkPlaying(false);
    }

    if (andNext) {
      // Find next unlinked album
      const remainingUnlinked = albums.filter((a) => (!a.audioUrl || a.audioUrl.trim() === '') && a.id !== quickLinkModalAlbum.id);
      if (remainingUnlinked.length > 0) {
        setQuickLinkModalAlbum(remainingUnlinked[0]);
        setQuickLinkUrl(remainingUnlinked[0].audioUrl || '');
        return;
      }
    }
    setQuickLinkModalAlbum(null);
  };

  const currentlyPlayingAlbum = albums.find((a) => a.id === playingAlbumId);

  const formatSeconds = (sec: number) => {
    if (!sec || isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div
      onDragEnter={handleWindowDragEnter}
      onDragOver={handleWindowDragOver}
      onDragLeave={handleWindowDragLeave}
      onDrop={handleWindowDrop}
      className="flex-1 min-h-0 flex flex-col gap-2.5 h-full overflow-hidden relative"
    >
      {/* Hidden Multi-file and Folder input pickers */}
      <input
        ref={multiFileInputRef}
        type="file"
        multiple
        accept="audio/*,.mp3,.m4a,.flac,.wav,.aac,.ogg,.wma,.aiff,.alac"
        onChange={handleMultiFileInputChange}
        className="hidden"
      />
      <input
        ref={folderInputRef}
        type="file"
        multiple
        {...({ webkitdirectory: '', directory: '' } as any)}
        onChange={handleFolderInputChange}
        className="hidden"
      />

      {/* Fullscreen/Container Drag & Drop Overlay (iTunes Style) */}
      {isWindowDragging && isAdmin && (
        <div className="absolute inset-0 z-50 bg-[#1e1b4b]/92 backdrop-blur-md border-4 border-dashed border-[#ff6b2b] rounded-2xl flex flex-col items-center justify-center p-6 text-center text-white pointer-events-none animate-fadeIn shadow-2xl">
          <div className="w-20 h-20 rounded-full bg-linear-to-tr from-[#ff6b2b] to-[#7c3aed] flex items-center justify-center mb-4 shadow-xl animate-bounce">
            <Disc3 className="w-10 h-10 text-white animate-spin" style={{ animationDuration: '4s' }} />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white mb-2 drop-shadow-md">
            🎵 음원 파일을 여기에 놓으세요! (아이튠즈 방식 일괄 등록)
          </h2>
          <p className="text-sm text-purple-200 font-medium max-w-lg mb-3 leading-relaxed">
            50~100곡의 다중 음원 파일(MP3, M4A, FLAC 등) 또는 상위 폴더를 드래그하여 놓으시면,<br />
            ID3 메타데이터(곡명, 가수, 앨범, 트랙, 장르, 연도, 가사, 앨범커버)를 자동 추출하여 즉시 라이브러리에 등록합니다.
          </p>
          <div className="inline-flex items-center gap-1.5 bg-black/45 border border-white/20 px-3.5 py-1.5 rounded-full text-xs text-amber-300 font-mono shadow-inner">
            <Radio className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>💡 Cloudflare R2 스트리밍 재생 링크는 등록 완료 후 개별 수작업으로 등록하실 수 있습니다.</span>
          </div>
        </div>
      )}

      {/* Floating On-Screen Volume HUD (키보드 좌/우 방향키 & 마우스 휠 조절 시 피드백 표시) */}
      {showVolumeToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#1e1b4b]/95 backdrop-blur-md text-white px-4 py-2 rounded-full shadow-2xl flex items-center gap-2.5 text-xs font-mono font-bold border border-purple-400/50 animate-fadeIn pointer-events-none select-none">
          {volume === 0 ? (
            <VolumeX className="w-4 h-4 text-red-400 shrink-0" />
          ) : (
            <Volume2 className="w-4 h-4 text-[#ff6b2b] shrink-0" />
          )}
          <span className="whitespace-nowrap">볼륨 {Math.round(volume * 100)}%</span>
          <div className="w-24 h-1.5 bg-purple-950 rounded-full overflow-hidden border border-purple-500/30">
            <div
              className="h-full bg-linear-to-r from-[#ff6b2b] to-[#ea580c] transition-all duration-75"
              style={{ width: `${Math.round(volume * 100)}%` }}
            />
          </div>
          <span className="text-[10px] text-purple-300 font-normal">
            (좌/우 방향키 · 휠)
          </span>
        </div>
      )}

      {syncToast && (
        <div className="p-3 bg-indigo-50 border border-indigo-200 text-indigo-900 rounded-xl text-xs flex items-center justify-between gap-2 shadow-xs animate-fadeIn">
          <div className="flex items-center gap-2">
            <Cloud className="w-4 h-4 text-indigo-600 shrink-0" />
            <span className="font-medium">{syncToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setSyncToast('')}
            className="text-indigo-400 hover:text-indigo-700 p-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Cloudflare R2 재생 링크 미등록 안내 배너 */}
      {unlinkedAlbums.length > 0 && (
        <div className="bg-amber-50/95 border border-amber-300 text-amber-950 px-3 py-2 rounded-xl text-xs flex flex-wrap items-center justify-between gap-2 shadow-xs animate-fadeIn shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <Radio className="w-4 h-4 text-amber-600 shrink-0 animate-pulse" />
            <div className="min-w-0">
              <span className="font-bold text-amber-900">
                Cloudflare R2 스트리밍 링크 미등록 ({unlinkedAlbums.length}곡):
              </span>{' '}
              <span className="text-amber-800 text-[11px]">
                일괄 등록된 음원의 실제 재생 링크를 수작업으로 개별 등록해주세요.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {filterType !== 'unlinked' && (
              <button
                type="button"
                onClick={() => setFilterType('unlinked')}
                className="px-2 py-1 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-md font-bold text-[11px] transition-colors cursor-pointer"
              >
                미등록 곡만 보기 ({unlinkedAlbums.length})
              </button>
            )}
            {isAdmin && (
              <button
                type="button"
                onClick={() => openQuickLinkModal(unlinkedAlbums[0])}
                className="px-2.5 py-1 bg-[#ea580c] hover:bg-[#c2410c] text-white rounded-md font-bold text-[11px] flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
              >
                <Link className="w-3 h-3" />
                <span>순차적으로 링크 등록하기 ➔</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Hi-Fi CD Player Banner (When Playing or Selected) */}
      {/* Floating Active Audio Player Bar (Slim Single-Row Compact Design) */}
      {currentlyPlayingAlbum && (
        <div
          onWheel={handleWheelVolume}
          className="bg-[#1e1b4b] border-2 border-[#7c3aed] text-white rounded-xl px-2.5 py-1 sm:py-1.5 mb-1 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-2 animate-fadeIn relative overflow-hidden shrink-0"
          title="재생 바 위에서 마우스 휠을 굴리거나, 키보드 좌/우(◀/▶) 방향키를 누르면 볼륨이 조절됩니다."
        >
          {/* Ambient Glow */}
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-purple-600/20 rounded-full blur-2xl pointer-events-none" />

          {/* Left: Track Info & Mini Disc */}
          <div className="flex items-center gap-2 min-w-0 z-10 flex-1">
            {/* Spinning CD Visual */}
            <div className="relative w-8 h-8 sm:w-9 sm:h-9 shrink-0">
              <img
                src={currentlyPlayingAlbum.coverImageUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80'}
                alt={currentlyPlayingAlbum.albumTitle}
                className="w-full h-full object-cover rounded-md shadow-md border border-white/20"
              />
              <div
                className={`absolute inset-0 rounded-full border-2 border-white/30 flex items-center justify-center transition-all ${
                  isPlaying ? 'animate-spin' : ''
                }`}
                style={{ animationDuration: '4s' }}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-purple-900 border border-white/60 flex items-center justify-center">
                  <div className="w-1 h-1 rounded-full bg-white" />
                </div>
              </div>
            </div>

            {/* Track Info */}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap leading-tight">
                <span className="text-[9px] bg-[#ff6b2b] text-white px-1 py-0.2 rounded font-bold uppercase tracking-wider">
                  {isPlaying ? 'PLAY' : 'STOP'}
                </span>
                <span className="text-xs sm:text-sm font-bold text-white truncate">
                  {currentlyPlayingAlbum.songTitle}
                </span>
                <span className="text-[11px] font-normal text-purple-200 truncate">
                  — {currentlyPlayingAlbum.artist}
                </span>
              </div>
              <p className="text-[10px] text-purple-300 truncate leading-tight mt-0.5">
                {currentlyPlayingAlbum.albumTitle}
              </p>
            </div>
          </div>

          {/* Center: Dynamic Hi-Fi Stereo Graphic Equalizer (사용자가 요청한 붉은색 동그라미 위치) */}
          <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1 bg-black/45 border border-purple-500/40 rounded-lg shadow-inner z-10 shrink-0 select-none mx-auto sm:mx-0">
            {/* Left Channel Indicator */}
            <div className="flex flex-col items-center justify-center leading-none text-[8px] font-mono text-purple-300 mr-0.5">
              <span className="font-bold text-[#ff9f43]">EQ</span>
              <span className="text-[7px] text-purple-400">STEREO</span>
            </div>

            {/* 18-Band Animated Frequency Bars */}
            <div className="flex items-end gap-0.5 h-6 sm:h-6.5 w-28 sm:w-36 md:w-44 px-1 py-0.5 bg-black/60 rounded border border-purple-900/60 shadow-inner">
              {CD_EQ_BARS.map((bar, idx) => (
                <div
                  key={idx}
                  className="flex-1 h-full flex items-end justify-center"
                >
                  <div
                    className={`w-full max-w-[5px] rounded-xs transition-all duration-150 ${
                      isPlaying
                        ? 'bg-gradient-to-t from-emerald-400 via-amber-300 to-rose-500 shadow-[0_0_4px_rgba(255,107,43,0.35)]'
                        : 'bg-purple-900/40'
                    }`}
                    style={{
                      height: isPlaying ? undefined : `${bar.minH}%`,
                      animation: isPlaying
                        ? `${bar.anim} ${bar.dur} ease-in-out infinite alternate ${bar.delay}`
                        : 'none'
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Right Status Indicator */}
            <div className="flex flex-col items-center justify-center leading-none text-[8px] font-mono text-purple-300 ml-0.5">
              <span className={`font-bold transition-colors ${isPlaying ? 'text-emerald-400 animate-pulse' : 'text-purple-500'}`}>
                {isPlaying ? 'LIVE' : 'OFF'}
              </span>
              <span className="text-[7px] text-purple-400">Hi-Fi</span>
            </div>
          </div>

          {/* Right: Controls, Seek Bar & Volume Bar in a Compact Row */}
          <div className="flex items-center gap-2 z-10 shrink-0 justify-between sm:justify-end">
            <div className="flex items-center gap-1.5 shrink-0">
              {/* 3단 토글 메뉴: 1곡 / 무한반복 / 전체재생 */}
              <button
                type="button"
                onClick={cycleRepeatMode}
                className={`px-2 py-1 rounded-md text-[10px] sm:text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer border select-none shrink-0 ${
                  repeatMode === 'loop_one'
                    ? 'bg-[#ff6b2b] text-white border-[#ff9f43] shadow-[0_0_8px_rgba(255,107,43,0.45)] ring-1 ring-white/50'
                    : repeatMode === 'all'
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.45)] ring-1 ring-white/50'
                    : 'bg-purple-950/70 hover:bg-purple-900/90 text-purple-200 hover:text-white border-purple-500/30'
                }`}
                title={
                  repeatMode === 'single'
                    ? '1곡 재생 중 (곡 끝나면 정지 | 클릭 시 [무한반복]으로 전환)'
                    : repeatMode === 'loop_one'
                    ? '한곡 무한반복 중 (현재 곡 계속 반복 | 클릭 시 [전체재생]으로 전환)'
                    : '전체재생 중 (리스트 다음 곡 자동 연속재생 | 클릭 시 [1곡]으로 전환)'
                }
              >
                {repeatMode === 'loop_one' && (
                  <RotateCw className="w-3 h-3 animate-spin [animation-duration:3s] text-white" />
                )}
                {repeatMode === 'all' && (
                  <ListMusic className="w-3 h-3 text-white" />
                )}
                {repeatMode === 'single' && (
                  <Disc className="w-3 h-3 text-purple-300" />
                )}
                <span>
                  {repeatMode === 'single' ? '1곡' : repeatMode === 'loop_one' ? '무한반복' : '전체재생'}
                </span>
                <span
                  className={`text-[8px] px-1 py-0.2 rounded font-black tracking-tight leading-none ${
                    repeatMode === 'loop_one'
                      ? 'bg-yellow-300 text-black'
                      : repeatMode === 'all'
                      ? 'bg-emerald-200 text-emerald-950'
                      : 'bg-purple-900/80 text-purple-300'
                  }`}
                >
                  {repeatMode === 'single' ? '1곡' : repeatMode === 'loop_one' ? '반복' : '전체'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handlePlayAlbum(currentlyPlayingAlbum)}
                className="w-7 h-7 rounded-full bg-[#ff6b2b] hover:bg-[#ea580c] text-white flex items-center justify-center shadow-md transition-transform active:scale-95 cursor-pointer shrink-0"
                title={isPlaying ? '일시정지' : '재생'}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
              </button>
            </div>

            {/* Seek Bar: Slim & Clean */}
            <div className="flex items-center gap-1.5 w-32 sm:w-48 text-[10px] text-purple-300 font-mono">
              <span className="shrink-0">{formatSeconds(currentTime)}</span>
              <input
                type="range"
                min="0"
                max={duration || 100}
                value={currentTime}
                onChange={(e) => handleSeek(parseFloat(e.target.value))}
                aria-label="재생 구간 탐색"
                className="flex-1 h-1.5 bg-purple-950/80 rounded-full appearance-none cursor-pointer accent-[#ff6b2b]"
              />
              <span className="shrink-0">{formatSeconds(duration || currentlyPlayingAlbum.audioDuration || 215)}</span>
            </div>

            {/* Volume Control (마우스 휠 & 드래그 & 클릭 모두 지원) */}
            <div
              onWheel={handleWheelVolume}
              className="flex items-center gap-1 bg-purple-950/70 hover:bg-purple-950/90 px-1.5 py-0.5 rounded border border-purple-500/30 text-[10px] text-purple-300 font-mono select-none cursor-pointer"
              title={`볼륨: ${Math.round(volume * 100)}% (마우스 휠을 굴리거나 좌/우 방향키로 조절)`}
            >
              <button
                type="button"
                onClick={handleToggleMute}
                className="text-purple-300 hover:text-white transition-colors p-0.5 cursor-pointer shrink-0"
                title={volume === 0 ? '음소거 해제' : '음소거'}
              >
                {volume === 0 ? (
                  <VolumeX className="w-3 h-3 text-red-400" />
                ) : (
                  <Volume2 className="w-3 h-3 text-[#ff6b2b]" />
                )}
              </button>

              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                aria-label="볼륨 조절"
                className="w-14 sm:w-20 h-1 bg-purple-900/80 rounded-full appearance-none cursor-pointer accent-[#ff6b2b]"
              />

              <span className="w-6 text-right font-mono font-bold text-purple-200 shrink-0 text-[9px]">
                {Math.round(volume * 100)}%
              </span>
            </div>

            <button
              type="button"
              onClick={handlePausePlayback}
              className="p-1 text-purple-400 hover:text-white cursor-pointer shrink-0 ml-0.5"
              title="플레이어 닫기"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Top Quick Bar: Bulk File Import Actions & Counter */}
      {isAdmin && (
        <div className="flex items-center justify-between gap-2 px-1 py-0.5 text-xs text-[#475569] shrink-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-[#1e293b] flex items-center gap-1">
              <Disc3 className="w-3.5 h-3.5 text-[#7c3aed]" />
              <span>소장 라이브러리 ({filteredAlbums.length}곡)</span>
            </span>
            {unlinkedAlbums.length > 0 && (
              <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.5 rounded border border-amber-200">
                R2 미등록: {unlinkedAlbums.length}곡
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => multiFileInputRef.current?.click()}
              className="px-2.5 py-1 bg-white hover:bg-gray-50 text-[#7c3aed] border border-[#d8b4fe] rounded-lg font-bold text-[11px] flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
              title="50~100곡의 오디오 파일을 한 번에 선택하여 일괄 등록"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">다중 음원 일괄 등록 (50~100곡)</span>
              <span className="sm:hidden">다중 등록</span>
            </button>
            <button
              type="button"
              onClick={() => folderInputRef.current?.click()}
              className="px-2.5 py-1 bg-white hover:bg-gray-50 text-[#475569] border border-[#cbd5e1] rounded-lg font-bold text-[11px] flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
              title="음원이 담긴 상위 폴더를 통째로 선택하여 일괄 등록"
            >
              <FolderPlus className="w-3.5 h-3.5 text-[#0284c7]" />
              <span className="hidden sm:inline">상위 폴더 등록</span>
              <span className="sm:hidden">폴더</span>
            </button>
          </div>
        </div>
      )}

      {/* Album Cards Grid (Dedicated Red-box scrollable container) */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-retro-scrollbar pr-1">
        {filteredAlbums.length === 0 ? (
        <div className="bg-white border border-dashed border-[#cbd5e1] rounded-xl p-12 text-center flex flex-col items-center justify-center gap-2">
          <Disc3 className="w-10 h-10 text-[#94a3b8]" />
          <p className="text-sm font-bold text-[#334155]">검색 조건에 맞는 소장 CD 음반이 없습니다.</p>
          <p className="text-xs text-[#64748b]">다른 검색어를 입력하시거나 필터를 전체로 설정해보세요.</p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedGenre('all');
              setFilterType('all');
            }}
            className="mt-2 px-3.5 py-1.5 bg-[#7c3aed] text-white rounded-lg text-xs font-bold cursor-pointer"
          >
            전체 목록 보기
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 sm:gap-2.5">
          {filteredAlbums.map((album) => {
            const isThisPlaying = playingAlbumId === album.id && isPlaying;

            return (
              <div
                key={album.id}
                className={`relative aspect-square rounded-xl border transition-all duration-300 overflow-hidden group select-none shadow-xs hover:shadow-lg ${
                  isThisPlaying
                    ? 'border-[#ff6b2b] ring-3 ring-[#ff6b2b]/35 shadow-purple-500/20'
                    : 'border-[#cbd5e1] hover:border-[#7c3aed]'
                }`}
              >
                {/* 1. Full Album Cover Artwork */}
                <img
                  src={album.coverImageUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80'}
                  alt={album.albumTitle}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* 2. CD Disc Visual Peeking Out (Iconic vinyl/CD jewel case) */}
                <div
                  className={`absolute -right-8 top-1/2 -translate-y-1/2 w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-white/40 shadow-2xl transition-transform duration-500 pointer-events-none ${
                    isThisPlaying
                      ? 'translate-x-0 animate-spin'
                      : 'group-hover:-translate-x-2'
                  }`}
                  style={{
                    background: 'radial-gradient(circle, #334155 0%, #0f172a 60%, #475569 100%)',
                    animationDuration: '3s'
                  }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-6 h-6 rounded-full border border-white/60 bg-purple-900/80 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                  </div>
                </div>

                {/* 3. Top Header Inside Cover: Genre, Year & Favorite / Pinned / R2 Badges */}
                <div className="absolute top-1.5 left-1.5 right-1.5 flex items-center justify-between z-20 pointer-events-none">
                  {/* Left: Genre + Year + R2 Status */}
                  <div className="flex items-center gap-1 pointer-events-auto">
                    <span className="bg-black/75 backdrop-blur-xs text-white text-[9px] font-bold px-1.5 py-0.5 rounded border border-white/20 shadow-xs">
                      {album.genre}
                    </span>
                    <span className="bg-black/75 backdrop-blur-xs text-[#fde047] text-[9px] font-bold px-1 py-0.5 rounded border border-white/20 shadow-xs">
                      {album.releaseYear}
                    </span>
                    {album.pinned && (
                      <span className="bg-[#ff6b2b]/90 backdrop-blur-xs text-white text-[9px] font-bold px-1.5 py-0.5 rounded border border-white/20 shadow-xs flex items-center gap-0.5" title="대표작 음반">
                        <Pin className="w-2.5 h-2.5 fill-current" />
                      </span>
                    )}
                    {album.audioUrl ? (
                      <span className="bg-emerald-950/85 backdrop-blur-xs text-emerald-300 text-[8px] font-bold px-1 py-0.5 rounded border border-emerald-500/40 shadow-xs flex items-center gap-0.5" title="Cloudflare R2 스트리밍 연결됨">
                        <Check className="w-2.5 h-2.5 text-emerald-400" />
                        <span>R2</span>
                      </span>
                    ) : (
                      <span className="bg-amber-950/85 backdrop-blur-xs text-amber-300 text-[8px] font-bold px-1 py-0.5 rounded border border-amber-500/40 shadow-xs flex items-center gap-0.5" title="Cloudflare R2 링크 미등록 (수작업 등록 대기)">
                        <Radio className="w-2.5 h-2.5 text-amber-400" />
                        <span>미등록</span>
                      </span>
                    )}
                  </div>

                  {/* Right: Favorite Heart Button */}
                  <div className="flex items-center gap-1 pointer-events-auto">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateAlbum(album.id, { isFavorite: !album.isFavorite });
                      }}
                      className={`p-1 rounded-full backdrop-blur-xs transition-colors cursor-pointer border border-white/20 shadow-xs ${
                        album.isFavorite ? 'bg-red-600/90 text-white' : 'bg-black/50 text-white/80 hover:text-red-400'
                      }`}
                      title={album.isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
                    >
                      <Heart className="w-3 h-3 fill-current" />
                    </button>
                  </div>
                </div>

                {/* 4. Complete Details Moved Inside Album Cover ("동그라미 내용을 앨범 표지 내부로 이동") */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/75 via-45% to-transparent flex flex-col justify-end px-1.5 py-1.5 sm:px-2 sm:py-2 z-10 transition-all">
                  {/* Row 1: Track Number, Song Title & Play/Pause Button */}
                  <div className="flex items-center justify-between gap-1.5 mb-0.5">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1 leading-none mb-0.5">
                        <span className="text-[9px] text-purple-300 font-mono">
                          Tr.{album.trackNumber || 1}
                        </span>
                        {isThisPlaying && (
                          <span className="text-[8px] bg-emerald-500 text-white font-bold px-1 py-0.2 rounded animate-pulse">
                            PLAYING
                          </span>
                        )}
                      </div>
                      <h4
                        className="text-xs sm:text-[13px] font-bold text-white hover:text-[#ff9f43] transition-colors truncate drop-shadow-sm cursor-pointer leading-tight"
                        onClick={() => handleOpenInfoModal(album, 'details')}
                        title={album.songTitle}
                      >
                        {album.songTitle}
                      </h4>
                    </div>

                    {/* Play / Pause Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayAlbum(album);
                      }}
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-90 cursor-pointer shrink-0 ${
                        isThisPlaying
                          ? 'bg-[#ff6b2b] text-white ring-2 ring-white/60 animate-pulse'
                          : 'bg-white text-[#7c3aed] hover:bg-[#ff6b2b] hover:text-white'
                      }`}
                      title={isThisPlaying ? '일시정지' : '음원 재생'}
                    >
                      {isThisPlaying ? (
                        <Pause className="w-3.5 h-3.5 fill-current" />
                      ) : (
                        <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                      )}
                    </button>
                  </div>

                  {/* Row 2: Artist & Album Title */}
                  <p className="text-[10px] sm:text-[11px] text-purple-200/90 truncate leading-tight mb-1">
                    <span className="font-semibold text-white/95">{album.artist}</span>
                    {album.albumTitle && (
                      <span className="text-white/60 ml-1">· {album.albumTitle}</span>
                    )}
                  </p>

                  {/* Row 3: Action Buttons (곡정보, 가사, 횟수, 관리자 핀/수정/삭제) */}
                  <div className="flex items-center justify-between gap-0.5 pt-1 border-t border-white/20 text-[9px] sm:text-[10px]">
                    <div className="flex items-center gap-0.5 shrink-0 flex-nowrap">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenInfoModal(album, 'details');
                        }}
                        className="px-1 py-0.5 bg-white/20 hover:bg-white/35 text-white border border-white/25 rounded font-medium text-[8.5px] sm:text-[9.5px] whitespace-nowrap transition-colors cursor-pointer backdrop-blur-xs"
                        title="곡 정보 세부사항"
                      >
                        곡정보
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenInfoModal(album, 'lyrics');
                        }}
                        className="px-1 py-0.5 bg-[#ff6b2b]/35 hover:bg-[#ff6b2b]/55 text-[#ffd0b5] border border-[#ff6b2b]/50 rounded font-medium text-[8.5px] sm:text-[9.5px] whitespace-nowrap transition-colors cursor-pointer backdrop-blur-xs"
                        title="한글 가사 및 원문 가사 보기"
                      >
                        가사
                      </button>

                      {/* R2 링크 수작업 등록 버튼 (미등록 시 원클릭 등록 버튼 노출) */}
                      {isAdmin && (!album.audioUrl || album.audioUrl.trim() === '') && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openQuickLinkModal(album);
                          }}
                          className="px-1 py-0.5 bg-[#ea580c] hover:bg-[#c2410c] text-white border border-amber-300/80 rounded font-bold text-[8px] sm:text-[9px] whitespace-nowrap transition-transform active:scale-95 cursor-pointer backdrop-blur-xs flex items-center gap-0.5 shadow-xs"
                          title="Cloudflare R2 스트리밍 링크 수작업 등록"
                        >
                          <Link className="w-2.5 h-2.5" />
                          <span>R2등록</span>
                        </button>
                      )}

                      {/* 횟수 배지 - 좌우 패딩을 줄여 삭제(휴지통) 버튼이 항상 넉넉하게 노출되도록 최적화 */}
                      <span
                        className="text-[8.5px] sm:text-[9.5px] font-medium text-purple-200 bg-black/50 px-0.5 sm:px-1 py-0.5 rounded border border-white/15 whitespace-nowrap"
                        title={`누적 재생 ${album.playCount || 0}회`}
                      >
                        {album.playCount || 0}회
                      </span>
                    </div>

                    {isAdmin && (
                      <div className="flex items-center gap-0.5 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdateAlbum(album.id, { pinned: !album.pinned });
                          }}
                          className={`p-0.5 rounded transition-colors cursor-pointer ${
                            album.pinned ? 'text-[#ff6b2b] bg-white/20' : 'text-white/70 hover:text-[#ff6b2b]'
                          }`}
                          title={album.pinned ? '대표작 해제' : '대표작 지정'}
                        >
                          <Pin className="w-3 h-3 fill-current" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setInfoModalAlbum(album);
                            setInfoModalTab('details');
                            setIsEditingInfo(true);
                            setEditedAlbum({ ...album });
                          }}
                          className="p-0.5 text-white/70 hover:text-white rounded transition-colors cursor-pointer"
                          title="수정하기"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setAlbumToDelete(album);
                          }}
                          className="p-0.5 text-white/70 hover:text-red-400 rounded transition-colors cursor-pointer"
                          title="삭제하기"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      </div>

      {/* ========================================================================= */}
      {/* ITUNES-STYLE "곡 정보" MODAL (EXACT REPLICA OF USER'S SCREENSHOTS!) */}
      {/* ========================================================================= */}
      {infoModalAlbum && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-2 sm:p-4 animate-fadeIn"
          onClick={() => setInfoModalAlbum(null)}
        >
          <div
            className="bg-[#f2f2f7] border border-[#d1d1d6] rounded-xl max-w-xl w-full shadow-2xl flex flex-col overflow-hidden max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Banner with Artwork Thumbnail, Title, Artist, Album */}
            <div className="bg-[#f9f9fb] border-b border-[#d1d1d6] p-4 flex items-center gap-3.5">
              <div className="w-16 h-16 rounded-md overflow-hidden shadow-md border border-[#c6c6c8] shrink-0 bg-black">
                <img
                  src={infoModalAlbum.coverImageUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=300&q=80'}
                  alt={infoModalAlbum.albumTitle}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="text-base font-bold text-[#1c1c1e] truncate">
                  {infoModalAlbum.songTitle}
                </h3>
                <p className="text-xs text-[#3a3a3c] font-medium truncate">
                  {infoModalAlbum.artist}
                </p>
                <p className="text-xs text-[#8e8e93] truncate">
                  {infoModalAlbum.albumTitle}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setInfoModalAlbum(null)}
                className="p-1 rounded-md text-[#8e8e93] hover:text-[#1c1c1e] hover:bg-[#e5e5ea] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Segmented Control Tabs (세부사항, 앨범 표지, 가사, 옵션, 정렬, 파일) */}
            <div className="bg-[#e5e5ea] px-3 pt-2 pb-0 flex items-center justify-center border-b border-[#d1d1d6]">
              <div className="flex items-center rounded-lg bg-[#d1d1d6] p-0.5 text-xs font-medium w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setInfoModalTab('details')}
                  className={`flex-1 sm:flex-initial px-3.5 py-1 rounded-md transition-all cursor-pointer ${
                    infoModalTab === 'details'
                      ? 'bg-white text-[#1c1c1e] font-bold shadow-xs'
                      : 'text-[#636366] hover:text-[#1c1c1e]'
                  }`}
                >
                  세부사항
                </button>
                <button
                  type="button"
                  onClick={() => setInfoModalTab('artwork')}
                  className={`flex-1 sm:flex-initial px-3.5 py-1 rounded-md transition-all cursor-pointer ${
                    infoModalTab === 'artwork'
                      ? 'bg-white text-[#1c1c1e] font-bold shadow-xs'
                      : 'text-[#636366] hover:text-[#1c1c1e]'
                  }`}
                >
                  앨범 표지
                </button>
                <button
                  type="button"
                  onClick={() => setInfoModalTab('lyrics')}
                  className={`flex-1 sm:flex-initial px-3.5 py-1 rounded-md transition-all cursor-pointer ${
                    infoModalTab === 'lyrics'
                      ? 'bg-white text-[#1c1c1e] font-bold shadow-xs'
                      : 'text-[#636366] hover:text-[#1c1c1e]'
                  }`}
                >
                  가사
                </button>
                <button
                  type="button"
                  onClick={() => setInfoModalTab('options')}
                  className={`flex-1 sm:flex-initial px-3.5 py-1 rounded-md transition-all cursor-pointer ${
                    infoModalTab === 'options'
                      ? 'bg-white text-[#1c1c1e] font-bold shadow-xs'
                      : 'text-[#636366] hover:text-[#1c1c1e]'
                  }`}
                >
                  옵션
                </button>
                <button
                  type="button"
                  onClick={() => setInfoModalTab('sorting')}
                  className={`flex-1 sm:flex-initial px-3.5 py-1 rounded-md transition-all cursor-pointer ${
                    infoModalTab === 'sorting'
                      ? 'bg-white text-[#1c1c1e] font-bold shadow-xs'
                      : 'text-[#636366] hover:text-[#1c1c1e]'
                  }`}
                >
                  정렬
                </button>
                <button
                  type="button"
                  onClick={() => setInfoModalTab('file')}
                  className={`flex-1 sm:flex-initial px-3.5 py-1 rounded-md transition-all cursor-pointer ${
                    infoModalTab === 'file'
                      ? 'bg-white text-[#1c1c1e] font-bold shadow-xs'
                      : 'text-[#636366] hover:text-[#1c1c1e]'
                  }`}
                >
                  파일
                </button>
              </div>
            </div>

            {/* Modal Tab Content Area */}
            <div className="p-4 sm:p-5 overflow-y-auto flex-1 text-xs">
              {/* TAB 1: 세부사항 (Details - Screenshot 1 Exact Match) */}
              {infoModalTab === 'details' && (
                <div className="flex flex-col gap-2.5 max-w-lg mx-auto">
                  {/* 노래 */}
                  <div className="flex items-center gap-2">
                    <label className="w-24 text-right text-[#3a3a3c] font-medium shrink-0 flex items-center justify-end gap-1">
                      <span>노래</span>
                      <span className="text-[10px] text-gray-400">↕</span>
                    </label>
                    <input
                      type="text"
                      disabled={!isEditingInfo}
                      value={editedAlbum.songTitle || ''}
                      onChange={(e) => setEditedAlbum({ ...editedAlbum, songTitle: e.target.value })}
                      className="flex-1 p-1.5 bg-white border border-[#c6c6c8] rounded text-[#1c1c1e] disabled:bg-[#f2f2f7] outline-hidden focus:border-[#007aff]"
                    />
                  </div>

                  {/* 아티스트 */}
                  <div className="flex items-center gap-2">
                    <label className="w-24 text-right text-[#3a3a3c] font-medium shrink-0">아티스트</label>
                    <input
                      type="text"
                      disabled={!isEditingInfo}
                      value={editedAlbum.artist || ''}
                      onChange={(e) => setEditedAlbum({ ...editedAlbum, artist: e.target.value })}
                      className="flex-1 p-1.5 bg-white border border-[#c6c6c8] rounded text-[#1c1c1e] disabled:bg-[#f2f2f7] outline-hidden focus:border-[#007aff]"
                    />
                  </div>

                  {/* 앨범 */}
                  <div className="flex items-center gap-2">
                    <label className="w-24 text-right text-[#3a3a3c] font-medium shrink-0">앨범</label>
                    <input
                      type="text"
                      disabled={!isEditingInfo}
                      value={editedAlbum.albumTitle || ''}
                      onChange={(e) => setEditedAlbum({ ...editedAlbum, albumTitle: e.target.value })}
                      className="flex-1 p-1.5 bg-white border border-[#c6c6c8] rounded text-[#1c1c1e] disabled:bg-[#f2f2f7] outline-hidden focus:border-[#007aff]"
                    />
                  </div>

                  {/* 앨범 아티스트 */}
                  <div className="flex items-center gap-2">
                    <label className="w-24 text-right text-[#3a3a3c] font-medium shrink-0">앨범 아티스트</label>
                    <input
                      type="text"
                      disabled={!isEditingInfo}
                      value={editedAlbum.albumArtist || ''}
                      onChange={(e) => setEditedAlbum({ ...editedAlbum, albumArtist: e.target.value })}
                      className="flex-1 p-1.5 bg-white border border-[#c6c6c8] rounded text-[#1c1c1e] disabled:bg-[#f2f2f7] outline-hidden focus:border-[#007aff]"
                    />
                  </div>

                  {/* 작곡가 */}
                  <div className="flex items-center gap-2">
                    <label className="w-24 text-right text-[#3a3a3c] font-medium shrink-0">작곡가</label>
                    <input
                      type="text"
                      disabled={!isEditingInfo}
                      value={editedAlbum.composer || ''}
                      onChange={(e) => setEditedAlbum({ ...editedAlbum, composer: e.target.value })}
                      className="flex-1 p-1.5 bg-white border border-[#c6c6c8] rounded text-[#1c1c1e] disabled:bg-[#f2f2f7] outline-hidden focus:border-[#007aff]"
                    />
                  </div>

                  {/* 모든 보기에서 작곡가 표시 */}
                  <div className="flex items-center gap-2 pl-26">
                    <label className="flex items-center gap-1.5 text-[11px] text-[#3a3a3c] cursor-pointer">
                      <input
                        type="checkbox"
                        disabled={!isEditingInfo}
                        checked={editedAlbum.showComposer ?? true}
                        onChange={(e) => setEditedAlbum({ ...editedAlbum, showComposer: e.target.checked })}
                        className="rounded"
                      />
                      <span>모든 보기에서 작곡가 표시</span>
                    </label>
                  </div>

                  {/* 그룹 짓기 */}
                  <div className="flex items-center gap-2">
                    <label className="w-24 text-right text-[#3a3a3c] font-medium shrink-0">그룹 짓기</label>
                    <input
                      type="text"
                      disabled={!isEditingInfo}
                      value={editedAlbum.grouping || ''}
                      onChange={(e) => setEditedAlbum({ ...editedAlbum, grouping: e.target.value })}
                      className="flex-1 p-1.5 bg-white border border-[#c6c6c8] rounded text-[#1c1c1e] disabled:bg-[#f2f2f7] outline-hidden focus:border-[#007aff]"
                    />
                  </div>

                  {/* 장르 */}
                  <div className="flex items-center gap-2">
                    <label className="w-24 text-right text-[#3a3a3c] font-medium shrink-0">장르</label>
                    <select
                      disabled={!isEditingInfo}
                      value={editedAlbum.genre || 'Religious'}
                      onChange={(e) => setEditedAlbum({ ...editedAlbum, genre: e.target.value })}
                      className="p-1.5 bg-white border border-[#c6c6c8] rounded text-[#1c1c1e] disabled:bg-[#f2f2f7] outline-hidden focus:border-[#007aff] cursor-pointer"
                    >
                      {GENRE_OPTIONS.map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>

                  {/* 연도 */}
                  <div className="flex items-center gap-2">
                    <label className="w-24 text-right text-[#3a3a3c] font-medium shrink-0">연도</label>
                    <input
                      type="text"
                      disabled={!isEditingInfo}
                      value={editedAlbum.releaseYear || ''}
                      onChange={(e) => setEditedAlbum({ ...editedAlbum, releaseYear: e.target.value })}
                      className="w-24 p-1.5 bg-white border border-[#c6c6c8] rounded text-[#1c1c1e] disabled:bg-[#f2f2f7] outline-hidden focus:border-[#007aff]"
                    />
                  </div>

                  {/* 트랙 */}
                  <div className="flex items-center gap-2">
                    <label className="w-24 text-right text-[#3a3a3c] font-medium shrink-0">트랙</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        disabled={!isEditingInfo}
                        value={editedAlbum.trackNumber || 1}
                        onChange={(e) => setEditedAlbum({ ...editedAlbum, trackNumber: parseInt(e.target.value) || 1 })}
                        className="w-14 p-1.5 bg-white border border-[#c6c6c8] rounded text-center text-[#1c1c1e] disabled:bg-[#f2f2f7]"
                      />
                      <span>/</span>
                      <input
                        type="number"
                        disabled={!isEditingInfo}
                        value={editedAlbum.totalTracks || 15}
                        onChange={(e) => setEditedAlbum({ ...editedAlbum, totalTracks: parseInt(e.target.value) || 1 })}
                        className="w-14 p-1.5 bg-white border border-[#c6c6c8] rounded text-center text-[#1c1c1e] disabled:bg-[#f2f2f7]"
                      />
                    </div>
                  </div>

                  {/* 디스크 번호 */}
                  <div className="flex items-center gap-2">
                    <label className="w-24 text-right text-[#3a3a3c] font-medium shrink-0">디스크 번호</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        disabled={!isEditingInfo}
                        value={editedAlbum.discNumber || 1}
                        onChange={(e) => setEditedAlbum({ ...editedAlbum, discNumber: parseInt(e.target.value) || 1 })}
                        className="w-14 p-1.5 bg-white border border-[#c6c6c8] rounded text-center text-[#1c1c1e] disabled:bg-[#f2f2f7]"
                      />
                      <span>/</span>
                      <input
                        type="number"
                        disabled={!isEditingInfo}
                        value={editedAlbum.totalDiscs || 1}
                        onChange={(e) => setEditedAlbum({ ...editedAlbum, totalDiscs: parseInt(e.target.value) || 1 })}
                        className="w-14 p-1.5 bg-white border border-[#c6c6c8] rounded text-center text-[#1c1c1e] disabled:bg-[#f2f2f7]"
                      />
                    </div>
                  </div>

                  {/* 컴필레이션 앨범 여부 */}
                  <div className="flex items-center gap-2">
                    <label className="w-24 text-right text-[#3a3a3c] font-medium shrink-0">컴필레이션 앨범</label>
                    <label className="flex items-center gap-1.5 text-[11px] text-[#3a3a3c] cursor-pointer">
                      <input
                        type="checkbox"
                        disabled={!isEditingInfo}
                        checked={editedAlbum.isCompilation || false}
                        onChange={(e) => setEditedAlbum({ ...editedAlbum, isCompilation: e.target.checked })}
                        className="rounded"
                      />
                      <span>여러 아티스트가 부른 노래로 구성된 컴필레이션 앨범임</span>
                    </label>
                  </div>

                  {/* 선호도 (Rating & Favorite) */}
                  <div className="flex items-center gap-2">
                    <label className="w-24 text-right text-[#3a3a3c] font-medium shrink-0">선호도</label>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center text-[#eab308] cursor-pointer">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            disabled={!isEditingInfo}
                            onClick={() => setEditedAlbum({ ...editedAlbum, rating: star })}
                            className="p-0.5 cursor-pointer disabled:cursor-default"
                          >
                            <Star
                              className={`w-4 h-4 ${
                                star <= (editedAlbum.rating || 0) ? 'fill-current text-[#eab308]' : 'text-gray-300'
                              }`}
                            />
                          </button>
                        ))}
                      </div>

                      <button
                        type="button"
                        disabled={!isEditingInfo}
                        onClick={() => setEditedAlbum({ ...editedAlbum, isFavorite: !editedAlbum.isFavorite })}
                        className="p-1 cursor-pointer disabled:cursor-default text-red-500"
                      >
                        <Heart className={`w-4 h-4 ${editedAlbum.isFavorite ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* bpm */}
                  <div className="flex items-center gap-2">
                    <label className="w-24 text-right text-[#3a3a3c] font-medium shrink-0">bpm</label>
                    <input
                      type="number"
                      disabled={!isEditingInfo}
                      value={editedAlbum.bpm ?? ''}
                      onChange={(e) => setEditedAlbum({ ...editedAlbum, bpm: parseInt(e.target.value) || undefined })}
                      className="w-24 p-1.5 bg-white border border-[#c6c6c8] rounded text-[#1c1c1e] disabled:bg-[#f2f2f7]"
                    />
                  </div>

                  {/* 재생 횟수 */}
                  <div className="flex items-center gap-2">
                    <label className="w-24 text-right text-[#3a3a3c] font-medium shrink-0">재생 횟수</label>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-semibold">{editedAlbum.playCount || 0}</span>
                      {isEditingInfo && (
                        <button
                          type="button"
                          onClick={() => setEditedAlbum({ ...editedAlbum, playCount: 0 })}
                          className="px-2 py-0.5 bg-[#e5e5ea] border border-[#c6c6c8] text-[#3a3a3c] rounded text-[10px] cursor-pointer"
                        >
                          재설정...
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 주석 */}
                  <div className="flex items-center gap-2">
                    <label className="w-24 text-right text-[#3a3a3c] font-medium shrink-0">주석</label>
                    <input
                      type="text"
                      disabled={!isEditingInfo}
                      value={editedAlbum.comments || ''}
                      onChange={(e) => setEditedAlbum({ ...editedAlbum, comments: e.target.value })}
                      placeholder="감상 메모 또는 소장 위치..."
                      className="flex-1 p-1.5 bg-white border border-[#c6c6c8] rounded text-[#1c1c1e] disabled:bg-[#f2f2f7] outline-hidden focus:border-[#007aff]"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: 앨범 표지 (Artwork - Screenshot 2 Exact Match) */}
              {infoModalTab === 'artwork' && (
                <div className="flex flex-col items-center justify-center gap-4 py-2">
                  <div className="text-left w-full font-bold text-sm text-[#1c1c1e] mb-1">
                    앨범 표지
                  </div>

                  <div className="relative max-w-sm w-full aspect-square rounded-lg shadow-xl border-2 border-[#c6c6c8] overflow-hidden bg-black">
                    <img
                      src={editedAlbum.coverImageUrl || infoModalAlbum.coverImageUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80'}
                      alt={infoModalAlbum.albumTitle}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {isEditingInfo && (
                    <div className="flex flex-col items-center gap-2 w-full max-w-sm">
                      <input
                        type="text"
                        value={editedAlbum.coverImageUrl || ''}
                        onChange={(e) => setEditedAlbum({ ...editedAlbum, coverImageUrl: e.target.value })}
                        placeholder="표지 이미지 URL (https://...)"
                        className="w-full p-2 bg-white border border-[#c6c6c8] rounded text-xs"
                      />
                      <p className="text-[11px] text-[#8e8e93]">
                        고해상도 앨범 커버 이미지 링크를 입력하시거나 새 등록 창에서 PC 파일을 업로드할 수 있습니다.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: 가사 (Lyrics) */}
              {infoModalTab === 'lyrics' && (
                <div className="flex flex-col gap-3 max-w-xl mx-auto py-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#d1d1d6]">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-[#1c1c1e]">노래 가사</span>
                        <span className="text-[10px] bg-[#e5e5ea] text-[#3a3a3c] px-1.5 py-0.2 rounded font-medium">
                          {isEditingInfo ? '편집 모드' : '감상 모드'}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#8e8e93]">
                        {isEditingInfo
                          ? '한글 번역 가사 및 원문 가사를 직접 수정하거나 자동 생성할 수 있습니다.'
                          : '한국어 번역 가사와 원문 가사를 편안하게 감상하실 수 있습니다.'}
                      </p>
                    </div>

                    {!isEditingInfo && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Tab mode */}
                        <div className="flex items-center rounded-md bg-[#e5e5ea] p-0.5 text-xs font-medium border border-[#c6c6c8]">
                          <button
                            type="button"
                            onClick={() => setInfoModalLyricsMode('korean')}
                            className={`px-2.5 py-0.5 rounded transition-all cursor-pointer ${
                              infoModalLyricsMode === 'korean'
                                ? 'bg-white text-[#ff6b2b] font-bold shadow-xs'
                                : 'text-[#636366] hover:text-[#1c1c1e]'
                            }`}
                          >
                            🇰🇷 한글 가사
                          </button>
                          <button
                            type="button"
                            onClick={() => setInfoModalLyricsMode('original')}
                            className={`px-2.5 py-0.5 rounded transition-all cursor-pointer ${
                              infoModalLyricsMode === 'original'
                                ? 'bg-white text-[#1c1c1e] font-bold shadow-xs'
                                : 'text-[#636366] hover:text-[#1c1c1e]'
                            }`}
                          >
                            🌐 원문
                          </button>
                          <button
                            type="button"
                            onClick={() => setInfoModalLyricsMode('bilingual')}
                            className={`px-2.5 py-0.5 rounded transition-all cursor-pointer ${
                              infoModalLyricsMode === 'bilingual'
                                ? 'bg-white text-[#7c3aed] font-bold shadow-xs'
                                : 'text-[#636366] hover:text-[#1c1c1e]'
                            }`}
                          >
                            📖 함께 보기
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            const txt =
                              infoModalLyricsMode === 'korean'
                                ? editedAlbum.koreanLyrics || editedAlbum.lyrics || ''
                                : infoModalLyricsMode === 'original'
                                ? editedAlbum.lyrics || editedAlbum.koreanLyrics || ''
                                : `[원문]\n${editedAlbum.lyrics || ''}\n\n[한글 번역]\n${editedAlbum.koreanLyrics || ''}`;
                            handleCopyLyrics(txt);
                          }}
                          className="px-2 py-1 bg-white border border-[#c6c6c8] hover:bg-[#f2f2f7] rounded text-xs text-[#3a3a3c] flex items-center gap-1 cursor-pointer transition-colors"
                          title="가사 텍스트 복사"
                        >
                          {lyricsCopied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                          <span className="text-[11px]">{lyricsCopied ? '복사됨' : '복사'}</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Mode 1: Edit Mode */}
                  {isEditingInfo ? (
                    <div className="flex flex-col gap-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-bold text-[#ff6b2b] flex items-center gap-1">
                            <span>🇰🇷 한글 번역 / 한국어 가사</span>
                            <span className="text-[10px] text-gray-500 font-normal">(플레이어와 카드에서 우선 표시)</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              const found = getKoreanLyricsForSong(editedAlbum.songTitle || '', editedAlbum.artist, editedAlbum.lyrics);
                              if (found) {
                                setEditedAlbum({ ...editedAlbum, koreanLyrics: found });
                              } else {
                                alert('해당 곡에 대한 사전 등록 한글 가사가 없습니다.');
                              }
                            }}
                            className="px-2 py-0.5 bg-[#fff5ee] hover:bg-[#ffe8dc] text-[#ff6b2b] border border-[#ffd8c2] rounded text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>한글 가사 자동 찾기</span>
                          </button>
                        </div>
                        <textarea
                          rows={6}
                          value={editedAlbum.koreanLyrics || ''}
                          onChange={(e) => setEditedAlbum({ ...editedAlbum, koreanLyrics: e.target.value })}
                          placeholder="한글 번역 가사나 한국어 가사를 입력해주세요..."
                          className="w-full p-2.5 bg-white border border-[#c6c6c8] rounded-lg text-xs leading-relaxed text-[#1c1c1e] outline-hidden focus:border-[#ff6b2b]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#1c1c1e] mb-1">
                          🌐 원문 가사 (Original Lyrics)
                        </label>
                        <textarea
                          rows={6}
                          value={editedAlbum.lyrics || ''}
                          onChange={(e) => setEditedAlbum({ ...editedAlbum, lyrics: e.target.value })}
                          placeholder="원문 가사를 입력해주세요..."
                          className="w-full p-2.5 bg-white border border-[#c6c6c8] rounded-lg text-xs leading-relaxed text-[#1c1c1e] outline-hidden focus:border-[#007aff]"
                        />
                      </div>
                    </div>
                  ) : (
                    /* Mode 2: Beautiful Reading Mode */
                    <div className="bg-white border border-[#c6c6c8] rounded-xl p-4 max-h-[420px] overflow-y-auto shadow-inner">
                      {infoModalLyricsMode === 'korean' && (
                        <div>
                          {editedAlbum.koreanLyrics ? (
                            <div className="whitespace-pre-wrap text-sm leading-relaxed text-[#1c1c1e] font-sans">
                              {editedAlbum.koreanLyrics}
                            </div>
                          ) : (
                            <div className="text-center py-8">
                              <p className="text-xs text-[#8e8e93] mb-3">등록된 한글 번역 가사가 없습니다.</p>
                              <button
                                type="button"
                                onClick={() => {
                                  const found = getKoreanLyricsForSong(editedAlbum.songTitle || '', editedAlbum.artist, editedAlbum.lyrics);
                                  if (found) {
                                    setEditedAlbum({ ...editedAlbum, koreanLyrics: found });
                                    if (infoModalAlbum) {
                                      onUpdateAlbum(infoModalAlbum.id, { koreanLyrics: found });
                                    }
                                  } else {
                                    alert('사전에 등록된 한글 가사를 찾지 못했습니다. 직접 입력해주세요.');
                                  }
                                }}
                                className="px-3 py-1.5 bg-[#ff6b2b] text-white rounded text-xs font-bold hover:bg-[#ea580c] cursor-pointer"
                              >
                                ✨ 한글 가사 자동 불러오기
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {infoModalLyricsMode === 'original' && (
                        <div>
                          {editedAlbum.lyrics ? (
                            <div className="whitespace-pre-wrap text-xs leading-relaxed text-[#2c2c2e] font-mono">
                              {editedAlbum.lyrics}
                            </div>
                          ) : (
                            <p className="text-xs text-[#8e8e93] text-center py-8">등록된 원문 가사가 없습니다.</p>
                          )}
                        </div>
                      )}

                      {infoModalLyricsMode === 'bilingual' && (
                        <div>
                          {renderBilingualModalLyrics(
                            editedAlbum.lyrics || '',
                            editedAlbum.koreanLyrics || getKoreanLyricsForSong(editedAlbum.songTitle || '', editedAlbum.artist, editedAlbum.lyrics) || ''
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: 옵션 (Options) */}
              {infoModalTab === 'options' && (
                <div className="flex flex-col gap-4 max-w-md mx-auto py-2">
                  <div className="flex items-center justify-between pb-2 border-b border-[#d1d1d6]">
                    <span className="font-medium text-[#3a3a3c]">이퀄라이저 프리셋</span>
                    <select className="p-1 bg-white border border-[#c6c6c8] rounded text-xs">
                      <option>어쿠스틱 (Acoustic)</option>
                      <option>보컬 강조 (Vocal Booster)</option>
                      <option>클래식 (Classical)</option>
                      <option>재즈 (Jazz)</option>
                      <option>플랫 (Flat)</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5 pb-2 border-b border-[#d1d1d6]">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-[#3a3a3c]">음량 조절</span>
                      <span className="text-[11px] text-[#8e8e93]">0%</span>
                    </div>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      defaultValue="0"
                      className="w-full accent-[#007aff]"
                    />
                    <div className="flex justify-between text-[10px] text-[#8e8e93]">
                      <span>-100%</span>
                      <span>없음</span>
                      <span>+100%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-medium text-[#3a3a3c]">음원 재생 시작 시간</span>
                    <input type="text" defaultValue="0:00" className="w-16 p-1 border rounded text-center" />
                  </div>
                </div>
              )}

              {/* TAB 5: 정렬 (Sorting) */}
              {infoModalTab === 'sorting' && (
                <div className="flex flex-col gap-3 max-w-md mx-auto py-2">
                  <div className="flex items-center gap-2">
                    <label className="w-24 text-right text-[#3a3a3c] font-medium shrink-0">정렬 노래</label>
                    <input
                      type="text"
                      disabled={!isEditingInfo}
                      value={editedAlbum.sortSongTitle || editedAlbum.songTitle || ''}
                      onChange={(e) => setEditedAlbum({ ...editedAlbum, sortSongTitle: e.target.value })}
                      className="flex-1 p-1.5 bg-white border border-[#c6c6c8] rounded text-[#1c1c1e] disabled:bg-[#f2f2f7]"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="w-24 text-right text-[#3a3a3c] font-medium shrink-0">정렬 아티스트</label>
                    <input
                      type="text"
                      disabled={!isEditingInfo}
                      value={editedAlbum.sortArtist || editedAlbum.artist || ''}
                      onChange={(e) => setEditedAlbum({ ...editedAlbum, sortArtist: e.target.value })}
                      className="flex-1 p-1.5 bg-white border border-[#c6c6c8] rounded text-[#1c1c1e] disabled:bg-[#f2f2f7]"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="w-24 text-right text-[#3a3a3c] font-medium shrink-0">정렬 앨범</label>
                    <input
                      type="text"
                      disabled={!isEditingInfo}
                      value={editedAlbum.sortAlbum || editedAlbum.albumTitle || ''}
                      onChange={(e) => setEditedAlbum({ ...editedAlbum, sortAlbum: e.target.value })}
                      className="flex-1 p-1.5 bg-white border border-[#c6c6c8] rounded text-[#1c1c1e] disabled:bg-[#f2f2f7]"
                    />
                  </div>
                </div>
              )}

              {/* TAB 6: 파일 / 자세히 속성 (Windows MP3 속성 자세히 창 100% 매칭) */}
              {infoModalTab === 'file' && (
                <div className="flex flex-col gap-3 max-w-lg mx-auto py-1">
                  <div className="flex items-center justify-between text-[11px] text-[#636366] px-1">
                    <span className="font-bold text-[#1c1c1e] flex items-center gap-1.5">
                      <FileAudio className="w-3.5 h-3.5 text-[#007aff]" />
                      <span>{infoModalAlbum.audioFileName || `${infoModalAlbum.songTitle}.mp3`} 속성 (자세히)</span>
                    </span>
                    <span className="bg-[#e5e5ea] px-2 py-0.5 rounded text-[10px] font-mono text-[#3a3a3c]">
                      {infoModalAlbum.audioFormat || 'MPEG 오디오 (MP3)'}
                    </span>
                  </div>

                  <div className="bg-white border border-[#c6c6c8] rounded-lg overflow-hidden shadow-xs">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead className="bg-[#f2f2f7] border-b border-[#c6c6c8] text-[#636366] font-bold text-[11px]">
                        <tr>
                          <th className="py-1.5 px-3 w-36 border-r border-[#e5e5ea]">속성</th>
                          <th className="py-1.5 px-3">값</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#f2f2f7]">
                        {/* 설명 섹션 */}
                        <tr className="bg-[#f9f9fb]">
                          <td colSpan={2} className="py-1 px-3 font-bold text-[#007aff] text-[11px] border-l-2 border-[#007aff]">
                            설명
                          </td>
                        </tr>
                        <tr>
                          <td className="py-1.5 px-3 text-[#3a3a3c] font-medium border-r border-[#f2f2f7]">제목</td>
                          <td className="py-1.5 px-3 font-semibold text-[#1c1c1e]">{infoModalAlbum.songTitle}</td>
                        </tr>
                        <tr>
                          <td className="py-1.5 px-3 text-[#3a3a3c] font-medium border-r border-[#f2f2f7]">자막</td>
                          <td className="py-1.5 px-3 text-[#8e8e93]">-</td>
                        </tr>
                        <tr>
                          <td className="py-1.5 px-3 text-[#3a3a3c] font-medium border-r border-[#f2f2f7]">등급</td>
                          <td className="py-1.5 px-3 text-[#eab308]">
                            {'★'.repeat(infoModalAlbum.rating || 5)}{'☆'.repeat(5 - (infoModalAlbum.rating || 5))}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-1.5 px-3 text-[#3a3a3c] font-medium border-r border-[#f2f2f7]">설명 / 주석</td>
                          <td className="py-1.5 px-3 text-[#3a3a3c]">{infoModalAlbum.comments || '-'}</td>
                        </tr>

                        {/* 미디어 섹션 */}
                        <tr className="bg-[#f9f9fb]">
                          <td colSpan={2} className="py-1 px-3 font-bold text-[#007aff] text-[11px] border-l-2 border-[#007aff]">
                            미디어
                          </td>
                        </tr>
                        <tr>
                          <td className="py-1.5 px-3 text-[#3a3a3c] font-medium border-r border-[#f2f2f7]">참여 음악가</td>
                          <td className="py-1.5 px-3 font-semibold text-[#1c1c1e]">{infoModalAlbum.artist}</td>
                        </tr>
                        <tr>
                          <td className="py-1.5 px-3 text-[#3a3a3c] font-medium border-r border-[#f2f2f7]">앨범 음악가</td>
                          <td className="py-1.5 px-3 text-[#1c1c1e]">{infoModalAlbum.albumArtist || infoModalAlbum.artist}</td>
                        </tr>
                        <tr>
                          <td className="py-1.5 px-3 text-[#3a3a3c] font-medium border-r border-[#f2f2f7]">앨범</td>
                          <td className="py-1.5 px-3 text-[#1c1c1e]">{infoModalAlbum.albumTitle}</td>
                        </tr>
                        <tr>
                          <td className="py-1.5 px-3 text-[#3a3a3c] font-medium border-r border-[#f2f2f7]">연도</td>
                          <td className="py-1.5 px-3 text-[#1c1c1e]">{infoModalAlbum.releaseYear}</td>
                        </tr>
                        <tr>
                          <td className="py-1.5 px-3 text-[#3a3a3c] font-medium border-r border-[#f2f2f7]">#</td>
                          <td className="py-1.5 px-3 font-mono font-bold text-[#1c1c1e]">{infoModalAlbum.trackNumber || 1}</td>
                        </tr>
                        <tr>
                          <td className="py-1.5 px-3 text-[#3a3a3c] font-medium border-r border-[#f2f2f7]">장르</td>
                          <td className="py-1.5 px-3 text-[#1c1c1e]">{infoModalAlbum.genre}</td>
                        </tr>
                        <tr>
                          <td className="py-1.5 px-3 text-[#3a3a3c] font-medium border-r border-[#f2f2f7]">길이</td>
                          <td className="py-1.5 px-3 font-mono font-bold text-[#1c1c1e]">
                            {infoModalAlbum.formattedDuration || formatSeconds(infoModalAlbum.audioDuration || 177)}
                          </td>
                        </tr>

                        {/* 오디오 섹션 */}
                        <tr className="bg-[#f9f9fb]">
                          <td colSpan={2} className="py-1 px-3 font-bold text-[#007aff] text-[11px] border-l-2 border-[#007aff]">
                            오디오
                          </td>
                        </tr>
                        <tr>
                          <td className="py-1.5 px-3 text-[#3a3a3c] font-medium border-r border-[#f2f2f7]">비트 전송률</td>
                          <td className="py-1.5 px-3 font-mono text-[#1c1c1e]">{infoModalAlbum.bitrate || '192kbps'}</td>
                        </tr>
                        <tr>
                          <td className="py-1.5 px-3 text-[#3a3a3c] font-medium border-r border-[#f2f2f7]">채널</td>
                          <td className="py-1.5 px-3 text-[#1c1c1e]">{infoModalAlbum.channels || '2(스테레오)'}</td>
                        </tr>
                        <tr>
                          <td className="py-1.5 px-3 text-[#3a3a3c] font-medium border-r border-[#f2f2f7]">오디오 샘플 속도</td>
                          <td className="py-1.5 px-3 font-mono text-[#1c1c1e]">{infoModalAlbum.sampleRate || '44.100kHz'}</td>
                        </tr>

                        {/* 원본 섹션 */}
                        <tr className="bg-[#f9f9fb]">
                          <td colSpan={2} className="py-1 px-3 font-bold text-[#007aff] text-[11px] border-l-2 border-[#007aff]">
                            원본
                          </td>
                        </tr>
                        <tr>
                          <td className="py-1.5 px-3 text-[#3a3a3c] font-medium border-r border-[#f2f2f7]">인코딩한 사람</td>
                          <td className="py-1.5 px-3 text-[#1c1c1e]">{infoModalAlbum.encodedBy || 'iTunes 10.6.3.25'}</td>
                        </tr>
                        <tr>
                          <td className="py-1.5 px-3 text-[#3a3a3c] font-medium border-r border-[#f2f2f7]">크기</td>
                          <td className="py-1.5 px-3 font-mono text-[#1c1c1e]">{infoModalAlbum.audioFileSize || '4.2 MB'}</td>
                        </tr>
                        <tr>
                          <td className="py-1.5 px-3 text-[#3a3a3c] font-medium border-r border-[#f2f2f7]">파일명</td>
                          <td className="py-1.5 px-3 font-mono text-[10px] text-purple-700">{infoModalAlbum.audioFileName || `${infoModalAlbum.songTitle}.mp3`}</td>
                        </tr>

                        {/* 외부 재생 URL (Cloudflare R2) */}
                        <tr className="bg-[#f0f9ff]">
                          <td colSpan={2} className="py-1 px-3 font-bold text-[#0284c7] text-[11px] border-l-2 border-[#0284c7]">
                            재생 음원 스트리밍 (Cloudflare R2 / 외부 URL)
                          </td>
                        </tr>
                        <tr>
                          <td className="py-1.5 px-3 text-[#3a3a3c] font-medium border-r border-[#f2f2f7]">외부 재생 URL</td>
                          <td className="py-1.5 px-3 font-mono text-[11px]">
                            {isEditingInfo ? (
                              <input
                                type="url"
                                value={editedAlbum.audioUrl || ''}
                                onChange={(e) => setEditedAlbum({ ...editedAlbum, audioUrl: e.target.value })}
                                placeholder="예: https://pub-xxxxxx.r2.dev/music/example.mp3"
                                className="w-full p-1.5 bg-white border border-[#7dd3fc] rounded text-xs font-mono text-[#0f172a]"
                              />
                            ) : (
                              (editedAlbum.audioUrl || infoModalAlbum.audioUrl) ? (
                                <span className="text-[#0284c7] break-all select-all font-mono">
                                  {editedAlbum.audioUrl || infoModalAlbum.audioUrl}
                                </span>
                              ) : (
                                <span className="text-[#94a3b8] italic">미설정 (로컬 캐시/신스 재생)</span>
                              )
                            )}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Bottom Footer Actions */}
            <div className="bg-[#f9f9fb] px-4 py-2.5 border-t border-[#d1d1d6] flex items-center justify-between">
              <button
                type="button"
                onClick={() => handlePlayAlbum(infoModalAlbum)}
                className="px-3 py-1.5 bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded text-xs font-bold flex items-center gap-1 cursor-pointer shadow-xs"
              >
                {playingAlbumId === infoModalAlbum.id && isPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5 fill-current" />
                    <span>음원 일시정지</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>대표곡 재생</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-2">
                {isEditingInfo ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsEditingInfo(false)}
                      className="px-3 py-1.5 bg-[#e5e5ea] hover:bg-[#d1d1d6] text-[#3a3a3c] rounded text-xs font-medium cursor-pointer"
                    >
                      취소
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveEditedInfo}
                      className="px-4 py-1.5 bg-[#007aff] hover:bg-[#0062cc] text-white rounded text-xs font-bold cursor-pointer shadow-xs"
                    >
                      완료 (저장)
                    </button>
                  </>
                ) : (
                  <>
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => setIsEditingInfo(true)}
                        className="px-3 py-1.5 bg-[#e5e5ea] hover:bg-[#d1d1d6] text-[#3a3a3c] rounded text-xs font-medium cursor-pointer flex items-center gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>수정</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setInfoModalAlbum(null)}
                      className="px-4 py-1.5 bg-[#007aff] hover:bg-[#0062cc] text-white rounded text-xs font-bold cursor-pointer"
                    >
                      확인
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD NEW CD ALBUM & TRACK */}
      {/* ========================================================================= */}
      {isAddModalVisible && isAdmin && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-3 animate-fadeIn"
          onClick={handleCloseAddModal}
        >
          <div
            className="bg-white border border-[#cbd5e1] rounded-2xl max-w-xl w-full p-5 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#e2e8f0] mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#7c3aed] text-white flex items-center justify-center shadow-xs">
                  <Disc3 className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0f172a]">
                    새 소장 CD 음반 및 대표곡 등록
                  </h3>
                  <p className="text-[11px] text-[#64748b]">
                    내 PC의 CD 음반 표지와 대표곡(MP3/M4A)을 라이브러리에 보관합니다.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCloseAddModal}
                className="text-[#94a3b8] hover:text-[#0f172a] p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tab Switcher: 50~100곡 일괄 드래그 등록 vs 단일 곡 직접 등록 */}
            <div className="flex border-b border-[#e2e8f0] mb-4 gap-2">
              <button
                type="button"
                onClick={() => setAddModalTab('batch')}
                className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
                  addModalTab === 'batch'
                    ? 'border-[#ff6b2b] text-[#ea580c]'
                    : 'border-transparent text-[#64748b] hover:text-[#0f172a]'
                }`}
              >
                <UploadCloud className="w-4 h-4" />
                <span>⚡ 다중 음원 드래그 일괄 등록 (50~100곡)</span>
                <span className="text-[10px] bg-orange-100 text-orange-800 px-1.5 py-0.2 rounded-full font-extrabold">
                  아이튠즈 방식
                </span>
              </button>

              <button
                type="button"
                onClick={() => setAddModalTab('single')}
                className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
                  addModalTab === 'single'
                    ? 'border-[#7c3aed] text-[#7c3aed]'
                    : 'border-transparent text-[#64748b] hover:text-[#0f172a]'
                }`}
              >
                <FileAudio className="w-4 h-4" />
                <span>📝 단일 곡 상세 직접 등록</span>
              </button>
            </div>

            {addModalTab === 'batch' ? (
              <div className="flex flex-col gap-4 text-xs">
                {/* Big Drag & Drop Zone inside modal */}
                <div
                  onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  onDrop={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const files = await extractFilesFromDataTransfer(e.dataTransfer);
                    if (files.length > 0) {
                      processBatchFiles(files);
                    }
                  }}
                  className="border-3 border-dashed border-[#ff6b2b] bg-linear-to-b from-orange-50/70 to-purple-50/50 rounded-2xl p-7 flex flex-col items-center justify-center text-center gap-3 transition-colors hover:border-[#ea580c] hover:bg-orange-50/90"
                >
                  <div className="w-16 h-16 rounded-2xl bg-linear-to-tr from-[#ff6b2b] to-[#7c3aed] flex items-center justify-center text-white shadow-lg animate-pulse">
                    <UploadCloud className="w-8 h-8" />
                  </div>

                  <div>
                    <h4 className="text-base font-black text-[#0f172a] mb-1">
                      이곳에 음원 파일(MP3, M4A 등 50~100곡)을 드래그하여 놓으세요!
                    </h4>
                    <p className="text-xs text-[#64748b] max-w-md leading-relaxed">
                      윈도우 탐색기에서 등록할 음원 파일들을 마우스로 다중 선택하여 이 창에 끌어다 놓으시면,<br />
                      화일 내 ID3 태그(곡명, 가수, 앨범, 트랙, 장르, 연도, 가사, 앨범커버)를 자동 추출하여 앨범 목록을 즉시 완성합니다.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 mt-2 flex-wrap justify-center">
                    <button
                      type="button"
                      onClick={() => multiFileInputRef.current?.click()}
                      className="px-4 py-2.5 bg-[#ff6b2b] hover:bg-[#ea580c] text-white rounded-xl font-bold text-xs shadow-md flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
                    >
                      <UploadCloud className="w-4 h-4" />
                      <span>PC에서 음원 파일 다중 선택하기 (50~100곡)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => folderInputRef.current?.click()}
                      className="px-4 py-2.5 bg-white hover:bg-gray-50 text-[#334155] border border-[#cbd5e1] rounded-xl font-bold text-xs shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <FolderPlus className="w-4 h-4 text-[#0284c7]" />
                      <span>상위 폴더 통째로 선택하기</span>
                    </button>
                  </div>
                </div>

                {/* Information Card */}
                <div className="p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl flex flex-col gap-2">
                  <div className="font-bold text-[#334155] flex items-center gap-1.5 text-xs">
                    <Sparkles className="w-4 h-4 text-[#7c3aed]" />
                    <span>일괄 등록 및 Cloudflare R2 링크 안내</span>
                  </div>
                  <ul className="text-[11px] text-[#64748b] list-disc list-inside space-y-1.5 leading-relaxed">
                    <li>
                      <strong>지원 형식:</strong> MP3, M4A, FLAC, WAV, AAC, OGG 등 모든 주요 오디오 파일 지원
                    </li>
                    <li>
                      <strong>자동 추출 항목:</strong> 제목, 아티스트, 앨범, 앨범 아티스트, 트랙 번호, 장르, 연도, 비트 전송률(192kbps 등), 샘플 속도(44.1kHz), 재생 시간, USLT 가사, 임베디드 앨범 커버 아트
                    </li>
                    <li>
                      <strong>Cloudflare R2 스트리밍 링크:</strong> 일괄 등록 시 링크는 비워둔 상태로 앨범이 완성되며, 등록 후 각 앨범의 <strong>[R2등록]</strong> 버튼이나 상단 배너의 <strong>[순차적으로 링크 등록하기]</strong>를 통해 편리하게 개별 수작업 등록하실 수 있습니다.
                    </li>
                  </ul>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitNewAlbum} className="flex flex-col gap-4 text-xs">
              {/* Quick Preset for User's Screenshot ("08 Danny Boy.mp3") */}
              <div className="flex items-center justify-between bg-[#f5f3ff] border border-[#ddd6fe] rounded-lg p-2.5">
                <div className="flex items-center gap-1.5 text-[#5b21b6]">
                  <Sparkles className="w-4 h-4 text-[#7c3aed] shrink-0" />
                  <div>
                    <span className="font-bold text-[11px]">스크린샷 예시 속성값 불러오기: </span>
                    <span className="text-[11px] text-[#6d28d9]">08 Danny Boy.mp3 (Andy Williams)</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleLoadDannyBoyPreset}
                  className="px-2.5 py-1 bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded text-[11px] font-bold shadow-2xs transition-colors cursor-pointer shrink-0"
                >
                  속성값 채우기
                </button>
              </div>

              {/* Audio File Upload Picker */}
              <div className="p-3 bg-[#f8fafc] border border-dashed border-[#cbd5e1] rounded-xl flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#334155] flex items-center gap-1.5">
                    <FileAudio className="w-4 h-4 text-[#7c3aed]" />
                    <span>대표곡 오디오 첨부화일 선택 (MP3, M4A, WAV, FLAC 등)</span>
                  </span>
                  {newAudioFile && (
                    <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-0.5">
                      <Check className="w-3.5 h-3.5" />
                      선택 완료
                    </span>
                  )}
                </div>

                <input
                  type="file"
                  accept="audio/*,.mp3,.m4a,.wav,.aac,.flac"
                  onChange={handleAudioFileChange}
                  className="w-full text-xs text-[#475569] file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#7c3aed] file:text-white hover:file:bg-[#6d28d9] cursor-pointer"
                />

                {/* 실제 재생용 외부 URL 주소 (Cloudflare R2) - 파일 선택 버튼 바로 아래에 배치 */}
                <div className="pt-2 border-t border-[#e2e8f0] flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-xs text-[#0f172a] flex items-center gap-1.5">
                      <Radio className="w-3.5 h-3.5 text-[#0284c7]" />
                      <span>실제 재생용 외부 URL 주소 (Cloudflare R2 / 서버 음원 링크)</span>
                    </label>
                    <span className="text-[10px] bg-[#e0f2fe] text-[#0369a1] px-1.5 py-0.5 rounded font-medium">
                      방문자 재생용 (다운로드 불가 스트리밍)
                    </span>
                  </div>
                  <input
                    type="url"
                    value={newAudioUrl}
                    onChange={(e) => setNewAudioUrl(e.target.value)}
                    placeholder="예: https://pub-xxxxxx.r2.dev/music/08_Danny_Boy.mp3 (Cloudflare R2 링크)"
                    className="w-full p-2 bg-white border border-[#cbd5e1] rounded-lg text-xs font-mono text-[#0f172a] outline-hidden focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed] shadow-2xs"
                  />
                  <p className="text-[10px] text-[#64748b] leading-relaxed">
                    💡 <strong>위 첨부파일</strong>은 제목·가수·표지 등 ID3 메타데이터 자동 추출용으로 사용되며, <strong>방문자가 재생(Play) 버튼을 누르면 이 외부 URL(R2 링크)이 오디오 태그의 src로 작동</strong>하여 다운로드 없이 바로 재생됩니다.
                  </p>
                </div>

                {isExtractingMeta && (
                  <div className="flex items-center gap-2 p-2 bg-[#f0f9ff] border border-[#bae6fd] rounded-lg text-xs text-[#0284c7]">
                    <div className="w-3.5 h-3.5 border-2 border-[#0284c7] border-t-transparent rounded-full animate-spin shrink-0" />
                    <span>첨부화일에서 제목, 아티스트, 앨범, 트랙, 비트 전송률, 샘플 속도 등 속성값을 자동 추출하고 있습니다...</span>
                  </div>
                )}

                {extractionNotice && !isExtractingMeta && (
                  <div className="p-2.5 bg-[#f0fdf4] border border-[#bbf7d0] rounded-lg text-xs text-[#15803d] flex flex-col gap-1 animate-fadeIn">
                    <div className="font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>첨부화일 속성 자동 추출 완료</span>
                    </div>
                    <p className="text-[11px] text-[#166534] leading-relaxed">
                      {extractionNotice}
                    </p>
                  </div>
                )}
              </div>

              {/* Cover Artwork File or Image Preview */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                <div className="aspect-square rounded-lg bg-[#f1f5f9] border border-[#cbd5e1] flex items-center justify-center overflow-hidden">
                  {newCoverPreview ? (
                    <img src={newCoverPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-[#94a3b8] gap-1 p-2 text-center">
                      <ImageIcon className="w-6 h-6" />
                      <span className="text-[10px]">앨범 표지 미리보기</span>
                    </div>
                  )}
                </div>

                <div className="sm:col-span-2 flex flex-col gap-1.5">
                  <label className="font-bold text-[#334155]">앨범 표지 이미지 (첨부화일 태그에서 자동 추출 또는 직접 선택)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverFileChange}
                    className="w-full text-xs text-[#475569] file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-xs file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer"
                  />
                  <p className="text-[10px] text-[#94a3b8]">
                    MP3에 앨범 아트가 내장되어 있으면 자동으로 추출되며, PC의 다른 커버 사진으로 교체하실 수도 있습니다.
                  </p>
                </div>
              </div>

              {/* Extracted Audio Technical Specifications Grid (Windows 속성 매칭) */}
              <div className="p-3 bg-[#fafafc] border border-[#e2e8f0] rounded-xl flex flex-col gap-2">
                <span className="font-bold text-[#1e293b] flex items-center gap-1 text-[11px]">
                  <Sliders className="w-3.5 h-3.5 text-[#007aff]" />
                  <span>첨부화일 오디오 기술 속성 (자동 인식)</span>
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <label className="text-[10px] text-[#64748b] font-medium block">비트 전송률</label>
                    <input
                      type="text"
                      value={newBitrate}
                      onChange={(e) => setNewBitrate(e.target.value)}
                      placeholder="192kbps"
                      className="w-full p-1.5 bg-white border border-[#cbd5e1] rounded font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#64748b] font-medium block">채널</label>
                    <input
                      type="text"
                      value={newChannels}
                      onChange={(e) => setNewChannels(e.target.value)}
                      placeholder="2(스테레오)"
                      className="w-full p-1.5 bg-white border border-[#cbd5e1] rounded text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#64748b] font-medium block">오디오 샘플 속도</label>
                    <input
                      type="text"
                      value={newSampleRate}
                      onChange={(e) => setNewSampleRate(e.target.value)}
                      placeholder="44.100kHz"
                      className="w-full p-1.5 bg-white border border-[#cbd5e1] rounded font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#64748b] font-medium block">재생 길이</label>
                    <input
                      type="text"
                      value={newFormattedDuration}
                      onChange={(e) => setNewFormattedDuration(e.target.value)}
                      placeholder="00:02:57"
                      className="w-full p-1.5 bg-white border border-[#cbd5e1] rounded font-mono text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                  <div>
                    <label className="text-[10px] text-[#64748b] font-medium block">인코딩한 사람 / 프로그램</label>
                    <input
                      type="text"
                      value={newEncodedBy}
                      onChange={(e) => setNewEncodedBy(e.target.value)}
                      placeholder="iTunes 10.6.3.25"
                      className="w-full p-1.5 bg-white border border-[#cbd5e1] rounded text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#64748b] font-medium block">오디오 포맷</label>
                    <input
                      type="text"
                      value={newAudioFile?.name.endsWith('.m4a') ? 'AAC 오디오 (M4A)' : 'MPEG 오디오 (MP3)'}
                      readOnly
                      className="w-full p-1.5 bg-[#f1f5f9] border border-[#cbd5e1] rounded text-xs text-gray-500"
                    />
                  </div>
                </div>
              </div>

              {/* Key Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#f1f5f9]">
                <div>
                  <label className="block font-bold text-[#334155] mb-1">
                    노래 제목 (대표곡) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newSongTitle}
                    onChange={(e) => setNewSongTitle(e.target.value)}
                    placeholder="예: Power In The Blood"
                    className="w-full p-2 bg-[#f8fafc] border border-[#cbd5e1] rounded-lg outline-hidden focus:border-[#7c3aed]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#334155] mb-1">
                    아티스트 (가수) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newArtist}
                    onChange={(e) => setNewArtist(e.target.value)}
                    placeholder="예: Amy Grant"
                    className="w-full p-2 bg-[#f8fafc] border border-[#cbd5e1] rounded-lg outline-hidden focus:border-[#7c3aed]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#334155] mb-1">
                    앨범명 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newAlbumTitle}
                    onChange={(e) => setNewAlbumTitle(e.target.value)}
                    placeholder="예: Be Still And Know... Hymns & Faith"
                    className={`w-full p-2 bg-[#f8fafc] border rounded-lg outline-hidden focus:border-[#7c3aed] transition-colors ${
                      duplicateAlbum ? 'border-amber-400 bg-amber-50/40 ring-1 ring-amber-300' : 'border-[#cbd5e1]'
                    }`}
                  />
                  {duplicateAlbum && (
                    <div className="mt-1.5 p-2 bg-amber-50 border border-amber-300 rounded-lg text-[11px] text-amber-900 flex items-start gap-1.5 animate-fadeIn">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <span className="font-bold text-amber-950 block">
                          동일 앨범 기존 등록곡 감지 (1앨범 1대표곡 원칙)
                        </span>
                        <span className="text-amber-800 block truncate">
                          기존 보관곡: <strong>"{duplicateAlbum.songTitle}"</strong> ({duplicateAlbum.artist})
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowDuplicateConfirmModal(true)}
                          className="mt-1 text-[10px] text-amber-700 font-bold underline hover:text-amber-900 cursor-pointer"
                        >
                          중복 확인 및 등록 방식 선택 ➔
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-[#334155] mb-1">앨범 아티스트</label>
                  <input
                    type="text"
                    value={newAlbumArtist}
                    onChange={(e) => setNewAlbumArtist(e.target.value)}
                    placeholder="예: Amy Grant"
                    className="w-full p-2 bg-[#f8fafc] border border-[#cbd5e1] rounded-lg outline-hidden focus:border-[#7c3aed]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#334155] mb-1">작곡가</label>
                  <input
                    type="text"
                    value={newComposer}
                    onChange={(e) => setNewComposer(e.target.value)}
                    placeholder="예: Lewis E. Jones"
                    className="w-full p-2 bg-[#f8fafc] border border-[#cbd5e1] rounded-lg outline-hidden focus:border-[#7c3aed]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#334155] mb-1">장르</label>
                  <select
                    value={newGenre}
                    onChange={(e) => setNewGenre(e.target.value)}
                    className="w-full p-2 bg-[#f8fafc] border border-[#cbd5e1] rounded-lg outline-hidden focus:border-[#7c3aed]"
                  >
                    {GENRE_OPTIONS.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#334155] mb-1">발매 연도</label>
                  <input
                    type="text"
                    value={newReleaseYear}
                    onChange={(e) => setNewReleaseYear(e.target.value)}
                    placeholder="예: 2015"
                    className="w-full p-2 bg-[#f8fafc] border border-[#cbd5e1] rounded-lg outline-hidden focus:border-[#7c3aed]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-[#334155] mb-1">트랙 번호</label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="1"
                        value={newTrackNumber}
                        onChange={(e) => setNewTrackNumber(parseInt(e.target.value) || 1)}
                        className="w-16 p-2 bg-[#f8fafc] border border-[#cbd5e1] rounded-lg text-center"
                      />
                      <span>/</span>
                      <input
                        type="number"
                        min="1"
                        value={newTotalTracks}
                        onChange={(e) => setNewTotalTracks(parseInt(e.target.value) || 1)}
                        className="w-16 p-2 bg-[#f8fafc] border border-[#cbd5e1] rounded-lg text-center"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-[#334155] mb-1">선호도</label>
                    <div className="flex items-center text-[#eab308] mt-2 cursor-pointer">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          onClick={() => setNewRating(s)}
                          className={`w-4 h-4 cursor-pointer ${
                            s <= newRating ? 'fill-current text-[#eab308]' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#334155] mb-1">소장 주석 / 감상 메모</label>
                <input
                  type="text"
                  value={newComments}
                  onChange={(e) => setNewComments(e.target.value)}
                  placeholder="예: 권용우 소장 CD 컬렉션, 어쿠스틱 기타와 깊은 영성이 돋보이는 명반..."
                  className="w-full p-2 bg-[#f8fafc] border border-[#cbd5e1] rounded-lg outline-hidden focus:border-[#7c3aed]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-[#ff6b2b] text-xs flex items-center gap-1">
                    <span>🇰🇷 한글 번역 / 한국어 가사</span>
                    <span className="text-[10px] text-gray-400 font-normal">(플레이어와 카드에서 우선 표시)</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const found = getKoreanLyricsForSong(newSongTitle, newArtist, newLyrics);
                      if (found) {
                        setNewKoreanLyrics(found);
                      } else {
                        alert('해당 곡에 대한 사전 등록 한글 가사가 없습니다.');
                      }
                    }}
                    className="px-2 py-0.5 bg-[#fff5ee] hover:bg-[#ffe8dc] text-[#ff6b2b] border border-[#ffd8c2] rounded text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>한글 가사 자동 찾기</span>
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={newKoreanLyrics}
                  onChange={(e) => setNewKoreanLyrics(e.target.value)}
                  placeholder="한국어 번역 가사나 정식 가사를 입력하거나 자동 찾기 버튼을 눌러주세요..."
                  className="w-full p-2 bg-[#f8fafc] border border-[#cbd5e1] rounded-lg outline-hidden focus:border-[#ff6b2b] text-xs leading-relaxed"
                />
              </div>

              <div>
                <label className="block font-bold text-[#334155] mb-1 text-xs">🌐 원문 노래 가사 (Original Lyrics)</label>
                <textarea
                  rows={3}
                  value={newLyrics}
                  onChange={(e) => setNewLyrics(e.target.value)}
                  placeholder="원문 가사를 입력해두면 원문/한글 나란히 보기에서 함께 확인하실 수 있습니다..."
                  className="w-full p-2 bg-[#f8fafc] border border-[#cbd5e1] rounded-lg outline-hidden focus:border-[#7c3aed] text-xs leading-relaxed"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#f1f5f9]">
                <button
                  type="button"
                  onClick={handleCloseAddModal}
                  className="px-4 py-2 border border-[#cbd5e1] text-[#475569] rounded-lg font-bold hover:bg-[#f1f5f9] cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-5 py-2 rounded-lg font-bold flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50 transition-all ${
                    duplicateAlbum
                      ? 'bg-amber-600 hover:bg-amber-700 text-white ring-2 ring-amber-300/60'
                      : 'bg-[#7c3aed] hover:bg-[#6d28d9] text-white'
                  }`}
                >
                  {isSubmitting ? (
                    <span>등록 처리 중...</span>
                  ) : duplicateAlbum ? (
                    <>
                      <AlertTriangle className="w-4 h-4 text-amber-200" />
                      <span>동일 앨범 확인 후 등록</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>소장 음반 등록하기</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: BATCH EXTRACTION PROGRESS & RESULTS MODAL */}
      {/* ========================================================================= */}
      {isBatchProcessing && (
        <div className="fixed inset-0 z-60 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 animate-fadeIn">
          <div className="bg-white border border-[#cbd5e1] rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl flex flex-col gap-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#e2e8f0]">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-[#ff6b2b] to-[#7c3aed] text-white flex items-center justify-center shadow-md">
                  <Disc3 className="w-5 h-5 animate-spin" style={{ animationDuration: '4s' }} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0f172a]">
                    {isBatchCompleted ? '🎉 음원 일괄 자동 등록 완료!' : '⚡ 음원 일괄 자동 분석 및 등록 중'}
                  </h3>
                  <p className="text-[11px] text-[#64748b]">
                    {isBatchCompleted
                      ? `총 ${batchResults.length}곡의 앨범이 라이브러리에 등록되었습니다.`
                      : '파일의 ID3 태그, 앨범 커버, 오디오 기술 속성값을 정밀 추출하고 있습니다.'}
                  </p>
                </div>
              </div>
              {isBatchCompleted && (
                <button
                  type="button"
                  onClick={() => setIsBatchProcessing(false)}
                  className="p-1 text-gray-400 hover:text-gray-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Progress Bar & Counter */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs font-mono font-bold">
                <span className="text-[#334155] truncate max-w-[280px]">
                  {isBatchCompleted ? '모든 음원 등록 완료' : `분석 중: ${batchProgress.currentTitle}`}
                </span>
                <span className="text-[#7c3aed]">
                  {batchProgress.current} / {batchProgress.total}곡 ({Math.round((batchProgress.current / (batchProgress.total || 1)) * 100)}%)
                </span>
              </div>
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden border border-gray-200 shadow-inner">
                <div
                  className="h-full bg-linear-to-r from-[#ff6b2b] via-[#9333ea] to-[#7c3aed] transition-all duration-150"
                  style={{ width: `${Math.round((batchProgress.current / (batchProgress.total || 1)) * 100)}%` }}
                />
              </div>
            </div>

            {/* Extracted Tracks Preview List */}
            <div className="max-h-60 overflow-y-auto border border-[#e2e8f0] rounded-xl p-2 flex flex-col gap-1.5 bg-[#f8fafc] custom-retro-scrollbar">
              {batchResults.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  음원 태그 분석을 시작합니다...
                </div>
              ) : (
                batchResults.map((item, idx) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs text-[11px]"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <img
                        src={item.coverImageUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=100&q=80'}
                        alt=""
                        className="w-8 h-8 rounded object-cover border border-gray-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-bold text-[#0f172a] truncate leading-tight">
                          {idx + 1}. {item.songTitle}
                        </p>
                        <p className="text-[#64748b] text-[10px] truncate leading-tight mt-0.5">
                          {item.artist} · {item.albumTitle}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-mono text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
                        {item.formattedDuration}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                        <Check className="w-3 h-3" />
                        완료
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Notice & Close Button */}
            {isBatchCompleted ? (
              <div className="flex flex-col gap-3 pt-2">
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 flex items-start gap-2">
                  <Radio className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-[11px] leading-relaxed">
                    <strong>일괄 등록이 성공적으로 완료되었습니다!</strong>
                    <p className="mt-0.5 text-amber-800">
                      요청하신 대로 Cloudflare R2 링크는 비워둔 상태로 앨범이 완성되었습니다. 이제 각 앨범의 <strong>[R2등록]</strong> 버튼을 누르시거나 아래 버튼을 통해 <strong>수작업으로 개별 등록</strong>하실 수 있습니다.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsBatchProcessing(false)}
                    className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg cursor-pointer transition-colors"
                  >
                    목록 확인하기
                  </button>
                  {batchResults.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsBatchProcessing(false);
                        openQuickLinkModal(batchResults[0]);
                      }}
                      className="px-4 py-2 bg-[#ff6b2b] hover:bg-[#ea580c] text-white font-bold rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Link className="w-3.5 h-3.5" />
                      <span>R2 링크 순차 등록 시작 ➔</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center text-[11px] text-gray-500 py-1">
                잠시만 기다려주세요. 음원 태그 추출 및 앨범 등록을 진행 중입니다...
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: QUICK INDIVIDUAL CLOUDFLARE R2 LINK REGISTRATION MODAL */}
      {/* ========================================================================= */}
      {quickLinkModalAlbum && (
        <div
          className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-fadeIn"
          onClick={() => {
            if (quickLinkAudioRef.current) {
              quickLinkAudioRef.current.pause();
              quickLinkAudioRef.current = null;
            }
            setQuickLinkPlaying(false);
            setQuickLinkModalAlbum(null);
          }}
        >
          <div
            className="bg-white border border-[#cbd5e1] rounded-2xl max-w-lg w-full p-5 shadow-2xl flex flex-col gap-4 text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#e2e8f0]">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#ea580c] text-white flex items-center justify-center shadow-xs">
                  <Radio className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0f172a]">
                    Cloudflare R2 스트리밍 링크 수작업 등록
                  </h3>
                  <p className="text-[11px] text-[#64748b]">
                    방문자가 재생(Play) 버튼을 누를 때 스트리밍될 Cloudflare R2 주소를 입력합니다.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (quickLinkAudioRef.current) {
                    quickLinkAudioRef.current.pause();
                    quickLinkAudioRef.current = null;
                  }
                  setQuickLinkPlaying(false);
                  setQuickLinkModalAlbum(null);
                }}
                className="text-gray-400 hover:text-gray-700 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Target Album Info Card */}
            <div className="p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl flex items-center gap-3">
              <img
                src={quickLinkModalAlbum.coverImageUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=200&q=80'}
                alt=""
                className="w-14 h-14 rounded-lg object-cover border border-gray-200 shadow-xs shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-1.5 py-0.5 rounded">
                    Tr.{quickLinkModalAlbum.trackNumber || 1}
                  </span>
                  <h4 className="font-bold text-sm text-[#0f172a] truncate">
                    {quickLinkModalAlbum.songTitle}
                  </h4>
                </div>
                <p className="text-xs text-[#475569] mt-0.5 truncate">
                  {quickLinkModalAlbum.artist} · {quickLinkModalAlbum.albumTitle}
                </p>
                {quickLinkModalAlbum.audioFileName && (
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="text-[10px] text-gray-500 font-mono truncate max-w-[200px]" title="매칭할 오디오 파일명">
                      📁 {quickLinkModalAlbum.audioFileName}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(quickLinkModalAlbum.audioFileName || '');
                        alert(`파일명이 복사되었습니다: ${quickLinkModalAlbum.audioFileName}`);
                      }}
                      className="text-[9px] bg-gray-200 hover:bg-gray-300 px-1.5 py-0.5 rounded text-gray-700 cursor-pointer font-sans"
                    >
                      파일명 복사
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* URL Input Form */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="font-bold text-xs text-[#0f172a] flex items-center gap-1">
                  <Link className="w-3.5 h-3.5 text-[#ea580c]" />
                  <span>Cloudflare R2 음원 URL 주소</span>
                </label>
                <span className="text-[10px] text-purple-700 font-mono">
                  .mp3 / .m4a 스트리밍 링크
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <input
                  type="url"
                  value={quickLinkUrl}
                  onChange={(e) => setQuickLinkUrl(e.target.value)}
                  placeholder="예: https://pub-xxxxxx.r2.dev/music/08_Danny_Boy.mp3"
                  className="flex-1 p-2.5 bg-white border border-[#cbd5e1] rounded-lg font-mono text-xs text-[#0f172a] outline-hidden focus:border-[#ea580c] focus:ring-1 focus:ring-[#ea580c] shadow-2xs"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleToggleTestPlay}
                  disabled={!quickLinkUrl.trim()}
                  className={`px-3 py-2.5 rounded-lg font-bold text-xs flex items-center gap-1 transition-all cursor-pointer shrink-0 ${
                    quickLinkPlaying
                      ? 'bg-rose-600 text-white animate-pulse'
                      : quickLinkUrl.trim()
                      ? 'bg-purple-100 hover:bg-purple-200 text-purple-800'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                  title="입력한 URL로 음원이 재생되는지 테스트합니다."
                >
                  {quickLinkPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{quickLinkPlaying ? '정지' : '미리듣기'}</span>
                </button>
              </div>
              <p className="text-[10px] text-[#64748b]">
                💡 방문자가 재생(Play) 버튼을 누르면 이 R2 주소로 즉시 고음질 스트리밍됩니다.
              </p>
            </div>

            {/* Navigation & Action Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-[#e2e8f0]">
              <button
                type="button"
                onClick={() => {
                  if (quickLinkAudioRef.current) {
                    quickLinkAudioRef.current.pause();
                    quickLinkAudioRef.current = null;
                  }
                  setQuickLinkPlaying(false);
                  setQuickLinkModalAlbum(null);
                }}
                className="px-3 py-1.5 text-gray-500 hover:text-gray-800 font-medium cursor-pointer"
              >
                취소
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSaveQuickLink(false)}
                  className="px-3.5 py-1.5 bg-white hover:bg-gray-50 border border-gray-300 text-gray-800 font-bold rounded-lg shadow-2xs transition-colors cursor-pointer"
                >
                  저장
                </button>

                <button
                  type="button"
                  onClick={() => handleSaveQuickLink(true)}
                  className="px-4 py-1.5 bg-[#ea580c] hover:bg-[#c2410c] text-white font-bold rounded-lg shadow-xs flex items-center gap-1 transition-transform active:scale-95 cursor-pointer"
                  title="현재 곡 링크를 저장하고 바로 다음 미등록 곡으로 이동합니다."
                >
                  <span>저장 후 다음 곡으로</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 1 Album 1 Song Principle - Duplicate Album Title Confirmation Modal */}
      {showDuplicateConfirmModal && duplicateAlbum && (
        <div
          className="fixed inset-0 z-70 bg-black/65 backdrop-blur-2xs flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setShowDuplicateConfirmModal(false)}
        >
          <div
            className="bg-white border-2 border-amber-500 rounded-2xl max-w-md w-full p-4 sm:p-5 shadow-2xl flex flex-col gap-3.5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Title */}
            <div className="flex items-center justify-between pb-2 border-b border-amber-200">
              <div className="flex items-center gap-2 text-amber-700 font-bold text-sm">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 leading-tight">
                    동일 앨범 중복 등록 확인
                  </h3>
                  <span className="text-[10px] text-amber-700 font-medium">
                    1앨범당 대표곡 1곡 등록 원칙
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDuplicateConfirmModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Principle Explanation Callout */}
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed flex flex-col gap-1">
              <p className="font-bold text-amber-950 flex items-center gap-1">
                <span>⚠️ 소장 CD/음원 아카이브 원칙:</span>
              </p>
              <p className="text-[11px] text-amber-800">
                <strong>1개 앨범당 대표곡 1곡</strong>을 보관하는 것이 원칙입니다.
                입력하신 앨범 <strong>"{newAlbumTitle}"</strong>에는 이미 대표곡이 보관되어 있습니다.
              </p>
            </div>

            {/* Comparison Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              {/* Existing Track */}
              <div className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                  <Disc3 className="w-3 h-3 text-gray-400" />
                  현재 보관 대표곡
                </span>
                <div className="flex items-center gap-2">
                  <img
                    src={duplicateAlbum.coverImageUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=200&q=80'}
                    alt={duplicateAlbum.albumTitle}
                    className="w-11 h-11 rounded-lg object-cover border border-gray-300 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-gray-900 truncate text-[11px]">{duplicateAlbum.songTitle}</p>
                    <p className="text-[10px] text-gray-500 truncate">{duplicateAlbum.artist}</p>
                    <p className="text-[9px] text-gray-400 font-mono mt-0.5">등록일: {duplicateAlbum.dateAdded}</p>
                  </div>
                </div>
              </div>

              {/* New Candidate Track */}
              <div className="p-2.5 bg-purple-50 border border-purple-200 rounded-xl flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wide flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-purple-500" />
                  새로 입력한 대표곡
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-11 h-11 rounded-lg bg-purple-100 border border-purple-300 flex items-center justify-center shrink-0 overflow-hidden">
                    {newCoverPreview ? (
                      <img src={newCoverPreview} alt="New cover" className="w-full h-full object-cover" />
                    ) : (
                      <Disc3 className="w-5 h-5 text-purple-400" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-purple-950 truncate text-[11px]">{newSongTitle}</p>
                    <p className="text-[10px] text-purple-600 truncate">{newArtist}</p>
                    <p className="text-[9px] text-purple-500 font-mono mt-0.5">신규 입력</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => executeAddAlbum(true)}
                disabled={isSubmitting}
                className="w-full py-2 px-3 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-colors"
              >
                <Check className="w-4 h-4 text-purple-200" />
                <span>이 음원으로 앨범 대표곡 교체하기 (1앨범 1곡 준수)</span>
              </button>

              <button
                type="button"
                onClick={() => executeAddAlbum(false)}
                disabled={isSubmitting}
                className="w-full py-2 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-colors"
              >
                <AlertTriangle className="w-4 h-4 text-amber-200" />
                <span>확인 후 등록 (동일 앨범 추가 보관)</span>
              </button>

              <button
                type="button"
                onClick={() => setShowDuplicateConfirmModal(false)}
                className="w-full py-1.5 text-gray-500 hover:text-gray-800 text-xs font-medium cursor-pointer text-center"
              >
                취소 (기존 곡 유지)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {albumToDelete && (
        <div
          className="fixed inset-0 z-60 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setAlbumToDelete(null)}
        >
          <div
            className="bg-white border-2 border-red-500 rounded-xl max-w-sm w-full p-4 shadow-2xl flex flex-col gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 text-red-600 font-bold text-sm">
              <Trash2 className="w-4 h-4" />
              <span>소장 CD 음반 삭제 확인</span>
            </div>

            <div className="p-2.5 bg-[#fff5f5] border border-[#fed7d7] rounded text-xs text-[#2d3748] flex flex-col gap-1">
              <p className="font-bold text-[#9b2c2c] truncate">
                "{albumToDelete.songTitle}" — {albumToDelete.artist}
              </p>
              <p className="text-[11px] text-[#742a2a] leading-relaxed">
                이 소장 CD 음반 및 오디오 파일을 정말 삭제하시겠습니까? 삭제하면 영구히 제거됩니다.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1 border-t border-[#edf2f7]">
              <button
                type="button"
                onClick={() => setAlbumToDelete(null)}
                className="px-3 py-1.5 bg-white border border-[#cbd5e0] text-[#4a5568] rounded text-xs font-medium hover:bg-[#f7fafc] cursor-pointer"
              >
                취소
              </button>
              <button
                type="button"
                onClick={async () => {
                  const id = albumToDelete.id;
                  setAlbumToDelete(null);
                  try {
                    await deleteCdAudioFromDB(id);
                  } catch (e) {
                    console.warn(e);
                  }
                  onDeleteAlbum(id);
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
      {/* Multi-Device Backup & Restore Modal */}
      {isBackupModalVisible && (
        <div
          className="fixed inset-0 z-70 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4 animate-fadeIn"
          onClick={handleCloseBackupModal}
        >
          <div
            className="bg-white border-2 border-indigo-500 rounded-2xl max-w-lg w-full p-4 sm:p-5 shadow-2xl flex flex-col gap-3.5 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-indigo-100">
              <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    소장 음반 백업·복원
                  </h3>
                  <span className="text-[10px] text-indigo-600 font-medium">
                    소장 앨범 목록 파일 백업 및 불러오기
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseBackupModal}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {backupNotice && (
              <div className="p-3 bg-amber-50 border border-amber-300 text-amber-900 rounded-xl text-xs flex items-center justify-between gap-2 shadow-2xs">
                <span className="font-medium leading-relaxed">{backupNotice}</span>
                <button
                  type="button"
                  onClick={() => setBackupNotice('')}
                  className="text-amber-500 hover:text-amber-800 p-1 shrink-0 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Explanation */}
            <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-xl text-xs text-indigo-950 flex flex-col gap-1.5 leading-relaxed">
              <p className="font-bold flex items-center gap-1 text-indigo-900">
                <Cloud className="w-4 h-4 text-indigo-600" />
                <span>기기 간 데이터 이동 방법 (PC/Android ➔ iPad):</span>
              </p>
              <p className="text-[11px] text-gray-700">
                1. <strong>PC 또는 Android</strong>에서 아래 <strong>[현재 소장 앨범 백업 파일 다운로드]</strong> 버튼을 누릅니다.
                <br />
                2. 다운로드된 <code className="bg-white px-1 py-0.5 rounded border text-indigo-600 font-mono">kwon_cd_collection_....json</code> 파일을 <strong>iPad</strong>에서 아래 <strong>[백업 파일 불러오기]</strong>로 선택하면, 즉시 모든 앨범이 iPad에 복원됩니다!
              </p>
            </div>

            {/* 1. Export */}
            <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-gray-900">1. 소장 앨범 백업 파일 내보내기 (PC / Android)</h4>
                  <p className="text-[11px] text-gray-500">현재 등록된 {albums.length}개 소장 음반 전체를 JSON 파일로 저장합니다.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleExportJson}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>현재 소장 앨범 백업 파일 다운로드 ({albums.length}곡)</span>
              </button>
            </div>

            {/* 2. Import */}
            <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl flex flex-col gap-2">
              <div>
                <h4 className="text-xs font-bold text-gray-900">2. 백업 파일 불러오기 (iPad / 새 기기)</h4>
                <p className="text-[11px] text-gray-500">PC에서 다운로드한 백업 JSON 파일을 선택하여 앨범 목록을 즉시 복원합니다.</p>
              </div>

              <input
                ref={backupFileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleImportJsonFile}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => backupFileInputRef.current?.click()}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
              >
                <FileUp className="w-4 h-4" />
                <span>백업 파일(.json) 선택하여 iPad에 복원하기</span>
              </button>
            </div>

            {/* 3. Direct JSON Paste */}
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-900">3. 또는 텍스트 복사/붙여넣기로 복원</label>
              <textarea
                rows={2}
                value={backupInputText}
                onChange={(e) => setBackupInputText(e.target.value)}
                placeholder="백업 JSON 텍스트를 복사하여 여기에 붙여넣으셔도 복원됩니다..."
                className="w-full p-2 bg-white border border-gray-300 rounded text-xs font-mono"
              />
              <button
                type="button"
                onClick={handleImportJsonText}
                disabled={!backupInputText.trim()}
                className="py-1.5 px-3 bg-gray-700 hover:bg-gray-800 text-white rounded text-xs font-bold self-end cursor-pointer disabled:opacity-40"
              >
                붙여넣은 데이터 복원
              </button>
            </div>

            <div className="flex justify-end pt-1 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCloseBackupModal}
                className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded text-xs font-bold cursor-pointer"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
