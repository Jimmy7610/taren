# Taren

Taren is a quiet collection of small browser games built with vanilla HTML/CSS/JS. It prioritizes a dark, minimal, atmospheric, and premium experience.

## Current Playable Games
- **Pulseframe** — Reflex / survival gameplay.
- **Linebound** — Strategic grid-based gameplay.
- **Memory Drift** — Calm memory and pattern recall.

## Site Structure
- `/` — Homepage / Landing
- `/games/` — Game gallery and selection
- `/about/` — Project information and philosophy
- `/games/pulseframe/` — Pulseframe game folder
- `/games/linebound/` — Linebound game folder
- `/games/memory-drift/` — Memory Drift game folder

## Technical Rules
To maintain the Taren identity and simplicity, all development must follow these rules:
- **No Frameworks:** Do not use React, Vue, Svelte, or similar.
- **No Build Steps:** No Vite, Webpack, or npm build commands. The site runs as-is.
- **No Dependencies:** No external libraries or APIs. Pure vanilla HTML, CSS, and JS.
- **Isolation:** Every game must be fully isolated in its own folder. Shared logic is discouraged to keep games modular.
- **No-Scroll Target:** Game pages should ideally fit within one desktop/laptop viewport without vertical scrolling.

## Build Badge
A small build badge is displayed in the top-right corner of every page.
- This allows Jimmy to verify that the live deployed site matches the latest pushed code.
- **Before every push:** You MUST increase the `window.TAREN_BUILD_NUMBER` value by 1 in `/assets/js/build.js`.

## Game Thumbnails
Game cards in the gallery use a standardized thumbnail system.
- **Location:** `/assets/images/games/`
- **Preferred Format:** `.webp`
- **Recommended Size:** 1200x800 px (3:2 ratio)
- **Guide:** See `/docs/game-thumbnails.md` for full instructions.

## Tweakable Settings (INSTÄLLNING)
The project uses a simple way to expose tweakable parameters.
- Search for the keyword `INSTÄLLNING` in VS Code to find safe values to change (colors, speeds, sizes, volumes).
- All future games must use `INSTÄLLNING -` comments for any value intended to be adjusted later.

## Deployment
Deployed via Cloudflare Pages from the `main` branch.
