# Pebbs 3310 Game Hub

A static HTML5 retro game hub inspired by the feel of early mobile gaming.

It recreates a phone-style menu inside an original retro handset UI and includes 10 playable mini-games rendered with HTML5 Canvas:

1. Snake
2. Pixel Blaster (space shooter)
3. Seed Stores (Mancala-style)
4. Memory Match
5. Quick Draw (reaction game)
6. Puzzle Blocks
7. Spring Hop (bounce-style platformer)
8. Lane Dodge (car dodge racer)
9. Pattern Call (Simon-style memory game)
10. Brick Breaker

## Tech stack

- HTML
- CSS
- Vanilla JavaScript
- HTML5 Canvas
- No backend
- No build step

## Project structure

```text
3310/
  index.html
  styles.css
  vercel.json
  js/
    main.js
    menu.js
    audio.js
    game-utils.js
    games/
      snake.js
      shooter.js
      mancala.js
      memory.js
      reaction.js
      puzzle.js
      platformer.js
      racer.js
      simon.js
      breaker.js
```

## Controls

### Global controls

- Arrow keys = move / navigate
- Enter = select / confirm / primary action
- Space = secondary action
- Escape or Backspace = back / quit to menu
- R = restart current game
- M = mute / unmute

### Per-game notes

- **Snake**: arrows move
- **Pixel Blaster**: arrows move, Enter/Space fires
- **Seed Stores**: left/right chooses pit, Enter sows seeds
- **Memory Match**: arrows move cursor, Enter flips card
- **Quick Draw**: Enter/Space reacts after GO appears
- **Puzzle Blocks**: left/right move, down soft drops, Enter/Space rotates
- **Spring Hop**: left/right move, Enter/Space jumps
- **Lane Dodge**: left/right change lane
- **Pattern Call**: use arrow keys to repeat pattern
- **Brick Breaker**: left/right move bat, Enter launches ball

## Run locally

Because this app uses JavaScript modules, the safest local run method is a tiny static server.

### Option 1 — Python

Step 1 — Open terminal  
Run this in the `3310` folder:

```bash
python3 -m http.server 8000
```

Step 2 — Open the site  
Visit:

```text
http://localhost:8000
```

Expected result: you should see the retro phone UI and be able to play with the keyboard.

### Option 2 — Just open the file

You can try opening `index.html` directly in a browser, but some browsers are stricter with module loading from `file://`. If that fails, use the Python command above.

## Deploy to Vercel

This project is designed to be deployed as its own standalone static site.

### Recommended setup

Step 1 — Push this repo to GitHub  
Make sure the `3310/` folder is committed.

Step 2 — Create a new Vercel project  
In Vercel:
- Click **Add New Project**
- Import this GitHub repo
- Set **Root Directory** to `3310`

Step 3 — Build settings  
Use:
- **Framework Preset**: Other
- **Build Command**: leave empty
- **Output Directory**: leave empty

Step 4 — Deploy  
Vercel will serve the static files directly.

### Assign the custom domain `3310.pebbs.app`

Step 1 — Open the Vercel project settings  
Go to **Settings → Domains**.

Step 2 — Add the domain  
Add:

```text
3310.pebbs.app
```

Step 3 — Update DNS where `pebbs.app` is managed  
Vercel will tell you exactly what DNS record it wants. Usually this is either:
- a CNAME pointing `3310` to Vercel’s target, or
- an A record if Vercel requests one

Expected result: once DNS propagates, the game hub will load at `https://3310.pebbs.app`.

## Notes on copyright and branding

- No official Nokia artwork or game assets are used
- UI chrome, simple pixel art, and sound effects are original
- Some game names are intentionally generic where safer:
  - Pixel Blaster instead of a branded shooter name
  - Seed Stores instead of Bantumi
  - Spring Hop instead of Bounce
  - Pattern Call instead of Simon

## Design goals

- Original retro-inspired visual style
- Keyboard-first gameplay
- Lightweight static deployment
- Clean return to menu from every game
- Simple code layout so it is easy to edit later
