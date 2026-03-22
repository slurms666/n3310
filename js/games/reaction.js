import { LCD, clear, panel, text, randInt, makeBaseGame } from '../game-utils.js';

export default makeBaseGame({
  id: 'reaction',
  title: 'Quick Draw',
  help: 'Wait for the GO signal, then hit Enter or Space as fast as you can.',
  controls: ['Enter / Space = react', 'R = restart', 'Esc = quit'],
  create() {
    this.round = 1;
    this.best = null;
    this.message = 'Press Enter to arm';
    this.phase = 'idle';
    this.timer = 0;
  },
  arm() {
    this.phase = 'wait';
    this.timer = randInt(1200, 3200) / 1000;
    this.startTime = 0;
    this.message = 'Wait for GO';
  },
  onKeyDown(key) {
    if (!(key === 'Enter' || key === ' ')) return false;
    if (this.state === 'ready') {
      this.state = 'play';
      this.arm();
      return true;
    }
    if (this.phase === 'wait') {
      this.message = 'Too soon';
      this.phase = 'foul';
      this.app.audio.bad();
      return true;
    }
    if (this.phase === 'go') {
      const result = Math.round((performance.now() - this.startTime));
      this.best = this.best === null ? result : Math.min(this.best, result);
      this.message = `${result} ms`;
      this.phase = 'done';
      this.state = 'over';
      this.app.audio.good();
      return true;
    }
    return true;
  },
  update(dt) {
    if (this.state === 'ready') return;
    if (this.phase === 'wait') {
      this.timer -= dt;
      if (this.timer <= 0) {
        this.phase = 'go';
        this.startTime = performance.now();
        this.message = 'GO!';
        this.app.audio.action();
      }
    }
  },
  draw(ctx) {
    clear(ctx, this.width, this.height);
    panel(ctx, 22, 32, 276, 176, 'Quick Draw');
    text(ctx, this.message, 160, 112, 22, 'center');
    text(ctx, 'Press Enter or Space', 160, 150, 12, 'center');
    if (this.best !== null) text(ctx, `Best ${this.best} ms`, 160, 178, 12, 'center');
  },
  hud() { return [this.phase === 'wait' ? 'Do not press' : 'Ready', this.best ? `Best ${this.best}ms` : '']; }
});
