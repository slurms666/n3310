import { LCD, clear, panel, text, makeBaseGame } from '../game-utils.js';

export default makeBaseGame({
  id: 'memory-match',
  title: 'Memory Match',
  help: 'Flip tiles and find all matching pairs in the fewest turns.',
  controls: ['Arrow keys = move', 'Enter = flip', 'Esc = quit'],
  create() {
    const values = ['A','A','B','B','C','C','D','D','E','E','F','F'];
    this.cards = values.sort(() => Math.random() - 0.5).map((value, index) => ({ value, open: false, solved: false, index }));
    this.cursor = 0;
    this.selected = [];
    this.wait = 0;
    this.moves = 0;
    this.matches = 0;
  },
  onKeyDown(key) {
    if (this.state === 'ready' && key === 'Enter') { this.state = 'play'; return true; }
    if (this.state !== 'play' || this.wait > 0) return false;
    const cols = 4;
    if (key === 'ArrowLeft') this.cursor = (this.cursor + this.cards.length - 1) % this.cards.length;
    else if (key === 'ArrowRight') this.cursor = (this.cursor + 1) % this.cards.length;
    else if (key === 'ArrowUp') this.cursor = (this.cursor + this.cards.length - cols) % this.cards.length;
    else if (key === 'ArrowDown') this.cursor = (this.cursor + cols) % this.cards.length;
    else if (key === 'Enter') {
      const card = this.cards[this.cursor];
      if (card.open || card.solved) return true;
      card.open = true;
      this.selected.push(card);
      this.app.audio.action();
      if (this.selected.length === 2) {
        this.moves += 1;
        if (this.selected[0].value === this.selected[1].value) {
          this.selected.forEach(c => c.solved = true);
          this.selected = [];
          this.matches += 1;
          this.app.audio.good();
          if (this.matches === 6) this.state = 'over';
        } else {
          this.wait = 0.7;
        }
      }
    } else return false;
    return true;
  },
  update(dt) {
    if (this.wait > 0) {
      this.wait -= dt;
      if (this.wait <= 0) {
        this.selected.forEach(c => c.open = false);
        this.selected = [];
      }
    }
  },
  draw(ctx) {
    clear(ctx, this.width, this.height);
    panel(ctx, 12, 12, 296, 216, 'Memory Match');
    const cols = 4;
    this.cards.forEach((card, i) => {
      const x = 32 + (i % cols) * 64;
      const y = 46 + Math.floor(i / cols) * 52;
      const active = i === this.cursor;
      ctx.fillStyle = active ? LCD.mid : LCD.bg;
      ctx.fillRect(x, y, 48, 36);
      ctx.strokeStyle = LCD.dark;
      ctx.strokeRect(x, y, 48, 36);
      if (card.open || card.solved) text(ctx, card.value, x + 24, y + 24, 18, 'center');
      else text(ctx, '?', x + 24, y + 24, 18, 'center');
    });
    if (this.state === 'ready') text(ctx, 'Enter to Start', 160, 206, 12, 'center');
    if (this.state === 'over') text(ctx, 'All pairs found - R to Restart', 160, 206, 12, 'center');
  },
  hud() { return [`Moves ${this.moves}`, `Pairs ${this.matches}/6`]; }
});
