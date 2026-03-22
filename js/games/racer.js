import { LCD, clear, text, intersects, randInt, makeBaseGame } from '../game-utils.js';

export default makeBaseGame({
  id: 'lane-dodge',
  title: 'Lane Dodge',
  help: 'Stay on the road, dodge incoming traffic, and survive as long as you can.',
  controls: ['Left / Right = change lane', 'Enter = start', 'Esc = quit'],
  create() {
    this.lanes = [90, 150, 210];
    this.playerLane = 1;
    this.player = { x: this.lanes[this.playerLane] - 12, y: 188, w: 24, h: 36 };
    this.cars = [];
    this.timer = 0;
    this.speed = 110;
    this.score = 0;
  },
  onKeyDown(key) {
    if (this.state === 'ready' && key === 'Enter') { this.state = 'play'; return true; }
    if (this.state !== 'play') return false;
    if (key === 'ArrowLeft') this.playerLane = Math.max(0, this.playerLane - 1);
    else if (key === 'ArrowRight') this.playerLane = Math.min(2, this.playerLane + 1);
    else return false;
    this.player.x = this.lanes[this.playerLane] - 12;
    this.app.audio.action();
    return true;
  },
  update(dt) {
    if (this.state !== 'play') return;
    this.score += dt * 10;
    this.speed += dt * 2;
    this.timer += dt;
    if (this.timer > 0.8) {
      this.timer = 0;
      const lane = randInt(0, 2);
      this.cars.push({ x: this.lanes[lane] - 12, y: -40, w: 24, h: 36, speed: this.speed + randInt(0, 40) });
    }
    this.cars.forEach(car => car.y += car.speed * dt);
    for (const car of this.cars) {
      if (intersects(this.player, car)) {
        this.state = 'over';
        this.app.audio.bad();
      }
    }
    this.cars = this.cars.filter(c => c.y < 280);
  },
  drawCar(ctx, car, shade = LCD.dark) {
    ctx.fillStyle = shade;
    ctx.fillRect(car.x, car.y, car.w, car.h);
    ctx.clearRect(car.x + 6, car.y + 6, 12, 6);
  },
  draw(ctx) {
    clear(ctx, this.width, this.height);
    ctx.fillStyle = LCD.mid;
    ctx.fillRect(60, 0, 200, 240);
    ctx.fillStyle = LCD.light;
    for (let y = (this.tick * 150) % 40 - 40; y < 240; y += 40) ctx.fillRect(158, y, 4, 24);
    this.drawCar(ctx, this.player, LCD.dark);
    this.cars.forEach(car => this.drawCar(ctx, car, LCD.dark));
    if (this.state === 'ready') text(ctx, 'Enter to Start', 160, 120, 16, 'center');
    if (this.state === 'over') text(ctx, 'Crashed - R to Restart', 160, 120, 14, 'center');
  },
  hud() { return [`Score ${Math.floor(this.score)}`, 'Dodge traffic']; }
});
