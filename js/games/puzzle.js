import { LCD, clear, panel, text, randInt, makeBaseGame } from '../game-utils.js';

const SHAPES = [
  [[1,1],[1,1]],
  [[1,1,1,1]],
  [[1,1,0],[0,1,1]],
  [[0,1,1],[1,1,0]],
  [[1,1,1],[0,1,0]],
  [[1,0],[1,0],[1,1]],
  [[0,1],[0,1],[1,1]]
];

export default makeBaseGame({
  id: 'puzzle-blocks',
  title: 'Puzzle Blocks',
  help: 'Stack falling pieces, clear lines, and stop the pile reaching the top.',
  controls: ['Left / Right = move', 'Down = drop faster', 'Enter / Space = rotate', 'Esc = quit'],
  create() {
    this.cols = 10; this.rows = 16; this.cell = 13;
    this.grid = Array.from({ length: this.rows }, () => Array(this.cols).fill(0));
    this.fall = 0; this.speed = 0.55; this.score = 0;
    this.spawn();
  },
  spawn() {
    const shape = SHAPES[randInt(0, SHAPES.length - 1)].map(r => [...r]);
    this.piece = { shape, x: 3, y: 0 };
    if (this.collides(this.piece.x, this.piece.y, this.piece.shape)) {
      this.state = 'over';
      this.app.audio.bad();
    }
  },
  collides(px, py, shape) {
    for (let y = 0; y < shape.length; y++) for (let x = 0; x < shape[y].length; x++) {
      if (!shape[y][x]) continue;
      const gx = px + x, gy = py + y;
      if (gx < 0 || gx >= this.cols || gy >= this.rows) return true;
      if (gy >= 0 && this.grid[gy][gx]) return true;
    }
    return false;
  },
  rotate() {
    const rotated = this.piece.shape[0].map((_, i) => this.piece.shape.map(row => row[i]).reverse());
    if (!this.collides(this.piece.x, this.piece.y, rotated)) this.piece.shape = rotated;
  },
  lockPiece() {
    this.piece.shape.forEach((row, y) => row.forEach((cell, x) => {
      if (cell) this.grid[this.piece.y + y][this.piece.x + x] = 1;
    }));
    let cleared = 0;
    this.grid = this.grid.filter(row => {
      if (row.every(Boolean)) { cleared++; return false; }
      return true;
    });
    while (this.grid.length < this.rows) this.grid.unshift(Array(this.cols).fill(0));
    if (cleared) {
      this.score += cleared * 50;
      this.speed = Math.max(0.18, this.speed - cleared * 0.02);
      this.app.audio.good();
    }
    this.spawn();
  },
  stepDown() {
    if (!this.collides(this.piece.x, this.piece.y + 1, this.piece.shape)) this.piece.y += 1;
    else this.lockPiece();
  },
  onKeyDown(key) {
    if (this.state === 'ready' && key === 'Enter') { this.state = 'play'; return true; }
    if (this.state !== 'play') return false;
    if (key === 'ArrowLeft' && !this.collides(this.piece.x - 1, this.piece.y, this.piece.shape)) this.piece.x -= 1;
    else if (key === 'ArrowRight' && !this.collides(this.piece.x + 1, this.piece.y, this.piece.shape)) this.piece.x += 1;
    else if (key === 'ArrowDown') this.stepDown();
    else if (key === 'Enter' || key === ' ') this.rotate();
    else return false;
    return true;
  },
  update(dt, input) {
    if (this.state !== 'play') return;
    this.fall += dt * (input.down ? 3.4 : 1);
    if (this.fall >= this.speed) {
      this.fall = 0;
      this.stepDown();
    }
  },
  draw(ctx) {
    clear(ctx, this.width, this.height);
    panel(ctx, 32, 12, 156, 216, 'Puzzle Blocks');
    const ox = 40, oy = 26;
    for (let y = 0; y < this.rows; y++) for (let x = 0; x < this.cols; x++) {
      ctx.strokeStyle = 'rgba(34,51,36,0.18)';
      ctx.strokeRect(ox + x * this.cell, oy + y * this.cell, this.cell, this.cell);
      if (this.grid[y][x]) { ctx.fillStyle = LCD.dark; ctx.fillRect(ox + x * this.cell + 1, oy + y * this.cell + 1, this.cell - 2, this.cell - 2); }
    }
    if (this.piece) this.piece.shape.forEach((row, y) => row.forEach((cell, x) => {
      if (cell) { ctx.fillStyle = LCD.mid; ctx.fillRect(ox + (this.piece.x + x) * this.cell + 1, oy + (this.piece.y + y) * this.cell + 1, this.cell - 2, this.cell - 2); }
    }));
    text(ctx, 'Fill lines to score', 228, 74, 12, 'center');
    text(ctx, 'Enter rotates', 228, 98, 12, 'center');
    text(ctx, 'Down speeds up', 228, 122, 12, 'center');
    if (this.state === 'ready') text(ctx, 'Enter to Start', 228, 156, 12, 'center');
    if (this.state === 'over') text(ctx, 'Stack jammed', 228, 156, 12, 'center');
  },
  hud() { return [`Score ${this.score}`, this.state === 'play' ? 'Clear lines' : '']; }
});
