import { LCD, clear, panel, text, makeBaseGame } from '../game-utils.js';

export default makeBaseGame({
  id: 'seed-stores',
  title: 'Seed Stores',
  help: 'A quick Mancala-style duel against a simple bot. Capture more seeds than the bot.',
  controls: ['Left / Right = choose pit', 'Enter = sow seeds', 'Esc = quit'],
  create() {
    this.pits = [4,4,4,4,4,4,0,4,4,4,4,4,4,0];
    this.cursor = 0;
    this.turn = 'player';
    this.status = 'Pick a pit';
    this.botTimer = 0;
  },
  sideEmpty(start) { return this.pits.slice(start, start + 6).every(v => v === 0); },
  finishIfNeeded() {
    if (!this.sideEmpty(0) && !this.sideEmpty(7)) return false;
    const left = this.pits.slice(0, 6).reduce((a, b) => a + b, 0);
    const right = this.pits.slice(7, 13).reduce((a, b) => a + b, 0);
    for (let i = 0; i < 6; i++) this.pits[i] = 0;
    for (let i = 7; i < 13; i++) this.pits[i] = 0;
    this.pits[6] += left;
    this.pits[13] += right;
    this.state = 'over';
    this.status = this.pits[6] >= this.pits[13] ? 'You win' : 'Bot wins';
    return true;
  },
  makeMove(index, playerTurn) {
    let stones = this.pits[index];
    if (!stones) return false;
    this.pits[index] = 0;
    let i = index;
    while (stones > 0) {
      i = (i + 1) % 14;
      if (playerTurn && i === 13) continue;
      if (!playerTurn && i === 6) continue;
      this.pits[i] += 1;
      stones--;
    }

    const ownStore = playerTurn ? 6 : 13;
    const start = playerTurn ? 0 : 7;
    const opposite = 12 - i;
    if (i >= start && i < start + 6 && this.pits[i] === 1 && this.pits[opposite] > 0) {
      this.pits[ownStore] += this.pits[i] + this.pits[opposite];
      this.pits[i] = 0;
      this.pits[opposite] = 0;
      this.app.audio.good();
    }

    this.finishIfNeeded();
    if (this.state === 'over') return true;
    if (i !== ownStore) this.turn = playerTurn ? 'bot' : 'player';
    this.status = this.turn === 'player' ? 'Your turn' : 'Bot thinking';
    return true;
  },
  onKeyDown(key) {
    if (this.state === 'ready' && key === 'Enter') { this.state = 'play'; return true; }
    if (this.state !== 'play' || this.turn !== 'player') return false;
    if (key === 'ArrowLeft') {
      do this.cursor = (this.cursor + 5) % 6; while (this.pits[this.cursor] === 0 && this.pits.slice(0, 6).some(v => v > 0));
      return true;
    }
    if (key === 'ArrowRight') {
      do this.cursor = (this.cursor + 1) % 6; while (this.pits[this.cursor] === 0 && this.pits.slice(0, 6).some(v => v > 0));
      return true;
    }
    if (key === 'Enter') {
      if (this.makeMove(this.cursor, true)) this.app.audio.action();
      return true;
    }
    return false;
  },
  update(dt) {
    if (this.state === 'ready' || this.state === 'over') return;
    if (this.turn === 'bot') {
      this.botTimer += dt;
      if (this.botTimer > 0.55) {
        this.botTimer = 0;
        const options = this.pits.slice(7, 13).map((v, idx) => v > 0 ? idx + 7 : null).filter(Boolean);
        const pick = options[Math.floor(Math.random() * options.length)];
        this.makeMove(pick, false);
      }
    }
  },
  draw(ctx) {
    clear(ctx, this.width, this.height);
    panel(ctx, 12, 24, 296, 192, 'Seed Stores');
    text(ctx, this.status, 160, 46, 12, 'center');
    text(ctx, 'Bot', 160, 68, 12, 'center');
    text(ctx, 'You', 160, 188, 12, 'center');

    const drawPit = (x, y, value, active = false) => {
      ctx.strokeStyle = LCD.dark; ctx.lineWidth = 2;
      ctx.fillStyle = active ? LCD.mid : LCD.bg;
      ctx.fillRect(x, y, 30, 30); ctx.strokeRect(x, y, 30, 30);
      text(ctx, String(value), x + 15, y + 20, 14, 'center');
    };

    drawPit(20, 88, this.pits[13]);
    drawPit(270, 88, this.pits[6]);
    for (let i = 0; i < 6; i++) drawPit(58 + i * 34, 78, this.pits[12 - i]);
    for (let i = 0; i < 6; i++) drawPit(58 + i * 34, 138, this.pits[i], this.turn === 'player' && this.cursor === i);

    if (this.state === 'ready') text(ctx, 'Enter to Start', 160, 224, 12, 'center');
    if (this.state === 'over') text(ctx, `${this.status} - R to Restart`, 160, 224, 12, 'center');
  },
  hud() { return [`You ${this.pits?.[6] ?? 0}`, `Bot ${this.pits?.[13] ?? 0}`]; }
});
