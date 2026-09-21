// FOOTBALL COLLECTION - Clean Sound Effects (SE) Engine
// BGM functionality has been completely removed per project specification.

class SoundEngine {
  private ctx: AudioContext | null = null;
  private seGain: GainNode | null = null;

  public bgmEnabled = false;
  public bgmVolume = 0;
  public seEnabled = true;
  public seVolume = 0.7;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.seGain = this.ctx.createGain();
      this.seGain.gain.setValueAtTime(this.seEnabled ? this.seVolume : 0, this.ctx.currentTime);
      this.seGain.connect(this.ctx.destination);
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  // Compatibility stubs
  public setBgmSettings(_enabled: boolean, _volume: number) {}
  public startBGM(_trackIdx?: number) {}
  public stopBGM() {}
  public toggleBgm(): boolean { return false; }
  public nextTrack() {}
  public prevTrack() {}
  public subscribeTrackChange(_cb: (track: any, isPlaying: boolean) => void) {
    return () => {};
  }
  public getCurrentTrack() {
    return { id: 'none', index: 0, trackNumber: 1, title: 'None', artist: '', filePath: '' };
  }
  public getCurrentTrackIndex() { return 0; }
  public getIsPlaying() { return false; }

  public setSeSettings(enabled: boolean, volume: number) {
    this.seEnabled = enabled;
    this.seVolume = Math.max(0, Math.min(1, volume));
    if (this.seGain && this.ctx) {
      this.seGain.gain.setValueAtTime(enabled ? this.seVolume : 0, this.ctx.currentTime);
    }
  }

  // --- Sound Effects (SE) ---

  public playButtonClick() {
    if (!this.seEnabled) return;
    try {
      this.initContext();
      if (!this.ctx || !this.seGain) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(750, now);
      osc.frequency.exponentialRampToValueAtTime(450, now + 0.04);
      gain.gain.setValueAtTime(0.2 * this.seVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
      osc.connect(gain);
      gain.connect(this.seGain);
      osc.start(now);
      osc.stop(now + 0.05);
    } catch {}
  }

  public playCardFlip() {
    if (!this.seEnabled) return;
    try {
      this.initContext();
      if (!this.ctx || !this.seGain) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(540, now + 0.08);
      gain.gain.setValueAtTime(0.25 * this.seVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
      osc.connect(gain);
      gain.connect(this.seGain);
      osc.start(now);
      osc.stop(now + 0.1);
    } catch {}
  }

  public playRarityChime(rarity: string) {
    if (!this.seEnabled) return;
    try {
      this.initContext();
      if (!this.ctx || !this.seGain) return;
      const now = this.ctx.currentTime;

      let freqs = [523.25, 659.25, 783.99]; // C5, E5, G5 (N)
      if (rarity === 'R') {
        freqs = [587.33, 739.99, 880, 1174.66]; // D5, F#5, A5, D6
      } else if (rarity === 'SR') {
        freqs = [659.25, 830.61, 987.77, 1318.51, 1661.22]; // E5 major
      } else if (rarity === 'SSR') {
        freqs = [783.99, 987.77, 1174.66, 1567.98, 1975.53, 2349.32]; // G5 shimmer
      }

      freqs.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = rarity === 'SSR' ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);

        gain.gain.setValueAtTime(0.18 * this.seVolume, now + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.35);

        osc.connect(gain);
        gain.connect(this.seGain!);
        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.38);
      });
    } catch {}
  }

  public playPackRip() {
    if (!this.seEnabled) return;
    try {
      this.initContext();
      if (!this.ctx || !this.seGain) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.linearRampToValueAtTime(700, now + 0.15);
      gain.gain.setValueAtTime(0.28 * this.seVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.connect(gain);
      gain.connect(this.seGain);
      osc.start(now);
      osc.stop(now + 0.2);
    } catch {}
  }

  public playTrainingSuccess() {
    if (!this.seEnabled) return;
    try {
      this.initContext();
      if (!this.ctx || !this.seGain) return;
      const now = this.ctx.currentTime;
      const notes = [440, 554.37, 659.25, 880];
      notes.forEach((f, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + i * 0.07);
        gain.gain.setValueAtTime(0.2 * this.seVolume, now + i * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.3);
        osc.connect(gain);
        gain.connect(this.seGain!);
        osc.start(now + i * 0.07);
        osc.stop(now + i * 0.07 + 0.35);
      });
    } catch {}
  }

  public playAwakening() {
    if (!this.seEnabled) return;
    try {
      this.initContext();
      if (!this.ctx || !this.seGain) return;
      const now = this.ctx.currentTime;
      const chord = [220, 440, 554.37, 659.25, 880, 1108.73];
      chord.forEach((f, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = i < 2 ? 'sawtooth' : 'sine';
        osc.frequency.setValueAtTime(f, now);
        osc.frequency.exponentialRampToValueAtTime(f * 1.05, now + 1.2);
        gain.gain.setValueAtTime(0.2 * this.seVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
        osc.connect(gain);
        gain.connect(this.seGain!);
        osc.start(now);
        osc.stop(now + 1.25);
      });
    } catch {}
  }

  public playTradeCompleted() {
    if (!this.seEnabled) return;
    try {
      this.initContext();
      if (!this.ctx || !this.seGain) return;
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((f, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now + i * 0.08);
        gain.gain.setValueAtTime(0.25 * this.seVolume, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.4);
        osc.connect(gain);
        gain.connect(this.seGain!);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.45);
      });
    } catch {}
  }

  public playCoinSound() {
    if (!this.seEnabled) return;
    try {
      this.initContext();
      if (!this.ctx || !this.seGain) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, now);
      osc.frequency.setValueAtTime(1318.51, now + 0.08);
      gain.gain.setValueAtTime(0.2 * this.seVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      gain.connect(this.seGain);
      osc.start(now);
      osc.stop(now + 0.28);
    } catch {}
  }

  public playSSRFanfare() {
    if (!this.seEnabled) return;
    this.playRarityChime('SSR');
  }

  public playSRGlow() {
    if (!this.seEnabled) return;
    this.playRarityChime('SR');
  }

  public playMarketSuccess() {
    if (!this.seEnabled) return;
    try {
      this.initContext();
      if (!this.ctx || !this.seGain) return;
      const now = this.ctx.currentTime;
      [440, 659.25, 880].forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);
        gain.gain.setValueAtTime(0.22 * this.seVolume, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.25);
        osc.connect(gain);
        gain.connect(this.seGain!);
        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.28);
      });
    } catch {}
  }

  public playMissionComplete() {
    if (!this.seEnabled) return;
    try {
      this.initContext();
      if (!this.ctx || !this.seGain) return;
      const now = this.ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);
        gain.gain.setValueAtTime(0.2 * this.seVolume, now + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.3);
        osc.connect(gain);
        gain.connect(this.seGain!);
        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.32);
      });
    } catch {}
  }

  public playCardAcquire() {
    if (!this.seEnabled) return;
    this.playPackRip();
  }
}

export const soundEngine = new SoundEngine();
