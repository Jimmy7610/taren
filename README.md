# Taren

Taren is a dark, atmospheric, minimal, curated indie browser-game gallery.

## Architecture

This is a clean, static website built using only **vanilla HTML, CSS, and JavaScript**. 
There are no build dependencies, no frameworks (no React, no Vue), and no bundlers (no Vite).

The core structure is:
- `/index.html` (Landing)
- `/games/index.html` (Gallery)
- `/about/index.html` (About)
- `/assets/css/global.css` (Shared styling)
- `/assets/js/main.js` (Minimal UI enhancements)

## Adding New Games

- Use `/templates/game-template/` as your starting point.
- Copy it into `/games/game-name/`.
- Add a card manually in `/games/index.html`.
- Keep each game completely isolated from others.
- Search for `INSTÄLLNING` in the new game's code to find safe values to tweak.

For more details on the architectural rules for games, read `/docs/game-standard.md`.

## Deployment

The site is deployed automatically through Cloudflare Pages from the `main` branch. Since it is entirely static, no build commands or package managers are required.
