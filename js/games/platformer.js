import { LCD, clear, text, clamp, makeBaseGame } from '../game-utils.js';

export default makeBaseGame({
  id: 'spring-hop',
  title: 'Spring Hop',
  help: 'Roll to the exit. Jump over spikes and gaps to reach the goal flag.',
  controls: ['Left / Right = move', 'Enter / Space = jump', 'Esc = quit'],
  create() {
    this.level = '.......................................#....^....#...........^.......#....G';
    this.tile = 8;
    this.player = { x: 12, y: 160, vx: 0, vy: 0, w: 10, h: 10, grounded: false };
    this.scroll = 0;
    this.goalX = (this.level.indexOf('G')) * this.tile;
  },
  solidAt(px, py) {
    const tx = Math.floor(px / this.tile);
    const ty = Math.floor(py / this.tile);
    if (ty >= 22) return true;
    const char = this.level[tx] || '.';
    return ty >= 20 && (char === '#' || char === 'G');
  },
  onKeyDown(key) {
    if (this.state === 'ready' && key === 'Enter') { this.state = 'play'; return true; }
    if (this.state !== 'play') return false;
    if ((key === 'Enter' || key === ' ') && this.player.grounded) {
      this.player.vy = -165;
      this.player.grounded = false;
      this.app.audio.action();
      return true;
    }
    return false;
  },
  update(dt, input) {
    if (this.state !== 'play') return;
    this.player.vx = input.left ? -70 : input.right ? 70 : 0;
    this.player.vy += 340 * dt;
    this.player.x += this.player.vx * dt;
    this.player.y += this.player.vy * dt;
    this.player.grounded = false;

    if (this.player.y + this.player.h >= 160) {
      const tx = Math.floor((this.player.x + this.player.w / 2) / this.tile);
      const char = this.level[tx] || '.';
      if (char === '#' || char === 'G') {
        this.player.y = 150;
        this.player.vy = 0;
        this.player.grounded = true;
      }
    }

    const tx = Math.floor((this.player.x + this.player.w / 2) / this.tile);
    const char = this.level[tx] || '.';
    if (char === '^' && this.player.y + this.player.h >= 160) {
      this.state = 'over';
      this.app.audio.bad();
    }
    if (char === 'G' && this.player.y + this.player.h >= 160) {
      this.state = 'over';
      this.win = true;
      this.app.audio.good();
    }
    if (this.player.y > 240) {
      this.state = 'over';
      this.app.audio.bad();
    }
    this.player.x = clamp(this.player.x, 0, this.goalX + 20);
    this.scroll = clamp(this.player.x - 60, 0, this.goalX - 120);
  },
  draw(ctx) {
    clear(ctx, this.width, this.height);
    ctx.fillStyle = LCD.mid;
    for (let i = 0; i < 40; i++) ctx.fillRect((i * 31) % 320, 28 + (i * 17) % 70, 2, 2);

    for (let i = 0; i < this.level.length; i++) {
      const x = i * this.tile - this.scroll;
      const char = this.level[i];
      if (char === '#' || char === 'G') {
        ctx.fillStyle = LCD.dark;
        ctx.fillRect(x, 160, this.tile, 16);
      }
      if (char === '^') {
        ctx.fillStyle = LCD.dark;
        ctx.beginPath();
        ctx.moveTo(x + 4, 160); ctx.lineTo(x, 168); ctx.lineTo(x + 8, 168); ctx.fill();
      }
      if (char === 'G') {
        ctx.fillRect(x + 3, 140, 2, 20);
        ctx.fillRect(x + 5, 140, 8, 6);
      }
    }

    ctx.fillStyle = LCD.dark;
    ctx.beginPath();
    ctx.arc(this.player.x - this.scroll + 5, this.player.y + 5, 5, 0, Math.PI * 2);
    ctx.fill();
    text(ctx, 'Reach the flag', 160, 22, 12, 'center');
    if (this.state === 'ready') text(ctx, 'Enter to Start', 160, 112, 14, 'center');
    if (this.state === 'over') text(ctx, this.win ? 'You made it - R to Restart' : 'Crash - R to Restart', 160, 112, 14, 'center');
  },
  hud() { return [this.win ? 'Win' : 'Run', 'Jump over spikes']; }
});
