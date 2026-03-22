export const LCD = {
  dark: '#223324',
  mid: '#415643',
  light: '#d8ecd1',
  bg: '#a9c49d',
  shade: '#85a07e'
};

export function clear(ctx, w, h, tone = LCD.bg) {
  ctx.fillStyle = tone;
  ctx.fillRect(0, 0, w, h);
}

export function panel(ctx, x, y, w, h, title) {
  ctx.fillStyle = LCD.light;
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = LCD.dark;
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, w, h);
  if (title) {
    ctx.fillStyle = LCD.dark;
    ctx.font = 'bold 12px Arial';
    ctx.fillText(title, x + 8, y + 16);
  }
}

export function text(ctx, value, x, y, size = 12, align = 'left') {
  ctx.fillStyle = LCD.dark;
  ctx.font = `${size >= 14 ? 'bold ' : ''}${size}px Arial`;
  ctx.textAlign = align;
  ctx.fillText(value, x, y);
  ctx.textAlign = 'left';
}

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function intersects(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

export function makeBaseGame(config) {
  return {
    id: config.id,
    title: config.title,
    help: config.help,
    controls: config.controls || [],
    init(app) {
      this.app = app;
      this.width = app.canvas.width;
      this.height = app.canvas.height;
      this.firstRunShown = false;
      this.reset();
    },
    reset() {
      this.state = 'ready';
      this.tick = 0;
      config.create?.call(this);
    },
    restart() {
      this.reset();
    },
    update(dt, input) {
      this.tick += dt;
      config.update?.call(this, dt, input);
    },
    draw(ctx) {
      config.draw?.call(this, ctx);
    },
    onKeyDown(key) {
      return config.onKeyDown?.call(this, key) ?? false;
    },
    hud() {
      return config.hud?.call(this) || [];
    }
  };
}
