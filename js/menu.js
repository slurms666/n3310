export class MenuSystem {
  constructor(app) {
    this.app = app;
    this.stack = [];
    this.current = null;
    this.index = 0;
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
    const items = this.current.items.map((item, idx) => {
      const active = idx === this.index ? 'active' : '';
      const right = item.value ? `<span>${item.value}</span>` : '<span>›</span>';
      return `<li class="menu-item ${active}"><span>${item.label}</span>${right}</li>`;
    }).join('');

    content.innerHTML = `
      <div class="menu-header">
        <h2>${this.current.title}</h2>
        ${intro}
      </div>
      <ul class="menu-list">${items}</ul>
      <div class="menu-footer">
        <span>↑↓ Move</span>
        <span>Esc Back</span>
      </div>
    `;
  }
}
