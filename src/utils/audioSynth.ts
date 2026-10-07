// Cyworld Retro BGM Audio Engine (Synth + User Custom Audio File Support)
import {
  saveAudioTrackToDB,
  getAllAudioTracksFromDB,
  deleteAudioTrackFromDB,
  StoredAudioTrack,
  getNormalizedAudioBlob,
  readFileAsDataUrl
} from './audioStorage';

export type TrackSourceType = 'synth' | 'audio_file';
export type BgmPlayMode = 'all' | 'repeat_one' | 'repeat_selected' | 'repeat_custom' | 'random';

export interface BgmTrack {
  id: string;
  title: string;
  artist: string;
  duration?: number; // in seconds
  type: TrackSourceType;
  notes?: { note: string; dur: number }[]; // for synth tracks
  audioUrl?: string; // object URL or data URL
  fileName?: string;
  isCustom?: boolean;
}

// Frequency map for standard notes
const NOTE_FREQS: Record<string, number> = {
  'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63, 'F4': 349.23,
  'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88,
  'C5': 523.25, 'C#5': 554.37, 'D5': 587.33, 'D#5': 622.25, 'E5': 659.25, 'F5': 698.46,
  'F#5': 739.99, 'G5': 783.99, 'G#5': 830.61, 'A5': 880.00, 'A#5': 932.33, 'B5': 987.77,
  'C6': 1046.50, 'REST': 0
};

export const BUILTIN_BGM_PLAYLIST: BgmTrack[] = [
  {
    id: 'freestyle_y',
    title: 'Y (Please Tell Me Why)',
    artist: '프리스타일 (Freestyle)',
    duration: 184,
    type: 'synth',
    notes: [
      { note: 'G4', dur: 0.4 }, { note: 'A4', dur: 0.4 }, { note: 'B4', dur: 0.8 },
      { note: 'D5', dur: 0.8 }, { note: 'B4', dur: 0.4 }, { note: 'A4', dur: 0.4 },
      { note: 'G4', dur: 0.8 }, { note: 'E4', dur: 0.8 }, { note: 'G4', dur: 0.4 },
      { note: 'A4', dur: 0.4 }, { note: 'B4', dur: 0.4 }, { note: 'C5', dur: 0.4 },
      { note: 'B4', dur: 0.4 }, { note: 'A4', dur: 0.4 }, { note: 'G4', dur: 1.2 },
      { note: 'REST', dur: 0.4 }
    ]
  },
  {
    id: 'snow_flower',
    title: '눈의 꽃 (Snow Flower)',
    artist: '박효신',
    duration: 210,
    type: 'synth',
    notes: [
      { note: 'E4', dur: 0.6 }, { note: 'G4', dur: 0.6 }, { note: 'A4', dur: 0.6 },
      { note: 'B4', dur: 1.2 }, { note: 'A4', dur: 0.6 }, { note: 'G4', dur: 0.6 },
      { note: 'E4', dur: 1.2 }, { note: 'D4', dur: 0.6 }, { note: 'E4', dur: 0.6 },
      { note: 'G4', dur: 1.2 }, { note: 'A4', dur: 1.2 }, { note: 'B4', dur: 1.5 },
      { note: 'REST', dur: 0.5 }
    ]
  },
  {
    id: 'my_person',
    title: '내 사람 (Partner For Life)',
    artist: 'SG워너비',
    duration: 195,
    type: 'synth',
    notes: [
      { note: 'D4', dur: 0.4 }, { note: 'G4', dur: 0.4 }, { note: 'B4', dur: 0.4 },
      { note: 'D5', dur: 0.8 }, { note: 'C5', dur: 0.4 }, { note: 'B4', dur: 0.4 },
      { note: 'A4', dur: 0.8 }, { note: 'G4', dur: 0.4 }, { note: 'A4', dur: 0.4 },
      { note: 'B4', dur: 0.8 }, { note: 'G4', dur: 1.2 },
      { note: 'REST', dur: 0.4 }
    ]
  },
  {
    id: 'me_to_you',
    title: '너에게 난 나에게 넌',
    artist: '자전거 탄 풍경',
    duration: 220,
    type: 'synth',
    notes: [
      { note: 'C4', dur: 0.5 }, { note: 'E4', dur: 0.5 }, { note: 'G4', dur: 0.5 },
      { note: 'C5', dur: 1.0 }, { note: 'B4', dur: 0.5 }, { note: 'A4', dur: 0.5 },
      { note: 'G4', dur: 1.0 }, { note: 'F4', dur: 0.5 }, { note: 'E4', dur: 0.5 },
      { note: 'D4', dur: 1.0 }, { note: 'C4', dur: 1.5 },
      { note: 'REST', dur: 0.5 }
    ]
  }
];

class BgmEngine {
  private playlist: BgmTrack[] = [...BUILTIN_BGM_PLAYLIST];
  private ctx: AudioContext | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private isPlaying: boolean = false;
  private volume: number = 0.5;
  private currentTrackIdx: number = 0;
  private noteTimer: number | null = null;
  private noteIdx: number = 0;
  private listeners: (() => void)[] = [];
  private currentTime: number = 0;
  private duration: number = 0;
  
  // Playback repeat mode: 'all' | 'repeat_one' | 'repeat_selected' | 'repeat_custom'
  private playMode: BgmPlayMode = 'all';
  // Selected track IDs for selective repeat playback
  private selectedTrackIds: Set<string> = new Set();
  private onConfigChangeHandler: ((config: { playMode: BgmPlayMode; selectedTrackIds: string[] }) => void) | null = null;

  constructor() {
    this.loadPreferences();
    this.initAudioElement();
    this.loadPersistedTracks();
  }

  public setOnConfigChange(handler: (config: { playMode: BgmPlayMode; selectedTrackIds: string[] }) => void) {
    this.onConfigChangeHandler = handler;
  }

  private triggerConfigChange() {
    if (this.onConfigChangeHandler) {
      this.onConfigChangeHandler({
        playMode: this.playMode,
        selectedTrackIds: Array.from(this.selectedTrackIds)
      });
    }
  }

  public applyRemoteConfig(mode?: BgmPlayMode, selectedIds?: string[]) {
    let changed = false;
    if (mode && mode !== this.playMode) {
      this.playMode = mode;
      try {
        localStorage.setItem('kwon_bgm_play_mode', mode);
      } catch {}
      changed = true;
    }
    if (selectedIds && Array.isArray(selectedIds)) {
      this.selectedTrackIds = new Set(selectedIds);
      try {
        localStorage.setItem('kwon_bgm_selected_tracks', JSON.stringify(selectedIds));
      } catch {}
      changed = true;
    }
    if (changed) {
      this.notify();
    }
  }

  private loadPreferences() {
    try {
      const savedMode = localStorage.getItem('kwon_bgm_play_mode') as BgmPlayMode | null;
      if (savedMode && ['all', 'repeat_one', 'repeat_selected', 'repeat_custom', 'random'].includes(savedMode)) {
        this.playMode = savedMode;
      }
      const savedSelected = localStorage.getItem('kwon_bgm_selected_tracks');
      if (savedSelected) {
        const parsed = JSON.parse(savedSelected);
        if (Array.isArray(parsed)) {
          this.selectedTrackIds = new Set(parsed);
        }
      }
    } catch {
      // ignore
    }
  }

  private saveSelectedTrackIds() {
    try {
      localStorage.setItem('kwon_bgm_selected_tracks', JSON.stringify(Array.from(this.selectedTrackIds)));
    } catch {
      // ignore
    }
    this.triggerConfigChange();
  }

  private initAudioElement() {
    if (typeof window === 'undefined') return;
    this.audioElement = new Audio();
    this.audioElement.volume = this.volume;

    this.audioElement.onended = () => {
      this.nextTrack(false);
    };

    this.audioElement.ontimeupdate = () => {
      if (this.audioElement) {
        this.currentTime = this.audioElement.currentTime;
        this.duration = this.audioElement.duration || 0;
        this.notify();
      }
    };

    this.audioElement.onerror = (e) => {
      console.warn('Audio playback error', e);
      this.isPlaying = false;
      this.notify();
    };
  }

  private async loadPersistedTracks() {
    try {
      const stored = await getAllAudioTracksFromDB();
      if (stored && stored.length > 0) {
        const customTracks: BgmTrack[] = stored.map((item: StoredAudioTrack) => {
          let audioUrl = item.dataUrl;
          if (!audioUrl) {
            const normalized = getNormalizedAudioBlob(item.blob, item.fileName);
            audioUrl = URL.createObjectURL(normalized);
          }
          return {
            id: item.id,
            title: item.title,
            artist: item.artist,
            fileName: item.fileName,
            type: 'audio_file',
            audioUrl,
            isCustom: true
          };
        });

        // Automatically add custom tracks to selected tracks if empty
        if (this.selectedTrackIds.size === 0) {
          customTracks.forEach((t) => this.selectedTrackIds.add(t.id));
          this.saveSelectedTrackIds();
        }

        // Apply saved track order if present
        try {
          const savedOrderStr = localStorage.getItem('kwon_bgm_track_order');
          if (savedOrderStr) {
            const savedOrder: string[] = JSON.parse(savedOrderStr);
            const allTracks = [...customTracks, ...BUILTIN_BGM_PLAYLIST];
            allTracks.sort((a, b) => {
              const idxA = savedOrder.indexOf(a.id);
              const idxB = savedOrder.indexOf(b.id);
              if (idxA !== -1 && idxB !== -1) return idxA - idxB;
              if (idxA !== -1) return -1;
              if (idxB !== -1) return 1;
              return 0;
            });
            this.playlist = allTracks;
          } else {
            this.playlist = [...customTracks, ...BUILTIN_BGM_PLAYLIST];
          }
        } catch {
          this.playlist = [...customTracks, ...BUILTIN_BGM_PLAYLIST];
        }
        this.notify();
      }
    } catch (e) {
      console.warn('Could not load custom tracks from IndexedDB', e);
    }
  }

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(fn => fn());
  }

  public getPlaylist(): BgmTrack[] {
    return this.playlist;
  }

  public getCurrentTrack(): BgmTrack {
    return this.playlist[this.currentTrackIdx] || this.playlist[0];
  }

  public getTrackIndex(): number {
    return this.currentTrackIdx;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getVolume(): number {
    return this.volume;
  }

  public getCurrentTime(): number {
    return this.currentTime;
  }

  public getDuration(): number {
    const track = this.getCurrentTrack();
    if (track.type === 'audio_file' && this.duration > 0) {
      return this.duration;
    }
    return track.duration || 180;
  }

  public getPlayMode(): BgmPlayMode {
    return this.playMode;
  }

  public setPlayMode(mode: BgmPlayMode) {
    this.playMode = mode;
    try {
      localStorage.setItem('kwon_bgm_play_mode', mode);
    } catch {
      // ignore
    }
    this.triggerConfigChange();
    this.notify();
  }

  public cyclePlayMode(): BgmPlayMode {
    const modes: BgmPlayMode[] = ['all', 'repeat_one', 'repeat_selected', 'repeat_custom', 'random'];
    const nextIdx = (modes.indexOf(this.playMode) + 1) % modes.length;
    this.setPlayMode(modes[nextIdx]);
    return modes[nextIdx];
  }

  // Selected tracks management for 'repeat_selected' mode
  public isTrackSelected(id: string): boolean {
    return this.selectedTrackIds.has(id);
  }

  public toggleTrackSelected(id: string) {
    if (this.selectedTrackIds.has(id)) {
      this.selectedTrackIds.delete(id);
    } else {
      this.selectedTrackIds.add(id);
    }
    this.saveSelectedTrackIds();
    this.notify();
  }

  public selectAllCustom() {
    this.playlist.forEach((t) => {
      if (t.isCustom) this.selectedTrackIds.add(t.id);
    });
    this.saveSelectedTrackIds();
    this.notify();
  }

  public selectAll() {
    this.playlist.forEach((t) => this.selectedTrackIds.add(t.id));
    this.saveSelectedTrackIds();
    this.notify();
  }

  public deselectAll() {
    this.selectedTrackIds.clear();
    this.saveSelectedTrackIds();
    this.notify();
  }

  public getSelectedTrackCount(): number {
    return this.selectedTrackIds.size;
  }

  public saveTrackOrder() {
    try {
      const order = this.playlist.map((t) => t.id);
      localStorage.setItem('kwon_bgm_track_order', JSON.stringify(order));
    } catch {
      // ignore
    }
  }

  public moveTrack(fromIndex: number, toIndex: number) {
    if (fromIndex < 0 || fromIndex >= this.playlist.length || toIndex < 0 || toIndex >= this.playlist.length) return;
    const currentTrackId = this.playlist[this.currentTrackIdx]?.id;
    const item = this.playlist[fromIndex];
    const newPlaylist = [...this.playlist];
    newPlaylist.splice(fromIndex, 1);
    newPlaylist.splice(toIndex, 0, item);
    this.playlist = newPlaylist;

    // Keep current track playing correctly
    if (currentTrackId) {
      const newIdx = this.playlist.findIndex((t) => t.id === currentTrackId);
      if (newIdx !== -1) {
        this.currentTrackIdx = newIdx;
      }
    }
    this.saveTrackOrder();
    this.notify();
  }

  public moveTrackUp(index: number) {
    if (index > 0) {
      this.moveTrack(index, index - 1);
    }
  }

  public moveTrackDown(index: number) {
    if (index < this.playlist.length - 1) {
      this.moveTrack(index, index + 1);
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.audioElement) {
      this.audioElement.volume = this.volume;
    }
    this.notify();
  }

  public togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  public selectTrack(index: number) {
    if (index >= 0 && index < this.playlist.length) {
      this.stopCurrent();
      this.currentTrackIdx = index;
      this.noteIdx = 0;
      this.play();
    }
  }

  public play() {
    const track = this.getCurrentTrack();
    if (!track) return;

    this.isPlaying = true;

    if (track.type === 'audio_file' && track.audioUrl) {
      // Play real audio file
      if (this.noteTimer !== null) {
        window.clearTimeout(this.noteTimer);
        this.noteTimer = null;
      }
      if (this.audioElement) {
        if (this.audioElement.src !== track.audioUrl) {
          this.audioElement.src = track.audioUrl;
        }
        this.audioElement.volume = this.volume;
        this.audioElement.play().catch((err) => {
          console.warn('Playback error', err);
        });
      }
    } else {
      // Play synth
      if (this.audioElement) {
        this.audioElement.pause();
      }
      this.initCtx();
      this.scheduleNextNote();
    }

    this.notify();
  }

  public pause() {
    this.isPlaying = false;
    this.stopCurrent();
    this.notify();
  }

  private stopCurrent() {
    if (this.audioElement) {
      this.audioElement.pause();
    }
    if (this.noteTimer !== null) {
      window.clearTimeout(this.noteTimer);
      this.noteTimer = null;
    }
  }

  public replayCurrentTrack() {
    const track = this.getCurrentTrack();
    if (!track) return;
    this.noteIdx = 0;
    if (track.type === 'audio_file' && this.audioElement) {
      this.audioElement.currentTime = 0;
      this.audioElement.play().catch((e) => console.warn(e));
    } else {
      this.stopCurrent();
      this.play();
    }
    this.notify();
  }

  public nextTrack(userExplicit: boolean = false) {
    // 1곡 반복재생 mode: if automatic track end, replay same track
    if (!userExplicit && this.playMode === 'repeat_one') {
      this.replayCurrentTrack();
      return;
    }

    this.stopCurrent();

    if (this.playMode === 'random') {
      // Pick random track from playlist
      if (this.playlist.length > 1) {
        let randomIdx = Math.floor(Math.random() * this.playlist.length);
        let attempts = 0;
        while (randomIdx === this.currentTrackIdx && attempts < 10) {
          randomIdx = Math.floor(Math.random() * this.playlist.length);
          attempts++;
        }
        this.currentTrackIdx = randomIdx;
      }
    } else if (this.playMode === 'repeat_selected' && this.selectedTrackIds.size > 0) {
      // Find next track that is checked by user
      let nextIdx = (this.currentTrackIdx + 1) % this.playlist.length;
      let count = 0;
      while (!this.selectedTrackIds.has(this.playlist[nextIdx]?.id) && count < this.playlist.length) {
        nextIdx = (nextIdx + 1) % this.playlist.length;
        count++;
      }
      this.currentTrackIdx = nextIdx;
    } else if (this.playMode === 'repeat_custom') {
      // Find next custom uploaded track
      const hasCustom = this.playlist.some((t) => t.isCustom);
      if (hasCustom) {
        let nextIdx = (this.currentTrackIdx + 1) % this.playlist.length;
        let count = 0;
        while (!this.playlist[nextIdx]?.isCustom && count < this.playlist.length) {
          nextIdx = (nextIdx + 1) % this.playlist.length;
          count++;
        }
        this.currentTrackIdx = nextIdx;
      } else {
        this.currentTrackIdx = (this.currentTrackIdx + 1) % this.playlist.length;
      }
    } else {
      // Standard sequential loop
      this.currentTrackIdx = (this.currentTrackIdx + 1) % this.playlist.length;
    }

    this.noteIdx = 0;
    if (this.isPlaying) {
      this.play();
    } else {
      this.notify();
    }
  }

  public prevTrack() {
    this.stopCurrent();

    if (this.playMode === 'random') {
      if (this.playlist.length > 1) {
        let randomIdx = Math.floor(Math.random() * this.playlist.length);
        let attempts = 0;
        while (randomIdx === this.currentTrackIdx && attempts < 10) {
          randomIdx = Math.floor(Math.random() * this.playlist.length);
          attempts++;
        }
        this.currentTrackIdx = randomIdx;
      }
    } else if (this.playMode === 'repeat_selected' && this.selectedTrackIds.size > 0) {
      let prevIdx = (this.currentTrackIdx - 1 + this.playlist.length) % this.playlist.length;
      let count = 0;
      while (!this.selectedTrackIds.has(this.playlist[prevIdx]?.id) && count < this.playlist.length) {
        prevIdx = (prevIdx - 1 + this.playlist.length) % this.playlist.length;
        count++;
      }
      this.currentTrackIdx = prevIdx;
    } else if (this.playMode === 'repeat_custom') {
      const hasCustom = this.playlist.some((t) => t.isCustom);
      if (hasCustom) {
        let prevIdx = (this.currentTrackIdx - 1 + this.playlist.length) % this.playlist.length;
        let count = 0;
        while (!this.playlist[prevIdx]?.isCustom && count < this.playlist.length) {
          prevIdx = (prevIdx - 1 + this.playlist.length) % this.playlist.length;
          count++;
        }
        this.currentTrackIdx = prevIdx;
      } else {
        this.currentTrackIdx = (this.currentTrackIdx - 1 + this.playlist.length) % this.playlist.length;
      }
    } else {
      this.currentTrackIdx = (this.currentTrackIdx - 1 + this.playlist.length) % this.playlist.length;
    }

    this.noteIdx = 0;
    if (this.isPlaying) {
      this.play();
    } else {
      this.notify();
    }
  }

  /**
   * Instantly picks a random track from the playlist and starts playing it.
   */
  public playRandomTrack() {
    if (this.playlist.length === 0) return;
    this.stopCurrent();
    if (this.playlist.length > 1) {
      let randomIdx = Math.floor(Math.random() * this.playlist.length);
      let attempts = 0;
      while (randomIdx === this.currentTrackIdx && attempts < 10) {
        randomIdx = Math.floor(Math.random() * this.playlist.length);
        attempts++;
      }
      this.currentTrackIdx = randomIdx;
    } else {
      this.currentTrackIdx = 0;
    }
    this.noteIdx = 0;
    this.setPlayMode('random');
    this.play();
    this.notify();
  }

  /**
   * Completely stops all audio playback, rewinds progress, and resets state.
   */
  public stopAll() {
    this.isPlaying = false;
    this.stopCurrent();
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
    }
    this.noteIdx = 0;
    this.currentTime = 0;
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('app-audio-stop-all'));
    }
    this.notify();
  }

  // Upload user's custom audio file
  public async addCustomAudioTrack(file: File, customTitle?: string, customArtist?: string): Promise<BgmTrack> {
    const trackId = `custom_bgm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const cleanFileName = file.name.replace(/\.[^/.]+$/, '');
    const title = customTitle?.trim() || cleanFileName;
    const artist = customArtist?.trim() || '내 오디오 파일';

    // Normalize audio blob with valid audio MIME type (crucial for iPad / iOS WebKit)
    const normalizedBlob = getNormalizedAudioBlob(file, file.name);

    // Generate base64 dataUrl for reliable iPad Safari playback
    let dataUrl: string | undefined;
    try {
      dataUrl = await readFileAsDataUrl(normalizedBlob);
    } catch (e) {
      console.warn('Could not read file as dataUrl', e);
    }

    // Store in IndexedDB with normalized MIME and dataUrl
    try {
      await saveAudioTrackToDB(trackId, normalizedBlob, title, artist, file.name, dataUrl);
    } catch (e) {
      console.warn('Failed to save to IndexedDB', e);
    }

    const audioUrl = dataUrl || URL.createObjectURL(normalizedBlob);
    const newTrack: BgmTrack = {
      id: trackId,
      title,
      artist,
      fileName: file.name,
      type: 'audio_file',
      audioUrl,
      isCustom: true
    };

    // Auto-select the newly uploaded file for repeat_selected mode
    this.selectedTrackIds.add(trackId);
    this.saveSelectedTrackIds();

    // Add to top of playlist
    this.playlist = [newTrack, ...this.playlist];
    // Select and start playing
    this.stopCurrent();
    this.currentTrackIdx = 0;
    this.play();
    this.notify();

    return newTrack;
  }

  // Upload multiple custom audio files at once
  public async addCustomAudioTracks(
    items: { file: File; customTitle?: string; customArtist?: string }[],
    onProgress?: (completed: number, total: number) => void
  ): Promise<BgmTrack[]> {
    if (!items || items.length === 0) return [];
    const newTracks: BgmTrack[] = [];

    for (let i = 0; i < items.length; i++) {
      const { file, customTitle, customArtist } = items[i];
      const trackId = `custom_bgm_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 7)}`;
      const cleanFileName = file.name.replace(/\.[^/.]+$/, '');
      const title = customTitle?.trim() || cleanFileName;
      const artist = customArtist?.trim() || '내 오디오 파일';

      const normalizedBlob = getNormalizedAudioBlob(file, file.name);
      let dataUrl: string | undefined;
      try {
        dataUrl = await readFileAsDataUrl(normalizedBlob);
      } catch (e) {
        console.warn('Could not read file as dataUrl', e);
      }

      try {
        await saveAudioTrackToDB(trackId, normalizedBlob, title, artist, file.name, dataUrl);
      } catch (e) {
        console.warn('Failed to save to IndexedDB', e);
      }

      const audioUrl = dataUrl || URL.createObjectURL(normalizedBlob);
      const newTrack: BgmTrack = {
        id: trackId,
        title,
        artist,
        fileName: file.name,
        type: 'audio_file',
        audioUrl,
        isCustom: true
      };

      this.selectedTrackIds.add(trackId);
      newTracks.push(newTrack);

      if (onProgress) {
        onProgress(i + 1, items.length);
      }
    }

    this.saveSelectedTrackIds();

    // Add all new tracks to the top of the playlist
    this.playlist = [...newTracks, ...this.playlist];

    // Select and start playing the first new track
    this.stopCurrent();
    this.currentTrackIdx = 0;
    this.play();
    this.notify();

    return newTracks;
  }

  // Delete a custom audio track
  public async removeCustomAudioTrack(id: string) {
    try {
      await deleteAudioTrackFromDB(id);
    } catch (e) {
      console.warn('Failed to delete from IndexedDB', e);
    }

    this.selectedTrackIds.delete(id);
    this.saveSelectedTrackIds();

    const removingCurrent = this.playlist[this.currentTrackIdx]?.id === id;
    if (removingCurrent) {
      this.stopCurrent();
    }

    this.playlist = this.playlist.filter((t) => t.id !== id);
    if (this.currentTrackIdx >= this.playlist.length) {
      this.currentTrackIdx = 0;
    }

    if (removingCurrent && this.isPlaying) {
      this.play();
    } else {
      this.notify();
    }
  }

  private playTone(freq: number, duration: number) {
    if (!this.ctx || freq === 0 || this.volume <= 0.001) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const oscSub = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Warm music-box / EPiano timbre
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      oscSub.type = 'sine';
      oscSub.frequency.setValueAtTime(freq * 0.5, now);

      const targetGain = this.volume * 0.15;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(targetGain, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(targetGain * 0.4, now + duration * 0.6);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      oscSub.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      oscSub.start(now);
      osc.stop(now + duration);
      oscSub.stop(now + duration);
    } catch {
      // Audio node cleanup
    }
  }

  private scheduleNextNote = () => {
    if (!this.isPlaying) return;

    const track = this.getCurrentTrack();
    if (track.type !== 'synth' || !track.notes || track.notes.length === 0) return;

    const currentNote = track.notes[this.noteIdx];
    const freq = NOTE_FREQS[currentNote.note] || 0;
    const durSec = currentNote.dur;

    this.playTone(freq, durSec * 0.9);

    const isLastNote = this.noteIdx === track.notes.length - 1;
    if (isLastNote && this.playMode !== 'repeat_one') {
      // When finishing synth melody in non-repeat_one mode, schedule next track
      this.noteTimer = window.setTimeout(() => {
        this.nextTrack(false);
      }, durSec * 1000);
      return;
    }

    this.noteIdx = (this.noteIdx + 1) % track.notes.length;
    this.noteTimer = window.setTimeout(this.scheduleNextNote, durSec * 1000);
  };
}

export const bgmEngine = new BgmEngine();
export const BGM_PLAYLIST = bgmEngine.getPlaylist();

let sharedAudioContext: AudioContext | null = null;

/**
 * Lazily retrieves a shared AudioContext so we never exceed browser AudioContext limits
 * and maintain consistent audio permissions across clicks.
 */
export function getSharedAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!sharedAudioContext) {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtx) {
      sharedAudioContext = new AudioCtx();
    }
  }
  return sharedAudioContext;
}

/**
 * Synchronously resumes the shared AudioContext during a click user gesture
 */
export function unlockAudioContext(): void {
  const ctx = getSharedAudioContext();
  if (ctx && ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }
}

/**
 * High-fidelity Web Audio API acoustic synth player for CD albums.
 * Plays melodic acoustic instrument notes so sound is NEVER silent!
 */
export function playCdSynthMelody(
  title: string,
  onProgress?: (time: number, total: number) => void,
  onEnd?: () => void,
  initialVolume = 0.8
): { stop: () => void; setVolume: (vol: number) => void } {
  const ctx = getSharedAudioContext();
  if (!ctx) return { stop: () => {}, setVolume: () => {} };

  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }

  let notes: { note: string; dur: number }[] = [];
  const lower = title.toLowerCase();

  if (lower.includes('danny') || lower.includes('boy')) {
    // Londonderry Air (Danny Boy)
    notes = [
      { note: 'D4', dur: 0.5 }, { note: 'F#4', dur: 0.8 }, { note: 'E4', dur: 0.4 }, { note: 'D4', dur: 0.6 },
      { note: 'F#4', dur: 0.6 }, { note: 'A4', dur: 1.0 }, { note: 'B4', dur: 1.2 }, { note: 'A4', dur: 0.8 },
      { note: 'F#4', dur: 0.6 }, { note: 'D4', dur: 0.6 }, { note: 'E4', dur: 1.2 },
      { note: 'D4', dur: 0.5 }, { note: 'F#4', dur: 0.8 }, { note: 'E4', dur: 0.4 }, { note: 'D4', dur: 0.6 },
      { note: 'F#4', dur: 0.6 }, { note: 'A4', dur: 1.0 }, { note: 'B4', dur: 1.2 }, { note: 'A4', dur: 0.8 },
      { note: 'F#4', dur: 0.6 }, { note: 'E4', dur: 0.6 }, { note: 'D4', dur: 1.8 }
    ];
  } else if (lower.includes('vincent') || lower.includes('starry')) {
    // Starry Starry Night (Vincent)
    notes = [
      { note: 'G4', dur: 0.6 }, { note: 'B4', dur: 0.6 }, { note: 'D5', dur: 0.9 }, { note: 'E5', dur: 0.9 },
      { note: 'D5', dur: 0.6 }, { note: 'B4', dur: 0.9 }, { note: 'A4', dur: 0.6 }, { note: 'G4', dur: 1.2 },
      { note: 'A4', dur: 0.6 }, { note: 'B4', dur: 0.6 }, { note: 'A4', dur: 0.9 }, { note: 'G4', dur: 1.5 }
    ];
  } else if (lower.includes('pokarekare') || lower.includes('ana')) {
    // Pokarekare Ana (Hayley Westenra)
    notes = [
      { note: 'D4', dur: 0.6 }, { note: 'G4', dur: 0.9 }, { note: 'B4', dur: 0.9 }, { note: 'A4', dur: 0.6 },
      { note: 'G4', dur: 0.9 }, { note: 'E4', dur: 0.9 }, { note: 'D4', dur: 1.2 }, { note: 'G4', dur: 0.9 },
      { note: 'B4', dur: 0.9 }, { note: 'C5', dur: 0.6 }, { note: 'B4', dur: 0.9 }, { note: 'A4', dur: 1.5 }
    ];
  } else if (lower.includes('power') || lower.includes('blood') || lower.includes('amy')) {
    // Power In The Blood (Amy Grant)
    notes = [
      { note: 'G4', dur: 0.5 }, { note: 'G4', dur: 0.5 }, { note: 'B4', dur: 0.7 }, { note: 'D5', dur: 0.8 },
      { note: 'D5', dur: 0.5 }, { note: 'C5', dur: 0.5 }, { note: 'B4', dur: 0.8 }, { note: 'A4', dur: 0.8 },
      { note: 'B4', dur: 0.5 }, { note: 'C5', dur: 0.5 }, { note: 'B4', dur: 0.5 }, { note: 'A4', dur: 0.5 },
      { note: 'G4', dur: 1.5 }
    ];
  } else {
    // Universal acoustic melody
    notes = [
      { note: 'C4', dur: 0.6 }, { note: 'E4', dur: 0.6 }, { note: 'G4', dur: 0.9 }, { note: 'C5', dur: 0.9 },
      { note: 'B4', dur: 0.6 }, { note: 'A4', dur: 0.9 }, { note: 'G4', dur: 1.2 }, { note: 'F4', dur: 0.6 },
      { note: 'E4', dur: 0.9 }, { note: 'D4', dur: 0.9 }, { note: 'C4', dur: 1.8 }
    ];
  }

  let isStopped = false;
  let timer: any = null;
  let currentTime = 0;
  let currentVol = Math.max(0, Math.min(1, initialVolume));
  const totalDuration = notes.reduce((acc, n) => acc + n.dur, 0);

  const playNote = (idx: number) => {
    if (isStopped) return;
    if (idx >= notes.length) {
      onEnd?.();
      return;
    }
    const item = notes[idx];
    const freq = NOTE_FREQS[item.note] || 440;

    if (freq > 0) {
      try {
        const now = ctx.currentTime + 0.03;
        const osc = ctx.createOscillator();
        const oscSub = ctx.createOscillator();
        const gain = ctx.createGain();

        // Warm acoustic bell/guitar timbre
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        oscSub.type = 'sine';
        oscSub.frequency.setValueAtTime(freq * 0.5, now);

        const targetGain = 0.3 * currentVol;
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(targetGain, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + item.dur * 0.96);

        osc.connect(gain);
        oscSub.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        oscSub.start(now);
        osc.stop(now + item.dur);
        oscSub.stop(now + item.dur);
      } catch (e) {
        console.warn('Synth note error:', e);
      }
    }

    currentTime += item.dur;
    onProgress?.(currentTime, totalDuration);

    timer = setTimeout(() => {
      playNote(idx + 1);
    }, item.dur * 1000);
  };

  playNote(0);

  return {
    stop: () => {
      isStopped = true;
      if (timer) clearTimeout(timer);
    },
    setVolume: (vol: number) => {
      currentVol = Math.max(0, Math.min(1, vol));
    }
  };
}
