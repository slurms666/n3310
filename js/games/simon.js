import { LCD, clear, panel, text, randInt, makeBaseGame } from '../game-utils.js';

export default makeBaseGame({
  id: 'pattern-call',
  title: 'Pattern Call',
  help: 'Watch the pattern, then repeat it with arrow keys.',
  controls: ['Arrow keys = repeat pattern', 'Enter = start', 'Esc = quit'],
  create() {
    this.sequence = [];
    this.inputIndex = 0;
    this.flashIndex = -1;
    this.flashTimer = 0;
    this.phase = 'idle';
    this.level = 0;
  },
  extend() {
    this.sequence.push(randInt(0, 3));
    this.inputIndex = 0;
    this.phase = 'show';
    this.flashIndex = -1;
    this.flashTimer = 0.4;
    this.level = this.sequence.length;
  },
  onKeyDown(key) {
    if (this.state === 'ready' && key === 'Enter') {
      this.state = 'play';
      this.extend();
      return true;
    }
    if (this.phase !== 'input') return false;
    const map = { ArrowUp: 0, ArrowRight: 1, ArrowDown: 2, ArrowLeft: 3 };
    if (!(key in map)) return false;
    const value = map[key];
    this.flashIndex = value;
    this.flashTimer = 0.18;
    if (value === this.sequence[this.inputIndex]) {
      this.inputIndex += 1;
      this.app.audio.good();
      if (this.inputIndex >= this.sequence.length) this.extend();
    } else {
      this.state = 'over';
      this.app.audio.bad();
    }
    return true;
  },
  update(dt) {
    if (this.state !== 'play') {
      if (this.flashTimer > 0) this.flashTimer -= dt;
      return;
    }
    if (this.flashTimer > 0) {
      this.flashTimer -= dt;
      if (this.flashTimer <= 0 && this.phase === 'show') {
        this.flashIndex += 1;
        if (this.flashIndex >= this.sequence.length) {
          this.phase = 'input';
          this.flashIndex = -1;
        } else {
          this.currentFlash = this.sequence[this.flashIndex];
          this.flashTimer = 0.42;
          this.app.audio.action();
        }
      }
    } else if (this.phase === 'show') {
      this.flashTimer = 0.25;
    }
  },
  drawPad(ctx, x, y, w, h, active) {
    ctx.fillStyle = active ? LCD.dark : LCD.mid;
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = LCD.dark;
    ctx.strokeRect(x, y, w, h);
  },
  draw(ctx) {
    clear(ctx, this.width, this.height);
    panel(ctx, 42, 22, 236, 196, 'Pattern Call');
    const active = this.phase === 'show' ? this.currentFlash : this.flashTimer > 0 ? this.flashIndex : -1;
    this.drawPad(ctx, 90, 62, 50, 38, active === 0);
    this.drawPad(ctx, 180, 95, 50, 38, active === 1);
    this.drawPad(ctx, 90, 128, 50, 38, active === 2);
    this.drawPad(ctx, 30, 95, 50, 38, active === 3);
    text(ctx, this.state === 'ready' ? 'Enter to Start' : this.phase === 'input' ? 'Repeat the pattern' : 'Watch closely', 160, 188, 12, 'center');
    if (this.state === 'over') text(ctx, 'Wrong step - R to Restart', 160, 206, 12, 'center');
  },
  hud() { return [`Level ${this.level}`, this.phase === 'input' ? `Step ${this.inputIndex + 1}` : 'Watch']; }
});
