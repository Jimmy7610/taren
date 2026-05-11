# Taren Game Standard

This document outlines the rules and guidelines for developing and adding new games to the Taren platform. Taren is built on the philosophy of stability, isolation, and vanilla web technologies.

## Core Rules

- **Curated Experience:** Taren games must be small, polished, and atmospheric browser experiences.
- **Strict Isolation:** Every game must live entirely in its own folder under `/games/game-name/`. 
- **Required Files:** Every game must have its own isolated:
  - `index.html`
  - `style.css`
  - `game.js`
- **Zero Cross-Contamination:** No game may depend on another game. No game may load another game's scripts. If one game breaks, the rest of the Taren site must continue to function perfectly.
- **Global UI Integration:** Games must use the global Taren navbar and shared Taren design language (`/assets/css/global.css`) where appropriate.
- **No-Scroll Layout:** On desktop/laptop screens, game pages should ideally fit within the viewport height (`100vh`) without requiring vertical scrolling. Use viewport-aware CSS (like `calc(100vh - 200px)`) to size game boards.
- **In-Game Help:** Every game MUST include a "How to play" panel. On desktop, this should sit to the right of the game area. Use the shared classes `.game-play-layout`, `.game-main-column`, and `.game-help-panel` for consistency.
- **Minimalism:** Keep game UI minimal but clear. Gameplay should remain readable and avoid feature creep.
- **Vanilla Only:** Use pure vanilla HTML, CSS, and JavaScript. 
  - **Do NOT add external dependencies.**
  - **Do NOT add frameworks (React, Vue, etc.).**
  - **Do NOT add a build process (Vite, Webpack, etc.).**
- **Performance:** Use `requestAnimationFrame` for game loops to ensure smooth performance.
- **Data Persistence:** Store per-game `localStorage` keys with the specific game name included (e.g., `taren_memory_drift_best`).

## Adventure Standard (Build 23+)

For larger adventure-style games (like *The Lantern Below*), these additional standards apply:
- **Multi-Room System:** Use a clear data-driven room structure.
- **Interaction Key:** Use **E** as the standardized interaction key for runes, machines, and gates.
- **Status Overlay:** Use a non-intrusive bottom-center status message for immediate interaction feedback.
- **Transition Padding:** Ensure the player is placed far enough from a transition point in the new room to prevent accidental re-entry loops.

## Tweakable Parameters

Any tweakable game parameter (in CSS or JS) must have a comment starting exactly with:
`INSTÄLLNING -`

This allows developers (like Jimmy) to search for `"INSTÄLLNING"` globally in VS Code and quickly find safe values to test.

## Build Versioning

All pages load `/assets/js/build.js` to display the current build badge in the top-right corner. 
Before pushing updates to `main`, increment the `window.TAREN_BUILD_NUMBER` in that file.

## Thumbnail System

Every playable game must have a thumbnail image in `/assets/images/games/` following the naming rule `game-name-thumbnail.webp`. Card visuals are connected via the `--card-image` CSS variable in `/games/index.html`.

## Reference Games

- **The Lantern Below:** Reference for multi-room adventure, interaction patterns, and lighting systems.
- **Pulseframe:** Reference for high-polish reflex and survival feel.
- **Linebound:** Reference for tactical, grid-based strategy and Computer turn logic.
- **Memory Drift:** Reference for calm, atmospheric pattern recall.
