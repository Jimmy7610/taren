# Taren Game Standard

This document outlines the strict rules and guidelines for developing and adding new games to the Taren gallery. Taren is built on the philosophy of stability, isolation, and vanilla web technologies.

## Core Rules

- **Curated Experience:** Taren games must be small, polished, and atmospheric browser experiences.
- **Strict Isolation:** Every game must live entirely in its own folder under `/games/game-name/`. 
- **Required Files:** Every game must have its own isolated:
  - `index.html`
  - `style.css`
  - `game.js`
- **Zero Cross-Contamination:** No game may depend on another game. No game may load another game's scripts. If one game breaks, the rest of the Taren site must continue to function perfectly.
- **Global UI Integration:** Games must use the global Taren navbar and shared Taren design language (`/assets/css/global.css`) where appropriate.
- **Minimalism:** Keep game UI minimal but clear. Gameplay should remain readable and avoid feature creep.
- **Vanilla Only:** Use pure vanilla HTML, CSS, and JavaScript. 
  - **Do NOT add external dependencies.**
  - **Do NOT add frameworks (React, Vue, etc.).**
  - **Do NOT add a build process (Vite, Webpack, etc.).**
- **Performance:** Use `requestAnimationFrame` for game loops to ensure 60fps performance and avoid draining background resources.
- **Data Persistence:** Store per-game `localStorage` keys with the specific game name included (e.g., `gamename_best_score`).

## Tweakable Parameters

Any tweakable game parameter (in CSS or JS) must have a comment starting exactly with:
`INSTÄLLNING -`

This allows developers (like Jimmy) to search for `"INSTÄLLNING"` globally in VS Code and quickly find safe values to test without breaking the underlying logic.

### Examples of Good Comments:

**JavaScript (`game.js`)**
```javascript
const PLAYER_SPEED = 0.16; // INSTÄLLNING - Ändra hur snabbt spelaren rör sig. Högre värde = snabbare rörelse.
const ENEMY_RADIUS = 18; // INSTÄLLNING - Ändra fiendens storlek. Högre värde = större och svårare att undvika.
```

**CSS (`style.css`)**
```css
--template-accent: #8b6cff; /* INSTÄLLNING - Ändra accentfärgen för just detta spel. */
```

## A Note on Pulseframe

Pulseframe is the first fully playable game in the gallery and serves as a strong reference for "game feel" and polish. However, **future games should not copy its logic directly unless necessary**. Each game should be uniquely built for its own mechanics using the `/templates/game-template/`.
