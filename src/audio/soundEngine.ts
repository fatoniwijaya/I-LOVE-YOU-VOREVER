// Retro 8-bit Web Audio API Synthesizer
// Zero external audio files required, strictly procedural 8-bit / chiptune synthesis

class SoundEngine {
  private ctx: AudioContext | null = null;
  private enabled: boolean = false;
  private lastFootstepTime: number = 0;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setEnabled(enable: boolean) {
    this.enabled = enable;
    if (enable) {
      this.initContext();
    }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  // Soft high-frequency step tick
  public playFootstep() {
    if (!this.enabled) return;
    const now = performance.now();
    if (now - this.lastFootstepTime < 180) return; // rate limit footsteps
    this.lastFootstepTime = now;

    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, this.ctx.currentTime);
      filter.Q.setValueAtTime(3, this.ctx.currentTime);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    } catch {
      // Audio error ignored
    }
  }

  // Gentle encounter chime
  public playMeeting() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    notes.forEach((freq, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = this.ctx.currentTime + i * 0.08;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.3);
    });
  }

  // Warm hug chord
  public playHug() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const chord = [349.23, 440.0, 523.25, 659.25]; // F4, A4, C5, E5 (Fmaj7)
    chord.forEach((freq) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = this.ctx.currentTime;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.05, t);
      gain.gain.linearRampToValueAtTime(0.08, t + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.8);
    });
  }

  // Sparkling stardust transformation arpeggio
  public playSparkle() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [1046.5, 1318.5, 1567.98, 2093.0, 2637.0];
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = this.ctx.currentTime + idx * 0.06;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.06, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.18);
    });
  }

  // Heart emergence crystal sweep
  public playHeartAppear() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const t = this.ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.exponentialRampToValueAtTime(880, t + 0.25);

    gain.gain.setValueAtTime(0.1, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.4);
  }

  // Gentle lub-dub heartbeat
  public playHeartbeat() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    // Lub (lower)
    const t = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(65, t);
    osc1.frequency.exponentialRampToValueAtTime(45, t + 0.1);
    gain1.gain.setValueAtTime(0.12, t);
    gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    osc1.connect(gain1);
    gain1.connect(this.ctx.destination);
    osc1.start(t);
    osc1.stop(t + 0.12);

    // Dub (slightly higher, short pause)
    const t2 = t + 0.16;
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(80, t2);
    osc2.frequency.exponentialRampToValueAtTime(50, t2 + 0.12);
    gain2.gain.setValueAtTime(0.14, t2);
    gain2.gain.exponentialRampToValueAtTime(0.001, t2 + 0.14);
    osc2.connect(gain2);
    gain2.connect(this.ctx.destination);
    osc2.start(t2);
    osc2.stop(t2 + 0.14);
  }

  // "I LOVE YOU" Romantic 8-bit fanfare
  public playRevealFanfare() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    // Romantic melodic sequence: C5 - E5 - G5 - C6 - B5 - A5 - G5
    const melody = [
      { f: 523.25, d: 0.14 },
      { f: 659.25, d: 0.14 },
      { f: 783.99, d: 0.14 },
      { f: 1046.5, d: 0.32 },
      { f: 987.77, d: 0.2 },
      { f: 880.0, d: 0.25 },
      { f: 783.99, d: 0.6 },
    ];

    let offset = 0;
    melody.forEach((note) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = this.ctx.currentTime + offset;

      osc.type = 'square';
      osc.frequency.setValueAtTime(note.f, t);

      // Low pass to soften square wave
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1800, t);

      gain.gain.setValueAtTime(0.06, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + note.d);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + note.d);

      offset += note.d * 0.95;
    });
  }
}

export const soundEngine = new SoundEngine();
