import { LCD, clear, text, intersects, randInt, makeBaseGame } from '../game-utils.js';

export default makeBaseGame({
  id: 'pixel-blaster',
  title: 'Pixel Blaster',
  help: 'A stripped-back side shooter. Avoid enemy ships and fire with Enter or Space.',
  controls: ['Arrow keys = move', 'Enter / Space = fire', 'Esc = quit'],
  create() {
    this.player = { x: 26, y: 112, w: 18, h: 12, speed: 130 };
    this.bullets = [];
    this.enemies = [];
    this.enemyTimer = 0;
    this.score = 0;
    this.lives = 3;
    this.cooldown = 0;
  },
  shoot() {
    if (this.cooldown > 0 || this.state !== 'play') return;
    this.bullets.push({ x: this.player.x + 18, y: this.player.y + 4, w: 8, h: 3, vx: 220 });
    this.cooldown = 0.22;
    this.app.audio.action();
  },
  onKeyDown(key) {
    if (key === 'Enter' || key === ' ') {
      if (this.state === 'ready') this.state = 'play';
      else this.shoot();
      return true;
    }
    return false;
  },
  update(dt, input) {
    if (this.state === 'ready') return;
    if (this.state === 'over') return;
    this.state = 'play';
    this.cooldown = Math.max(0, this.cooldown - dt);

    const { left, right, up, down } = input;
    if (left) this.player.x -= this.player.speed * dt;
    if (right) this.player.x += this.player.speed * dt;
    if (up) this.player.y -= this.player.speed * dt;
    if (down) this.player.y += this.player.speed * dt;
    this.player.x = Math.max(6, Math.min(110, this.player.x));
    this.player.y = Math.max(6, Math.min(222, this.player.y));

    if (input.spaceHeld) this.shoot();

    this.enemyTimer += dt;
    if (this.enemyTimer > 0.7) {
      this.enemyTimer = 0;
      this.enemies.push({ x: 330, y: randInt(12, 210), w: 18, h: 12, vx: randInt(80, 130) });
    }

    this.bullets.forEach(b => b.x += b.vx * dt);
    this.enemies.forEach(e => e.x -= e.vx * dt);

    for (const bullet of this.bullets) {
      for (const enemy of this.enemies) {
        if (!enemy.dead && intersects(bullet, enemy)) {
          enemy.dead = true;
          bullet.dead = true;
          this.score += 15;
          this.app.audio.good();
        }
      }
    }

    for (const enemy of this.enemies) {
      if (!enemy.dead && intersects(this.player, enemy)) {
        enemy.dead = true;
        this.lives -= 1;
        this.app.audio.bad();
        if (this.lives <= 0) this.state = 'over';
      }
      if (enemy.x < -30 && !enemy.dead) {
        enemy.dead = true;
        this.lives -= 1;
        if (this.lives <= 0) this.state = 'over';
      }
    }

    this.bullets = this.bullets.filter(b => !b.dead && b.x < 340);
    this.enemies = this.enemies.filter(e => !e.dead && e.x > -30);
  },
  draw(ctx) {
    clear(ctx, this.width, this.height);
    ctx.fillStyle = LCD.mid;
    for (let i = 0; i < 24; i++) ctx.fillRect((i * 37) % 320, (i * 53 + 20) % 240, 2, 2);

    ctx.fillStyle = LCD.dark;
    ctx.fillRect(this.player.x, this.player.y + 4, this.player.w, 4);
    ctx.fillRect(this.player.x + 10, this.player.y, 8, 12);
    this.bullets.forEach(b => ctx.fillRect(b.x, b.y, b.w, b.h));
    this.enemies.forEach(e => {
      ctx.fillRect(e.x, e.y + 2, e.w, 8);
      ctx.fillRect(e.x + 4, e.y, 6, 12);
    });

    if (this.state === 'ready') text(ctx, 'Enter to Start / Space to Fire', 160, 120, 14, 'center');
    if (this.state === 'over') text(ctx, 'Ship Lost - R to Restart', 160, 120, 14, 'center');
  },
  hud() { return [`Score ${this.score}`, `Lives ${this.lives}`]; }
});
