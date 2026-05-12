# Taren

Taren is a collection of 22 small, quiet, and atmospheric games.

### Playable Games (22)
- **Ashveil**: Logic / Minesweeper-style.
- **Nightcoil**: Arcade / Snake-style classic.
- **Coreloom**: Puzzle / 2048-style merge classic.
- **Pulse Duel**: Duel / Pong-style classic.
- **Veil Patience**: Cards / Patience-style classic.
- **Lumen Sequence**: Memory / sequence classic.
- **Crosshush**: Timing / crossing classic.
- **Voidbreaker**: Arcade / breaker game.
- **Fourfold**: Strategy / connect-four style.
- **Tetrafall**: Puzzle / falling block.
- **Pulseframe**: Reflex / avoid-and-collect.
- **Linebound**: Strategy / dots-and-boxes.
- **Memory Drift**: Memory / sequence recall.
- **Static Bloom**: Puzzle / chain reaction.
- **Void Runner**: Arcade / side-scroller.
- **Signal Lost**: Mystery / exploration.
- **Night Signal**: Timing / reaction.
- **Echo Veil**: Memory / reveal-and-match.
- **Hollow Path**: Exploration / path-finding.
- **Echo Hollow**: Maze / signal gathering.
- **Shardrift**: Arcade / fragment breaking.
- **Night Array**: Defense / pattern hold.

### Site Structure
- `/` — Homepage / Landing
- `/games/` — Game gallery and selection
- `/about/` — Project information and philosophy
- `/games/ashveil/`
- `/games/pulseframe/`
- `/games/linebound/`
- `/games/memory-drift/`
- `/games/static-bloom/`
- `/games/void-runner/`
- `/games/signal-lost/`
- `/games/night-signal/`
- `/games/echo-veil/`
- `/games/hollow-path/`

## Technical Rules
To maintain the Taren identity and simplicity, all development must follow these rules:
- **No Frameworks:** Do not use React, Vue, Svelte, or similar.
- **No Build Steps:** No Vite, Webpack, or npm build commands. The site runs as-is.
- **No Dependencies:** No external libraries or APIs. Pure vanilla HTML, CSS, and JS.
- **Isolation:** Every game must be fully isolated in its own folder. Shared logic is discouraged to keep games modular.
- **No-Scroll Target:** Game pages should ideally fit within one desktop/laptop viewport without vertical scrolling.
- **Help Panels:** Each game includes a short "How to play" panel. On desktop, it appears to the right; on mobile, it stacks below.

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
