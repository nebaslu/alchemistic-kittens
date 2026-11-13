import Phaser from 'phaser';
import { getConfig } from './config';

export type SfxName =
  | 'pickup'
  | 'drop'
  | 'process'
  | 'bubble'
  | 'ready'
  | 'deliver'
  | 'fail'
  | 'explode'
  | 'clean';

const MUSIC_KEY = 'ak-vol-music';
const SFX_KEY = 'ak-vol-sfx';

export class Fx {
  private static audio: AudioContext | null = null;
  private static sfxGain: GainNode | null = null;
  private static musicGain: GainNode | null = null;
  private static musicTimer: number | null = null;
  private static musicStep = 0;
  static readonly reducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  static volumes(): { music: number; sfx: number } {
    const cfg = getConfig().audio;
    const music = Number(localStorage.getItem(MUSIC_KEY) ?? cfg.musicVolume);
    const sfx = Number(localStorage.getItem(SFX_KEY) ?? cfg.sfxVolume);
    return {
      music: Number.isFinite(music) ? music : cfg.musicVolume,
      sfx: Number.isFinite(sfx) ? sfx : cfg.sfxVolume,
    };
  }

  static setMusicVolume(v: number): void {
    localStorage.setItem(MUSIC_KEY, String(v));
    if (Fx.musicGain && Fx.audio) {
      Fx.musicGain.gain.setTargetAtTime(v, Fx.audio.currentTime, 0.05);
    }
  }

  static setSfxVolume(v: number): void {
    localStorage.setItem(SFX_KEY, String(v));
    if (Fx.sfxGain && Fx.audio) {
      Fx.sfxGain.gain.setTargetAtTime(v, Fx.audio.currentTime, 0.05);
    }
  }

  static initAudio(): void {
    if (!Fx.audio) {
      try {
        Fx.audio = new AudioContext();
      } catch {
        Fx.audio = null;
        return;
      }
      Fx.sfxGain = Fx.audio.createGain();
      Fx.sfxGain.connect(Fx.audio.destination);
      Fx.musicGain = Fx.audio.createGain();
      Fx.musicGain.connect(Fx.audio.destination);
      const vols = Fx.volumes();
      Fx.sfxGain.gain.value = vols.sfx;
      Fx.musicGain.gain.value = vols.music;
    }
    if (Fx.audio.state === 'suspended') {
      void Fx.audio.resume();
    }
  }

  static startMusic(): void {
    Fx.initAudio();
    if (!Fx.audio || Fx.musicTimer !== null) return;
    const pattern = [220, 261.63, 329.63, 261.63, 196, 246.94, 293.66, 246.94];
    Fx.musicTimer = window.setInterval(() => {
      const ctx = Fx.audio;
      const gain = Fx.musicGain;
      if (!ctx || !gain) return;
      const t = ctx.currentTime + 0.05;
      const freq = pattern[Fx.musicStep % pattern.length];
      Fx.musicStep++;
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.12, t + 0.05);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.42);
      osc.connect(g);
      g.connect(gain);
      osc.start(t);
      osc.stop(t + 0.45);
      if (Fx.musicStep % 8 === 0) {
        const bass = ctx.createOscillator();
        bass.type = 'sine';
        bass.frequency.value = freq / 2;
        const bg = ctx.createGain();
        bg.gain.setValueAtTime(0.0001, t);
        bg.gain.exponentialRampToValueAtTime(0.1, t + 0.1);
        bg.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);
        bass.connect(bg);
        bg.connect(gain);
        bass.start(t);
        bass.stop(t + 1.7);
      }
    }, 420);
  }

  static stopMusic(): void {
    if (Fx.musicTimer !== null) {
      window.clearInterval(Fx.musicTimer);
      Fx.musicTimer = null;
    }
  }

  private static tone(
    freq: number,
    dur: number,
    type: OscillatorType = 'square',
    vol = 0.07,
    when = 0,
    slideTo?: number,
  ): void {
    const ctx = Fx.audio;
    if (!ctx || !Fx.sfxGain) return;
    const t = ctx.currentTime + when;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slideTo !== undefined) {
      osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    }
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(gain);
    gain.connect(Fx.sfxGain);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  private static noise(dur: number, vol = 0.22, when = 0): void {
    const ctx = Fx.audio;
    if (!ctx || !Fx.sfxGain) return;
    const t = ctx.currentTime + when;
    const len = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 750;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(Fx.sfxGain);
    src.start(t);
  }

  static sfx(name: SfxName): void {
    switch (name) {
      case 'pickup':
        Fx.tone(520, 0.06, 'square', 0.05);
        Fx.tone(780, 0.05, 'square', 0.05, 0.05);
        break;
      case 'drop':
        Fx.tone(300, 0.08, 'triangle', 0.08);
        break;
      case 'process':
        Fx.tone(200, 0.08, 'sawtooth', 0.045);
        Fx.tone(260, 0.08, 'sawtooth', 0.045, 0.08);
        break;
      case 'bubble':
        Fx.tone(180 + Math.random() * 140, 0.09, 'sine', 0.045, 0, 430);
        break;
      case 'ready':
        Fx.tone(660, 0.08, 'triangle', 0.07);
        Fx.tone(880, 0.08, 'triangle', 0.07, 0.08);
        Fx.tone(1320, 0.12, 'triangle', 0.07, 0.16);
        break;
      case 'deliver':
        [523, 659, 784, 1047].forEach((f, i) => Fx.tone(f, 0.1, 'square', 0.055, i * 0.07));
        break;
      case 'fail':
        Fx.tone(220, 0.25, 'sawtooth', 0.08, 0, 110);
        break;
      case 'explode':
        Fx.noise(0.5, 0.25);
        Fx.tone(90, 0.5, 'sawtooth', 0.15, 0, 40);
        break;
      case 'clean':
        Fx.tone(400, 0.15, 'sine', 0.06, 0, 900);
        Fx.tone(900, 0.2, 'sine', 0.05, 0.12, 1400);
        break;
    }
  }

  static shake(scene: Phaser.Scene): void {
    if (Fx.reducedMotion) return;
    scene.cameras.main.shake(250, 0.012);
  }

  static burst(
    scene: Phaser.Scene,
    x: number,
    y: number,
    color: number,
    count = 24,
  ): void {
    for (let i = 0; i < count; i++) {
      const p = scene.add
        .graphics()
        .fillStyle(color, 1)
        .fillRect(-2, -2, 4, 4)
        .setDepth(50);
      const angle = Math.random() * Math.PI * 2;
      const speed = 80 + Math.random() * 160;
      scene.tweens.add({
        targets: p,
        x: x + Math.cos(angle) * speed,
        y: y + Math.sin(angle) * speed - 40,
        alpha: 0,
        duration: 500 + Math.random() * 300,
        onComplete: () => p.destroy(),
      });
    }
  }

  static floatingText(
    scene: Phaser.Scene,
    x: number,
    y: number,
    text: string,
    color = '#ffd75e',
  ): void {
    const t = scene.add
      .text(x, y, text, {
        fontFamily: 'monospace',
        fontSize: '17px',
        color,
        stroke: '#000000',
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setDepth(60);
    scene.tweens.add({
      targets: t,
      y: y - 46,
      alpha: 0,
      duration: 1100,
      ease: 'Cubic.easeOut',
      onComplete: () => t.destroy(),
    });
  }
}
