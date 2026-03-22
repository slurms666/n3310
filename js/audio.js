export class RetroAudio {
  constructor() {
    this.enabled = true;
    this.ctx = null;
  }

  ensureContext() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) this.ctx = new AudioContext();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  setEnabled(enabled) {
    this.enabled = enabled;
  }

  tone(freq = 440, duration = 0.08, type = 'square', volume = 0.04, glide = 0) {
    if (!this.enabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (glide) osc.frequency.linearRampToValueAtTime(freq + glide, now + duration);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  menuMove() { this.tone(420, 0.05, 'square', 0.03, 18); }
  menuSelect() { this.tone(680, 0.09, 'square', 0.04, -70); }
  back() { this.tone(240, 0.08, 'triangle', 0.035, -25); }
  good() { this.tone(820, 0.12, 'square', 0.05, 40); }
  bad() { this.tone(180, 0.18, 'sawtooth', 0.03, -40); }
  action() { this.tone(540, 0.05, 'square', 0.03, 60); }
}
