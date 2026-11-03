/**
 * LUÂN HỒI ONLINE — REAL BUDDHIST AUDIO & WEB AUDIO HYBRID ENGINE
 * Prioritizes real recorded open-licensed Buddhist audio assets in `/assets/audio/`
 * (Heart Sutra chanting, Nepal Buddhist temple ambience, Buddham Saranam Gacchami chorus,
 * Japanese Rin altar bell, Tibetan Singing Bowls, Temple Gong, Koshi Wind Chimes,
 * Thunder, and Mõ Tụng Kinh percussion), with Web Audio API used for subtle spatial/VFX accents.
 */

import type { RealmId, MeritActivityId } from '../../shared/types';

export const AUDIO_ASSET_PATHS = {
  templeBell: '/assets/audio/temple_bell.ogg',
  singingBowlLong: '/assets/audio/singing_bowl_long.ogg',
  rinTempleChime: '/assets/audio/rin_temple_chime.ogg',
  buddhistTempleAmbience: '/assets/audio/buddhist_temple_ambience.ogg',
  heartSutraChant: '/assets/audio/heart_sutra_chant.ogg',
  buddhamSaranamChant: '/assets/audio/buddham_saranam_chant.ogg',
  templeGong: '/assets/audio/temple_gong.ogg',
  thunderTribulation: '/assets/audio/thunder_tribulation.ogg',
  templeWindChimes: '/assets/audio/temple_wind_chimes.ogg',
  woodenFishMo: '/assets/audio/wooden_fish_mo.wav',
  woodenFishClaves: '/assets/audio/wooden_fish_claves.ogg',
} as const;

export interface DharmaVerseCadence {
  step: number;
  progress: number;
  paliOrSanskrit: string;
  vietnamese: string;
  english: string;
  bowlFrequencyHz: number;
}

export const DHARMA_SESSION_VERSES: DharmaVerseCadence[] = [
  {
    step: 1,
    progress: 0.2,
    paliOrSanskrit: 'Gate gate pāragate pārasaṃgate bodhi svāhā',
    vietnamese: 'Yết đế, yết đế, ba la yết đế, ba la tăng yết đế, Bồ đề tát bà ha. (Bát Nhã Tâm Kinh)',
    english: 'Gone, gone, gone beyond, gone utterly beyond, Awakening, svaha!',
    bowlFrequencyHz: 256,
  },
  {
    step: 2,
    progress: 0.4,
    paliOrSanskrit: 'Sabbadānaṃ dhammadānaṃ jināti',
    vietnamese: 'Mọi thí trong đời, Pháp thí cao quý nhất.',
    english: 'The gift of Dharma excels all other gifts.',
    bowlFrequencyHz: 288,
  },
  {
    step: 3,
    progress: 0.6,
    paliOrSanskrit: 'Manopubbaṅgamā dhammā, manoseṭṭhā manomayā',
    vietnamese: 'Tâm dẫn đầu các pháp, tâm làm chủ, tâm tạo tác.',
    english: 'Mind precedes all phenomena; mind is their chief, mind-made are they.',
    bowlFrequencyHz: 320,
  },
  {
    step: 4,
    progress: 0.8,
    paliOrSanskrit: 'Na hi verena verāni, sammanti’dha kudācanaṃ',
    vietnamese: 'Hận thù diệt hận thù, đời này không thể có; Từ bi diệt hận thù, là định luật ngàn thu.',
    english: 'Hatred never ceases by hatred in this world; through loving-kindness alone does it cease.',
    bowlFrequencyHz: 384,
  },
  {
    step: 5,
    progress: 1.0,
    paliOrSanskrit: 'Sabbe sattā bhavantu sukhitattā',
    vietnamese: 'Nguyện đem công đức này, hướng về khắp tất cả, đệ tử và chúng sinh, đều trọn thành Phật đạo.',
    english: 'May all sentient beings be peaceful, happy, and attain liberation.',
    bowlFrequencyHz: 432,
  },
];

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private ambienceGain: GainNode | null = null;
  private activeAmbienceNodes: AudioNode[] = [];
  private activeAmbienceAudioElements: HTMLAudioElement[] = [];
  private activeDharmaAudio: HTMLAudioElement | null = null;
  private sfxTemplateCache: Map<string, HTMLAudioElement> = new Map();

  private ambienceTimer: ReturnType<typeof setInterval> | null = null;
  private dharmaSessionTimer: ReturnType<typeof setInterval> | null = null;

  private muted: boolean = false;
  private volume: number = 0.75;
  private currentRealm: RealmId | null = null;
  private currentHellLevel: number = 0;

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;

      try {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = this.muted ? 0 : this.volume;
        this.masterGain.connect(this.ctx.destination);

        this.ambienceGain = this.ctx.createGain();
        this.ambienceGain.gain.value = 0.22;
        this.ambienceGain.connect(this.masterGain);
      } catch {
        return null;
      }
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {
        // Will resume on next user gesture
      });
    }

    return this.ctx;
  }

  /**
   * Plays a real recorded audio file from `/assets/audio/...` with polyphonic cloning,
   * pitch/playbackRate control, and automatic fallback if blocked by browser policy.
   */
  private playSampleFile(
    url: string,
    options: { volumeScale?: number; playbackRate?: number; maxDurationMs?: number } = {}
  ): HTMLAudioElement | null {
    if (this.muted || typeof window === 'undefined' || typeof Audio === 'undefined') {
      return null;
    }

    try {
      let baseAudio = this.sfxTemplateCache.get(url);
      if (!baseAudio) {
        baseAudio = new Audio(url);
        baseAudio.preload = 'auto';
        this.sfxTemplateCache.set(url, baseAudio);
      }

      const instance = baseAudio.cloneNode(true) as HTMLAudioElement;
      const vol = Math.max(0, Math.min(1, this.volume * (options.volumeScale ?? 0.85)));
      instance.volume = vol;

      if (options.playbackRate && options.playbackRate !== 1.0) {
        instance.preservesPitch = false;
        instance.playbackRate = options.playbackRate;
      }

      const playPromise = instance.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {
          // Ignore autoplay restriction errors in headless/uninteracted tabs
        });
      }

      if (options.maxDurationMs && options.maxDurationMs > 0) {
        setTimeout(() => {
          try {
            instance.pause();
            instance.currentTime = 0;
          } catch {
            // Ignore cleanup error
          }
        }, options.maxDurationMs);
      }

      return instance;
    } catch {
      return null;
    }
  }

  /**
   * Đại Hồng Chung / Chuông Gia Trì — Plays real recorded Buddhist Singing Bowl & Japanese Rin Bell
   * (`/assets/audio/temple_bell.ogg` & `/assets/audio/rin_temple_chime.ogg`) with subtle sub-bass warmth.
   */
  public playBellChime(fundamentalHz: number = 174): void {
    if (this.muted) return;

    const rate = Math.max(0.75, Math.min(1.35, fundamentalHz / 174));
    this.playSampleFile(AUDIO_ASSET_PATHS.templeBell, {
      volumeScale: 0.9,
      playbackRate: rate,
    });
    this.playSampleFile(AUDIO_ASSET_PATHS.rinTempleChime, {
      volumeScale: 0.55,
      playbackRate: rate,
      maxDurationMs: 4500,
    });

    // Subtle low-end acoustic body effect
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) return;
    const now = ctx.currentTime;
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(fundamentalHz * 0.5, now);
    subGain.gain.setValueAtTime(0.001, now);
    subGain.gain.linearRampToValueAtTime(0.14, now + 0.02);
    subGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.8);
    subOsc.connect(subGain);
    subGain.connect(this.masterGain);
    subOsc.start(now);
    subOsc.stop(now + 2.85);
  }

  /**
   * Mõ Tụng Kinh — Plays real `/assets/audio/wooden_fish_mo.wav` hollow temple woodblock strike
   */
  public playWoodenFish(pitchMultiplier: number = 1.0): void {
    if (this.muted) return;

    // Slight natural human variation in pitch (0.97..1.03) so rapid bead tapping sounds organic
    const jitter = 0.98 + Math.random() * 0.04;
    this.playSampleFile(AUDIO_ASSET_PATHS.woodenFishMo, {
      volumeScale: 0.92,
      playbackRate: pitchMultiplier * jitter,
    });
  }

  /**
   * Công Đức Chime — Plays real Japanese Rin temple bell (`/assets/audio/rin_temple_chime.ogg`)
   * layered with a gentle ascending pentatonic lotus sparkle effect.
   */
  public playMeritChime(): void {
    if (this.muted) return;

    this.playSampleFile(AUDIO_ASSET_PATHS.rinTempleChime, {
      volumeScale: 0.78,
      playbackRate: 1.05,
      maxDurationMs: 3600,
    });

    // Soft pentatonic sparkle effect
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) return;
    const now = ctx.currentTime;
    const pentatonicHz = [523.25, 659.25, 783.99, 1046.5];
    pentatonicHz.forEach((freq, idx) => {
      const start = now + idx * 0.07;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.linearRampToValueAtTime(0.08, start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.65);
      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(start);
      osc.stop(start + 0.7);
    });
  }

  /**
   * Nghiệp Lực / Độ Kiếp Lôi Đình — Plays real recorded Thunderclap (`/assets/audio/thunder_tribulation.ogg`)
   * and real Chinese Bronze Temple Gong (`/assets/audio/temple_gong.ogg`).
   */
  public playKarmaThunder(): void {
    if (this.muted) return;

    this.playSampleFile(AUDIO_ASSET_PATHS.thunderTribulation, {
      volumeScale: 0.95,
      playbackRate: 0.95,
    });
    this.playSampleFile(AUDIO_ASSET_PATHS.templeGong, {
      volumeScale: 0.85,
      playbackRate: 0.78,
    });
  }

  /**
   * Độ Kiếp Phi Thăng — Plays real Tibetan Singing Bowl (`/assets/audio/singing_bowl_long.ogg`),
   * Koshi Wind Chimes (`/assets/audio/temple_wind_chimes.ogg`), and Buddham Saranam Chorus excerpt.
   */
  public playAscensionChoir(): void {
    if (this.muted) return;

    this.playSampleFile(AUDIO_ASSET_PATHS.singingBowlLong, {
      volumeScale: 0.85,
      playbackRate: 1.0,
      maxDurationMs: 6000,
    });
    this.playSampleFile(AUDIO_ASSET_PATHS.templeWindChimes, {
      volumeScale: 0.7,
      playbackRate: 1.0,
      maxDurationMs: 5500,
    });
    this.playSampleFile(AUDIO_ASSET_PATHS.buddhamSaranamChant, {
      volumeScale: 0.65,
      maxDurationMs: 6500,
    });
  }

  /**
   * Nghe Giảng Pháp / Tụng Bát Nhã Tâm Kinh — Plays the real recorded Heart Sutra recitation
   * (`/assets/audio/heart_sutra_chant.ogg`) and Tibetan Singing Bowl (`/assets/audio/singing_bowl_long.ogg`)
   * while stepping through the 5 Dharma contemplation verses.
   */
  public playDharmaVoiceSession(
    onProgress?: (progress: number, verse?: DharmaVerseCadence) => void,
    onComplete?: () => void,
    stepDurationMs: number = 1400
  ): () => void {
    this.stopDharmaVoiceSession();

    // Start real Heart Sutra chanting audio if unmuted
    if (!this.muted && typeof window !== 'undefined' && typeof Audio !== 'undefined') {
      try {
        const chant = new Audio(AUDIO_ASSET_PATHS.heartSutraChant);
        chant.volume = Math.max(0, Math.min(1, this.volume * 0.85));
        const p = chant.play();
        if (p && typeof p.catch === 'function') {
          p.catch(() => {});
        }
        this.activeDharmaAudio = chant;
      } catch {
        this.activeDharmaAudio = null;
      }
    }

    let currentIndex = 0;
    const totalSteps = DHARMA_SESSION_VERSES.length;

    const triggerStep = () => {
      if (currentIndex >= totalSteps) {
        this.playSampleFile(AUDIO_ASSET_PATHS.templeBell, { volumeScale: 0.75 });
        this.stopDharmaVoiceSession();
        if (onComplete) onComplete();
        return;
      }

      const verse = DHARMA_SESSION_VERSES[currentIndex];
      // Ring real Tibetan singing bowl softly on each verse transition
      this.playSampleFile(AUDIO_ASSET_PATHS.singingBowlLong, {
        volumeScale: 0.45,
        playbackRate: verse.bowlFrequencyHz / 288,
        maxDurationMs: 2500,
      });

      if (onProgress) {
        onProgress(verse.progress, verse);
      }
      currentIndex++;
    };

    triggerStep();

    this.dharmaSessionTimer = setInterval(() => {
      triggerStep();
    }, stepDurationMs);

    return () => this.stopDharmaVoiceSession();
  }

  public stopDharmaVoiceSession(): void {
    if (this.dharmaSessionTimer) {
      clearInterval(this.dharmaSessionTimer);
      this.dharmaSessionTimer = null;
    }
    if (this.activeDharmaAudio) {
      try {
        this.activeDharmaAudio.pause();
        this.activeDharmaAudio.currentTime = 0;
      } catch {
        // Ignore
      }
      this.activeDharmaAudio = null;
    }
  }

  /**
   * Maps any MeritActivityId to its signature authentic Buddhist recording.
   */
  public playActivitySound(activityId: MeritActivityId | string): void {
    switch (activityId) {
      case 'bow_buddha':
      case 'prostration_108':
        this.playBellChime(174);
        break;
      case 'prayer_beads':
      case 'clean_temple':
        this.playWoodenFish(1.0);
        break;
      case 'read_scripture':
        this.playWoodenFish(0.95);
        this.playSampleFile(AUDIO_ASSET_PATHS.heartSutraChant, {
          volumeScale: 0.65,
          maxDurationMs: 4200,
        });
        break;
      case 'offer_incense':
      case 'offer_lotus':
      case 'offer_lantern':
      case 'help_npc':
        this.playMeritChime();
        break;
      case 'meditate_session':
      case 'group_meditation':
        this.playSampleFile(AUDIO_ASSET_PATHS.singingBowlLong, {
          volumeScale: 0.8,
          maxDurationMs: 5500,
        });
        break;
      case 'listen_dharma':
        this.playSampleFile(AUDIO_ASSET_PATHS.heartSutraChant, {
          volumeScale: 0.8,
          maxDurationMs: 6000,
        });
        break;
      default:
        this.playMeritChime();
        break;
    }
  }

  public playUiClick(): void {
    this.playWoodenFish(1.35);
  }

  /**
   * Sets continuous realm ambience using real recorded audio loops in `/assets/audio/`:
   * - `human` (Phàm Giới): Real Nepal Buddhist Temple Prayer Ambience + Koshi Wind Chimes
   * - `celestial` (Thiên Đình): Real Buddham Saranam Gacchami Chorus + Koshi Wind Chimes
   * - `underworld` (Âm Phủ): Deep pitched Temple Gong + Distant Thunder + Karmic Drone
   */
  public setRealmAmbience(realm: RealmId, hellLevel: number = 1): void {
    if (this.currentRealm === realm && (realm !== 'underworld' || this.currentHellLevel === hellLevel)) {
      return;
    }
    this.currentRealm = realm;
    this.currentHellLevel = hellLevel;

    this.stopAmbience();
    if (this.muted) return;

    if (realm === 'human') {
      this.startLoopingAudio(AUDIO_ASSET_PATHS.buddhistTempleAmbience, 0.38);
      this.startLoopingAudio(AUDIO_ASSET_PATHS.templeWindChimes, 0.22);
    } else if (realm === 'celestial') {
      this.startLoopingAudio(AUDIO_ASSET_PATHS.buddhamSaranamChant, 0.35);
      this.startLoopingAudio(AUDIO_ASSET_PATHS.templeWindChimes, 0.28);
    } else if (realm === 'underworld') {
      this.playSampleFile(AUDIO_ASSET_PATHS.templeGong, {
        volumeScale: 0.55,
        playbackRate: 0.65,
      });

      const ctx = this.ensureContext();
      if (ctx && this.ambienceGain) {
        const levelShift = Math.max(1, Math.min(18, hellLevel));
        const baseHz = Math.max(38, 76 - levelShift * 2.0);
        this.createDroneOscillator(baseHz, 'sawtooth', 0.1, ctx.currentTime, 160);
      }

      this.ambienceTimer = setInterval(() => {
        if (this.muted || this.currentRealm !== 'underworld') return;
        this.playSampleFile(AUDIO_ASSET_PATHS.templeGong, {
          volumeScale: 0.32,
          playbackRate: 0.62,
        });
      }, 9500);
    }
  }

  private startLoopingAudio(url: string, relativeVolume: number): void {
    if (typeof window === 'undefined' || typeof Audio === 'undefined') return;
    try {
      const audio = new Audio(url);
      audio.loop = true;
      audio.volume = Math.max(0, Math.min(1, this.volume * relativeVolume));
      audio.dataset.relativeVolume = String(relativeVolume);
      const p = audio.play();
      if (p && typeof p.catch === 'function') {
        p.catch(() => {});
      }
      this.activeAmbienceAudioElements.push(audio);
    } catch {
      // Ignore in non-browser environment
    }
  }

  private createDroneOscillator(
    freqHz: number,
    type: OscillatorType,
    gainVal: number,
    now: number,
    lowpassHz: number = 600
  ): void {
    if (!this.ctx || !this.ambienceGain) return;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freqHz, now);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(lowpassHz, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(gainVal, now + 1.2);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ambienceGain);
    osc.start(now);

    this.activeAmbienceNodes.push(osc, filter, gain);
  }

  public stopAmbience(): void {
    if (this.ambienceTimer) {
      clearInterval(this.ambienceTimer);
      this.ambienceTimer = null;
    }
    for (const el of this.activeAmbienceAudioElements) {
      try {
        el.pause();
        el.currentTime = 0;
      } catch {
        // Ignore
      }
    }
    this.activeAmbienceAudioElements = [];

    for (const node of this.activeAmbienceNodes) {
      try {
        if ('stop' in node && typeof (node as OscillatorNode).stop === 'function') {
          (node as OscillatorNode).stop();
        }
        node.disconnect();
      } catch {
        // Ignore
      }
    }
    this.activeAmbienceNodes = [];
  }

  public toggleMute(): boolean {
    this.muted = !this.muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.muted ? 0 : this.volume, this.ctx.currentTime);
    }
    if (this.muted) {
      this.stopAmbience();
      if (this.activeDharmaAudio) {
        try {
          this.activeDharmaAudio.pause();
        } catch {
          // Ignore
        }
      }
    } else if (this.currentRealm) {
      const realm = this.currentRealm;
      const level = this.currentHellLevel;
      this.currentRealm = null;
      this.setRealmAmbience(realm, level);
    }
    return this.muted;
  }

  public setVolume(v: number): void {
    this.volume = Math.max(0, Math.min(1, v));
    if (this.masterGain && this.ctx && !this.muted) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
    for (const el of this.activeAmbienceAudioElements) {
      const rel = parseFloat(el.dataset.relativeVolume || '0.35');
      el.volume = Math.max(0, Math.min(1, this.volume * rel));
    }
    if (this.activeDharmaAudio) {
      this.activeDharmaAudio.volume = Math.max(0, Math.min(1, this.volume * 0.85));
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public isMuted(): boolean {
    return this.muted;
  }
}

export const soundEngine = new SoundEngine();
export default soundEngine;
