"use client";
/**
 * Web Audio engine — background music + SFX, fully synthesised (no files).
 * Browsers block audio until a user gesture, so call `unlock()` from the
 * first interaction. All nodes hang off a master gain for a single mute.
 */
type Ctx = AudioContext;

class AudioEngine {
  private ctx: Ctx | null = null;
  private master: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private muted = false;
  private musicOn = false;
  private step = 0;
  private timer: number | null = null;

  private ensure(): Ctx | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : 0.9;
      this.master.connect(this.ctx.destination);
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = 0.18;
      this.musicGain.connect(this.master);
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = 0.5;
      this.sfxGain.connect(this.master);
    }
    return this.ctx;
  }

  /** Call from a user gesture to satisfy autoplay policies. */
  unlock(): void {
    const ctx = this.ensure();
    if (ctx && ctx.state === "suspended") void ctx.resume();
  }

  setMuted(m: boolean): void {
    this.muted = m;
    const ctx = this.ensure();
    if (ctx && this.master) this.master.gain.setTargetAtTime(m ? 0 : 0.9, ctx.currentTime, 0.02);
  }

  private blip(freq: number, dur: number, type: OscillatorType, gain: number, when = 0, dest?: GainNode): void {
    const ctx = this.ensure();
    if (!ctx) return;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.value = freq;
    const t = ctx.currentTime + when;
    o.connect(g);
    g.connect(dest ?? this.sfxGain ?? this.master!);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.start(t);
    o.stop(t + dur + 0.02);
  }

  click(): void {
    this.blip(420, 0.06, "square", 0.18);
  }
  correct(): void {
    [523, 659, 784].forEach((f, i) => this.blip(f, 0.14, "triangle", 0.22, i * 0.07));
  }
  wrong(): void {
    this.blip(240, 0.16, "sawtooth", 0.14);
    this.blip(190, 0.18, "sawtooth", 0.12, 0.08);
  }
  coin(): void {
    this.blip(880, 0.07, "square", 0.18);
    this.blip(1320, 0.09, "square", 0.16, 0.05);
  }
  levelUp(): void {
    [392, 523, 659, 784, 1046].forEach((f, i) => this.blip(f, 0.16, "triangle", 0.22, i * 0.08));
  }
  victory(): void {
    [523, 659, 784, 1046, 1318].forEach((f, i) => this.blip(f, 0.2, "square", 0.2, i * 0.1));
  }

  /** Gentle looping background music (a soft chord arpeggio progression). */
  startMusic(): void {
    if (this.musicOn) return;
    const ctx = this.ensure();
    if (!ctx) return;
    this.musicOn = true;
    this.step = 0;
    // I–V–vi–IV style progression in C, kid-friendly and calm.
    const chords = [
      [261.63, 329.63, 392.0], // C
      [196.0, 246.94, 392.0], // G
      [220.0, 261.63, 329.63], // Am
      [174.61, 220.0, 349.23], // F
    ];
    const tick = () => {
      if (!this.musicOn || !this.ctx) return;
      const chord = chords[Math.floor(this.step / 4) % chords.length]!;
      const note = chord[this.step % 3]!;
      this.blip(note, 0.5, "sine", 0.5, 0, this.musicGain ?? undefined);
      if (this.step % 4 === 0) this.blip(chord[0]! / 2, 0.6, "triangle", 0.35, 0, this.musicGain ?? undefined);
      this.step++;
      this.timer = window.setTimeout(tick, 320);
    };
    tick();
  }

  stopMusic(): void {
    this.musicOn = false;
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}

export const audio = new AudioEngine();
