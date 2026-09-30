// Cyworld Retro BGM Audio Engine (Synth + User Custom Audio File Support)
import { saveAudioTrackToDB, getAllAudioTracksFromDB, deleteAudioTrackFromDB, StoredAudioTrack } from './audioStorage';

export type TrackSourceType = 'synth' | 'audio_file';

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

  constructor() {
    this.initAudioElement();
    this.loadPersistedTracks();
  }

  private initAudioElement() {
    if (typeof window === 'undefined') return;
    this.audioElement = new Audio();
    this.audioElement.volume = this.volume;

    this.audioElement.onended = () => {
      this.nextTrack();
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
        const customTracks: BgmTrack[] = stored.map((item: StoredAudioTrack) => ({
          id: item.id,
          title: item.title,
          artist: item.artist,
          fileName: item.fileName,
          type: 'audio_file',
          audioUrl: URL.createObjectURL(item.blob),
          isCustom: true
        }));

        // Put custom tracks in front of playlist
        this.playlist = [...customTracks, ...BUILTIN_BGM_PLAYLIST];
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

  public nextTrack() {
    this.stopCurrent();
    this.currentTrackIdx = (this.currentTrackIdx + 1) % this.playlist.length;
    this.noteIdx = 0;
    if (this.isPlaying) {
      this.play();
    } else {
      this.notify();
    }
  }

  public prevTrack() {
    this.stopCurrent();
    this.currentTrackIdx = (this.currentTrackIdx - 1 + this.playlist.length) % this.playlist.length;
    this.noteIdx = 0;
    if (this.isPlaying) {
      this.play();
    } else {
      this.notify();
    }
  }

  // Upload user's custom audio file
  public async addCustomAudioTrack(file: File, customTitle?: string, customArtist?: string): Promise<BgmTrack> {
    const trackId = `custom_bgm_${Date.now()}`;
    const cleanFileName = file.name.replace(/\.[^/.]+$/, '');
    const title = customTitle?.trim() || cleanFileName;
    const artist = customArtist?.trim() || '내 오디오 파일';

    // Store in IndexedDB
    try {
      await saveAudioTrackToDB(trackId, file, title, artist, file.name);
    } catch (e) {
      console.warn('Failed to save to IndexedDB', e);
    }

    const objectUrl = URL.createObjectURL(file);
    const newTrack: BgmTrack = {
      id: trackId,
      title,
      artist,
      fileName: file.name,
      type: 'audio_file',
      audioUrl: objectUrl,
      isCustom: true
    };

    // Add to top of playlist
    this.playlist = [newTrack, ...this.playlist];
    // Select and start playing
    this.stopCurrent();
    this.currentTrackIdx = 0;
    this.play();
    this.notify();

    return newTrack;
  }

  // Delete a custom audio track
  public async removeCustomAudioTrack(id: string) {
    try {
      await deleteAudioTrackFromDB(id);
    } catch (e) {
      console.warn('Failed to delete from IndexedDB', e);
    }

    const removingCurrent = this.playlist[this.currentTrackIdx]?.id === id;
    if (removingCurrent) {
      this.stopCurrent();
    }

    this.playlist = this.playlist.filter(t => t.id !== id);
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

    this.noteIdx = (this.noteIdx + 1) % track.notes.length;
    this.noteTimer = window.setTimeout(this.scheduleNextNote, durSec * 1000);
  };
}

export const bgmEngine = new BgmEngine();
export const BGM_PLAYLIST = bgmEngine.getPlaylist();
