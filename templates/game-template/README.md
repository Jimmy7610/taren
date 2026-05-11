# Taren Game Template

This folder contains the minimal, strict setup for any new Taren game. It is not linked on the public website.

## How to build a new game

1. **Duplicate this folder**: Copy the entire `/templates/game-template/` directory and paste it into `/games/` with your new game name (e.g. `/games/new-game-name/`).
2. **Rename Content**: Open `index.html` in your new folder and change the `<title>`, the `<h1>`, and the description.
3. **Keep Logic Isolated**: Write all your logic inside `game.js`. **Never** import or load another game's `game.js`.
4. **Link It**: Add your new game manually to the HTML grid in `/games/index.html`.
5. **Add INSTÄLLNING Comments**: Whenever you hardcode a number that dictates game feel (speed, size, volume, timers), pull it up into the `SETTINGS` object at the top of `game.js` and add a Swedish comment starting with `INSTÄLLNING -`.

Read the full architecture rules in `/docs/game-standard.md`.
