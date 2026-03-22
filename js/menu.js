export class MenuSystem {
  constructor(app) {
    this.app = app;
    this.stack = [];
    this.current = null;
    this.index = 0;
    this.windowSize = 6;
  }

  open(menu) {
    this.current = menu;
    this.index = Math.min(this.index, Math.max(0, menu.items.length - 1));
    this.render();
  }

  push(menu) {
    if (this.current) this.stack.push({ menu: this.current, index: this.index });
    this.current = menu;
    this.index = 0;
    this.render();
  }

  back() {
    if (!this.stack.length) return false;
    const prev = this.stack.pop();
    this.current = prev.menu;
    this.index = prev.index;
    this.render();
    return true;
  }

  move(delta) {
    if (!this.current || !this.current.items.length) return;
    const total = this.current.items.length;
    this.index = (this.index + delta + total) % total;
    this.app.audio.menuMove();
    this.render();
  }

  select() {
    if (!this.current) return;
    const item = this.current.items[this.index];
    if (!item) return;
    this.app.audio.menuSelect();
    item.onSelect?.();
  }

  render() {
    if (!this.current) return;
    this.app.updateHeader(this.current.title, this.current.hint || 'Enter = Select');

    const content = this.app.menuContent;
    const intro = this.current.description ? `<p>${this.current.description}</p>` : '';
    const total = this.current.items.length;
    const windowSize = Math.min(this.windowSize, total || 1);
    const start = Math.max(0, Math.min(this.index - Math.floor(windowSize / 2), total - windowSize));
    const end = Math.min(total, start + windowSize);
    const visibleItems = this.current.items.slice(start, end);
    const thumbScale = total > windowSize ? windowSize / total : 1;
    const thumbOffset = total > windowSize ? start / total : 0;

    const items = visibleItems.map((item, visibleIdx) => {
      const idx = start + visibleIdx;
      const active = idx === this.index ? 'active' : '';
      const right = item.value ? `<span>${item.value}</span>` : '<span>›</span>';
      return `<li class="menu-item ${active}"><span>${item.label}</span>${right}</li>`;
    }).join('');

    content.innerHTML = `
      <div class="menu-header">
        <h2>${this.current.title}</h2>
        ${intro}
      </div>
      <div class="menu-window">
        <ul class="menu-list">${items}</ul>
        <div class="menu-scrollbar" aria-hidden="true">
          <div class="menu-scrollbar-thumb" style="transform: translateX(${thumbOffset * 100}%); width: ${Math.max(16, thumbScale * 100)}%;"></div>
        </div>
      </div>
      <div class="menu-footer">
        <span>${start + 1}-${end} / ${total}</span>
        <span>Esc Back</span>
      </div>
    `;
  }
}
