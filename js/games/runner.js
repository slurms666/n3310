import { LCD, clear, text, randInt, makeBaseGame } from '../game-utils.js';

export default makeBaseGame({
  id: 'dash-lines',
  title: 'Dash Lines',
  help: 'A simple lane-run survival game. Shift left and right to avoid blocks.',
  controls: ['Left / Right = move lane', 'Enter = start', 'Esc = quit'],
  create() {
    this.lanes = [96, 144, 192];
    this.playerLane = 1;
    this.blocks = [];
    this.timer = 0;
    this.score = 0;
  },
  onKeyDown(key) {
    if (this.state === 'ready' && key === 'Enter') { this.state = 'play'; return true; }
    if (this.state !== 'play') return false;
    if (key === 'ArrowLeft') this.playerLane = Math.max(0, this.playerLane - 1);
    else if (key === 'ArrowRight') this.playerLane = Math.min(2, this.playerLane + 1);
    else return false;
    return true;
  },
  update(dt) {
    if (this.state !== 'play') return;
    this.score += dt * 12;
    this.timer += dt;
    if (this.timer > 0.55) {
      this.timer = 0;
      this.blocks.push({ lane: randInt(0,2), y: -18, speed: 120 + this.score * 0.2 });
    }
    this.blocks.forEach(b => b.y += b.speed * dt);
    const playerX = this.lanes[this.playerLane];
    for (const b of this.blocks) {
      if (b.lane === this.playerLane && b.y > 186 && b.y < 220) {
        this.state = 'over';
        this.app.audio.bad();
      }
    }
    this.blocks = this.blocks.filter(b => b.y < 260);
  },
  draw(ctx) {
    clear(ctx, this.width, this.height);
    ctx.fillStyle = LCD.mid;
    ctx.fillRect(76, 0, 168, 240);
    ctx.fillStyle = LCD.light;
    [120,168].forEach(x => ctx.fillRect(x, 0, 2, 240));
    this.blocks.forEach(b => { ctx.fillStyle = LCD.dark; ctx.fillRect(this.lanes[b.lane] - 14, b.y, 28, 16); });
    ctx.fillStyle = LCD.dark;
    ctx.fillRect(playerX - 12, 202, 24, 20);
    if (this.state === 'ready') text(ctx, 'Enter to Start', 160, 120, 16, 'center');
    if (this.state === 'over') text(ctx, 'Hit - R to Restart', 160, 120, 14, 'center');
  },
  hud() { return [`Score ${Math.floor(this.score)}`, 'Mini dodge']; }
});
