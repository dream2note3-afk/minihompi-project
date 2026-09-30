// Nostalgic Cyworld-era BGM Synthesizer using Web Audio API

export interface BgmTrack {
  id: string;
  title: string;
  artist: string;
  duration: number; // in seconds
  notes: { note: string; dur: number }[]; // Note frequency representation
}

// Frequency map for standard notes
const NOTE_FREQS: Record<string, number> = {
  'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63, 'F4': 349.23,
  'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88,
  'C5': 523.25, 'C#5': 554.37, 'D5': 587.33, 'D#5': 622.25, 'E5': 659.25, 'F5': 698.46,
  'F#5': 739.99, 'G5': 783.99, 'G#5': 830.61, 'A5': 880.00, 'A#5': 932.33, 'B5': 987.77,
  'C6': 1046.50, 'REST': 0
};

export const BGM_PLAYLIST: BgmTrack[] = [
  {
    id: 'freestyle_y',
    title: 'Y (Please Tell Me Why)',
    artist: '프리스타일 (Freestyle)',
    duration: 184,
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
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private volume: number = 0.5;
  private currentTrackIdx: number = 0;
  private noteTimer: number | null = null;
  private noteIdx: number = 0;
  private listeners: (() => void)[] = [];

  constructor() {
    // Lazy initialized on first user interaction
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
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

  public getCurrentTrack(): BgmTrack {
    return BGM_PLAYLIST[this.currentTrackIdx];
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

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    this.notify();
  }

  public togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  public play() {
    this.initCtx();
    this.isPlaying = true;
    this.scheduleNextNote();
    this.notify();
  }

  public pause() {
    this.isPlaying = false;
    if (this.noteTimer !== null) {
      window.clearTimeout(this.noteTimer);
      this.noteTimer = null;
    }
    this.notify();
  }

  public nextTrack() {
    this.currentTrackIdx = (this.currentTrackIdx + 1) % BGM_PLAYLIST.length;
    this.noteIdx = 0;
    if (this.isPlaying) {
      if (this.noteTimer !== null) window.clearTimeout(this.noteTimer);
      this.scheduleNextNote();
    }
    this.notify();
  }

  public prevTrack() {
    this.currentTrackIdx = (this.currentTrackIdx - 1 + BGM_PLAYLIST.length) % BGM_PLAYLIST.length;
    this.noteIdx = 0;
    if (this.isPlaying) {
      if (this.noteTimer !== null) window.clearTimeout(this.noteTimer);
      this.scheduleNextNote();
    }
    this.notify();
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
    const currentNote = track.notes[this.noteIdx];
    const freq = NOTE_FREQS[currentNote.note] || 0;
    const durSec = currentNote.dur;

    this.playTone(freq, durSec * 0.9);

    this.noteIdx = (this.noteIdx + 1) % track.notes.length;
    this.noteTimer = window.setTimeout(this.scheduleNextNote, durSec * 1000);
  };
}

export const bgmEngine = new BgmEngine();
