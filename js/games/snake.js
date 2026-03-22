import { LCD, clear, text, makeBaseGame } from '../game-utils.js';

export default makeBaseGame({
  id: 'snake',
  title: 'Snake',
  help: 'Eat pellets, grow longer, and avoid your own body. This version wraps around the edges.',
  controls: ['Arrow keys = move', 'Enter = start', 'R = restart', 'Esc = quit'],
  create() {
    this.cell = 16;
    this.cols = 20;
    this.rows = 15;
    this.moveTimer = 0;
    this.speed = 0.12;
    this.dir = { x: 1, y: 0 };
    this.nextDir = { x: 1, y: 0 };
    this.snake = [{ x: 8, y: 7 }, { x: 7, y: 7 }, { x: 6, y: 7 }];
    this.spawnFood();
    this.score = 0;
  },
  spawnFood() {
    let ok = false;
    while (!ok) {
      const x = Math.floor(Math.random() * this.cols);
      const y = Math.floor(Math.random() * this.rows);
      ok = !this.snake.some(p => p.x === x && p.y === y);
      if (ok) this.food = { x, y, w: 1, h: 1 };
    }
  },
  update(dt, input) {
    if (this.state === 'ready' && (input.enterPressed || input.spacePressed)) this.state = 'play';
    if (this.state !== 'play') return;

    this.moveTimer += dt;
    if (this.moveTimer < this.speed) return;
    this.moveTimer = 0;
    this.dir = this.nextDir;

    const head = {
      x: (this.snake[0].x + this.dir.x + this.cols) % this.cols,
      y: (this.snake[0].y + this.dir.y + this.rows) % this.rows
    };
    const tail = this.snake[this.snake.length - 1];
    const hitsBody = this.snake.some((s, index) => {
      const isTailLeaving = index === this.snake.length - 1 && head.x === tail.x && head.y === tail.y && !(head.x === this.food.x && head.y === this.food.y);
      return !isTailLeaving && s.x === head.x && s.y === head.y;
    });
    if (hitsBody) {
      this.state = 'over';
      this.app.audio.bad();
      return;
    }
    this.snake.unshift(head);
    if (head.x === this.food.x && head.y === this.food.y) {
      this.score += 10;
      this.app.audio.good();
      this.speed = Math.max(0.06, this.speed - 0.003);
      this.spawnFood();
    } else {
      this.snake.pop();
    }
  },
  onKeyDown(key) {
    const dirs = {
      ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 }, ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 }
    };
    if (!dirs[key]) return false;
    const next = dirs[key];
    if (this.dir.x + next.x === 0 && this.dir.y + next.y === 0) return true;
    this.nextDir = next;
    return true;
  },
  draw(ctx) {
    clear(ctx, this.width, this.height);
    const ox = 0, oy = 0;
    ctx.strokeStyle = LCD.mid;
    for (let x = 0; x <= this.cols; x++) {
      ctx.beginPath(); ctx.moveTo(ox + x * this.cell, oy); ctx.lineTo(ox + x * this.cell, oy + this.rows * this.cell); ctx.stroke();
    }
    for (let y = 0; y <= this.rows; y++) {
      ctx.beginPath(); ctx.moveTo(ox, oy + y * this.cell); ctx.lineTo(ox + this.cols * this.cell, oy + y * this.cell); ctx.stroke();
    }
    ctx.fillStyle = LCD.dark;
    this.snake.forEach((part, index) => ctx.fillRect(part.x * this.cell + 2, part.y * this.cell + 2, this.cell - 4, this.cell - 4));
    ctx.fillStyle = LCD.mid;
    ctx.fillRect(this.food.x * this.cell + 4, this.food.y * this.cell + 4, this.cell - 8, this.cell - 8);
    if (this.state === 'ready') text(ctx, 'Press Enter', 160, 120, 16, 'center');
    if (this.state === 'over') text(ctx, 'Game Over - R to Restart', 160, 120, 14, 'center');
  },
  hud() { return [`Score ${this.score}`, this.state === 'play' ? 'Eat + survive' : '']; }
});
