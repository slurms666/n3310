import { LCD, clear, text, intersects, makeBaseGame } from '../game-utils.js';

export default makeBaseGame({
  id: 'brick-breaker',
  title: 'Brick Breaker',
  help: 'Bounce the ball off the bat and clear every brick.',
  controls: ['Left / Right = move bat', 'Enter = launch', 'Esc = quit'],
  create() {
    this.paddle = { x: 130, y: 214, w: 60, h: 8 };
    this.ball = { x: 160, y: 206, w: 6, h: 6, vx: 90, vy: -90, stuck: true };
    this.bricks = [];
    for (let y = 0; y < 4; y++) for (let x = 0; x < 7; x++) this.bricks.push({ x: 26 + x * 40, y: 30 + y * 18, w: 32, h: 12, alive: true });
    this.score = 0;
    this.lives = 3;
  },
  onKeyDown(key) {
    if (this.state === 'ready' && key === 'Enter') { this.state = 'play'; return true; }
    if (this.state !== 'play') return false;
    if (key === 'Enter' || key === ' ') {
      this.ball.stuck = false;
      this.app.audio.action();
      return true;
    }
    return false;
  },
  update(dt, input) {
    if (this.state !== 'play') return;
    this.paddle.x += (input.left ? -180 : input.right ? 180 : 0) * dt;
    this.paddle.x = Math.max(8, Math.min(252, this.paddle.x));
    if (this.ball.stuck) {
      this.ball.x = this.paddle.x + this.paddle.w / 2 - 3;
      return;
    }
    this.ball.x += this.ball.vx * dt;
    this.ball.y += this.ball.vy * dt;
    if (this.ball.x <= 0 || this.ball.x + this.ball.w >= 320) this.ball.vx *= -1;
    if (this.ball.y <= 0) this.ball.vy *= -1;
    if (intersects(this.ball, this.paddle)) {
      this.ball.vy = -Math.abs(this.ball.vy);
      const hit = (this.ball.x - this.paddle.x) / this.paddle.w - 0.5;
      this.ball.vx = hit * 220;
    }
    for (const brick of this.bricks) {
      if (brick.alive && intersects(this.ball, brick)) {
        brick.alive = false;
        this.ball.vy *= -1;
        this.score += 10;
        this.app.audio.good();
        break;
      }
    }
    if (this.bricks.every(b => !b.alive)) {
      this.state = 'over';
      this.win = true;
    }
    if (this.ball.y > 240) {
      this.lives -= 1;
      this.app.audio.bad();
      if (this.lives <= 0) this.state = 'over';
      this.ball.stuck = true;
      this.ball.y = 206;
      this.ball.vx = 90;
      this.ball.vy = -90;
    }
  },
  draw(ctx) {
    clear(ctx, this.width, this.height);
    ctx.fillStyle = LCD.dark;
    this.bricks.forEach(b => { if (b.alive) ctx.fillRect(b.x, b.y, b.w, b.h); });
    ctx.fillRect(this.paddle.x, this.paddle.y, this.paddle.w, this.paddle.h);
    ctx.fillRect(this.ball.x, this.ball.y, this.ball.w, this.ball.h);
    if (this.state === 'ready') text(ctx, 'Enter to Start / Launch', 160, 130, 14, 'center');
    if (this.state === 'over') text(ctx, this.win ? 'Stage Clear - R to Restart' : 'Ball lost - R to Restart', 160, 130, 14, 'center');
  },
  hud() { return [`Score ${this.score}`, `Lives ${this.lives}`]; }
});
