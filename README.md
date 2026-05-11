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

Every future game must be isolated in its own folder under `/games/game-name/`. 
No game code should ever be loaded on the main page or games index page. If one future game breaks, no other page or game is affected.

## Deployment

The site is deployed automatically through Cloudflare Pages from the `main` branch. Since it is entirely static, no build commands or package managers are required.
