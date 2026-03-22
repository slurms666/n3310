import { RetroAudio } from './audio.js';
import { MenuSystem } from './menu.js';
import snake from './games/snake.js';
import shooter from './games/shooter.js';
import mancala from './games/mancala.js';
import memoryMatch from './games/memory.js';
import reaction from './games/reaction.js';
import puzzle from './games/puzzle.js';
import platformer from './games/platformer.js';
import racer from './games/racer.js';
import simon from './games/simon.js';
import breaker from './games/breaker.js';

class App {
  constructor() {
    this.audio = new RetroAudio();
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.menuView = document.getElementById('menuView');
    this.gameView = document.getElementById('gameView');
    this.menuContent = document.getElementById('menuContent');
    this.overlay = document.getElementById('overlay');
    this.gameHud = document.getElementById('gameHud');
    this.screenTitle = document.getElementById('screenTitle');
    this.screenHint = document.getElementById('screenHint');
    this.globalMuteBtn = document.getElementById('globalMuteBtn');

    this.input = { left: false, right: false, up: false, down: false, spaceHeld: false, enterPressed: false, spacePressed: false };
    this.menu = new MenuSystem(this);
    this.soundOn = true;
    this.activeGame = null;
    this.lastTime = performance.now();

    this.games = [snake, shooter, mancala, memoryMatch, reaction, puzzle, platformer, racer, simon, breaker].map(game => ({ ...game }));

    this.bindEvents();
    this.buildMenus();
    this.showMenu();
    requestAnimationFrame(this.loop.bind(this));
  }

  bindEvents() {
    document.addEventListener('keydown', (event) => this.handleKeyDown(event));
    document.addEventListener('keyup', (event) => this.handleKeyUp(event));
    this.globalMuteBtn.addEventListener('click', () => this.toggleSound());
    window.addEventListener('blur', () => {
      this.input.left = this.input.right = this.input.up = this.input.down = this.input.spaceHeld = false;
    });
  }

  buildMenus() {
    this.mainMenu = {
      title: 'Main Menu',
      description: 'Use arrows like a classic phone menu.',
      items: [
        { label: 'Play Games', onSelect: () => this.menu.push(this.gamesMenu) },
        { label: 'Controls', onSelect: () => this.menu.push(this.controlsMenu) },
        { label: 'About', onSelect: () => this.menu.push(this.aboutMenu) },
        { label: 'Sound', value: this.soundOn ? 'On' : 'Off', onSelect: () => { this.toggleSound(); this.buildMenus(); this.menu.open(this.mainMenu); } }
      ]
    };

    this.gamesMenu = {
      title: 'Play Games',
      description: 'Ten small originals with one shared control layout.',
      items: this.games.map(game => ({ label: game.title, onSelect: () => this.launchGame(game.id) }))
    };

    this.controlsMenu = {
      title: 'Controls',
      description: 'Shared controls across the whole site.',
      items: [
        { label: 'Arrows = Move', value: 'OK', onSelect: () => {} },
        { label: 'Enter = Select', value: 'OK', onSelect: () => {} },
        { label: 'Esc = Back/Quit', value: 'OK', onSelect: () => {} },
        { label: 'Space = Action', value: 'OK', onSelect: () => {} },
        { label: 'M = Sound', value: this.soundOn ? 'On' : 'Off', onSelect: () => this.toggleSound() }
      ],
      hint: 'Esc = Back'
    };

    this.aboutMenu = {
      title: 'About',
      description: 'Original retro tribute, not an official Nokia product.',
      items: [
        { label: 'Static HTML/CSS/JS', value: '✓', onSelect: () => {} },
        { label: 'Keyboard First', value: '✓', onSelect: () => {} },
        { label: 'By Pebbs.app', value: '↗', onSelect: () => window.open('https://pebbs.app', '_blank', 'noopener') }
      ],
      hint: 'Esc = Back'
    };
  }

  updateHeader(title, hint) {
    this.screenTitle.textContent = title;
    this.screenHint.textContent = hint;
  }

  toggleSound() {
    this.soundOn = !this.soundOn;
    this.audio.setEnabled(this.soundOn);
    this.globalMuteBtn.textContent = `Sound: ${this.soundOn ? 'On' : 'Off'}`;
    this.globalMuteBtn.setAttribute('aria-pressed', String(!this.soundOn));
    this.buildMenus();
  }

  showMenu() {
    this.activeGame = null;
    this.hideOverlay();
    this.menuView.classList.add('active');
    this.gameView.classList.remove('active');
    this.gameView.setAttribute('aria-hidden', 'true');
    this.menuView.setAttribute('aria-hidden', 'false');
    this.menu.open(this.mainMenu);
  }

  launchGame(id) {
    const base = this.games.find(g => g.id === id);
    if (!base) return;
    this.activeGame = { ...base };
    this.activeGame.init(this);
    this.menuView.classList.remove('active');
    this.gameView.classList.add('active');
    this.gameView.setAttribute('aria-hidden', 'false');
    this.menuView.setAttribute('aria-hidden', 'true');
    this.updateHeader(this.activeGame.title, 'Esc = Quit  |  R = Restart');
    this.showGameHelp();
  }

  showGameHelp() {
    if (!this.activeGame) return;
    const controls = this.activeGame.controls.map(line => `<li>${line}</li>`).join('');
    this.overlay.innerHTML = `
      <h3>${this.activeGame.title}</h3>
      <p>${this.activeGame.help}</p>
      <ul>${controls}</ul>
      <p class="overlay-actions">Press Enter to start. Esc returns to the menu.</p>
    `;
    this.overlay.classList.remove('hidden');
    this.overlay.dataset.mode = 'help';
  }

  hideOverlay() {
    this.overlay.classList.add('hidden');
    this.overlay.dataset.mode = '';
  }

  restartGame() {
    if (!this.activeGame) return;
    this.activeGame.restart();
    this.showGameHelp();
  }

  handleKeyDown(event) {
    const key = event.key;
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'Enter', 'Escape', 'Backspace'].includes(key)) event.preventDefault();

    if (key === 'm' || key === 'M') {
      this.toggleSound();
      return;
    }
    if (key === 'r' || key === 'R') {
      if (this.activeGame) this.restartGame();
      return;
    }

    this.input.left = key === 'ArrowLeft' ? true : this.input.left;
    this.input.right = key === 'ArrowRight' ? true : this.input.right;
    this.input.up = key === 'ArrowUp' ? true : this.input.up;
    this.input.down = key === 'ArrowDown' ? true : this.input.down;
    if (key === ' ') { this.input.spaceHeld = true; this.input.spacePressed = true; }
    if (key === 'Enter') this.input.enterPressed = true;

    if (this.activeGame) {
      if (!this.overlay.classList.contains('hidden') && (key === 'Enter' || key === ' ')) {
        this.hideOverlay();
        if (this.activeGame.state === 'ready') this.activeGame.state = 'play';
        return;
      }
      if (key === 'Escape' || key === 'Backspace') {
        this.audio.back();
        this.showMenu();
        return;
      }
      if (this.activeGame.onKeyDown(key)) return;
    } else {
      if (key === 'ArrowUp') this.menu.move(-1);
      else if (key === 'ArrowDown') this.menu.move(1);
      else if (key === 'Enter') this.menu.select();
      else if (key === 'Escape' || key === 'Backspace') {
        if (this.menu.back()) this.audio.back();
      }
    }
  }

  handleKeyUp(event) {
    const key = event.key;
    if (key === 'ArrowLeft') this.input.left = false;
    if (key === 'ArrowRight') this.input.right = false;
    if (key === 'ArrowUp') this.input.up = false;
    if (key === 'ArrowDown') this.input.down = false;
    if (key === ' ') this.input.spaceHeld = false;
  }

  loop(now) {
    const dt = Math.min(0.033, (now - this.lastTime) / 1000);
    this.lastTime = now;

    if (this.activeGame && this.overlay.classList.contains('hidden')) {
      this.activeGame.update(dt, this.input);
      this.activeGame.draw(this.ctx);
      const hud = this.activeGame.hud();
      this.gameHud.innerHTML = hud.map(item => `<span>${item}</span>`).join('');
    }

    this.input.enterPressed = false;
    this.input.spacePressed = false;
    requestAnimationFrame(this.loop.bind(this));
  }
}

new App();
