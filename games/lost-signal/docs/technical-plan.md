# Lost Signal — Technical Plan (POV Mode)

## POV Architecture
The game uses a first-person POV (Point-of-View) architecture, focusing on direct interaction with a responsive 16:9 scene stage.

### Core Modules
- **SceneManager**: Handles background rendering and aspect ratio management.
- **HotspotManager**: Manages interaction areas using percentage-based coordinates (0-100).
- **Inventory**: Handles item collection and usage.
- **Dialogue**: Cinematic text delivery system.

## Responsive Coordinate System
To ensure hotspots remain accurate on all devices, the game uses a relative percentage system:
- **Scene Stage**: A dedicated element with `aspect-ratio: 16 / 9`.
- **Calculations**: `x = (offsetX / width) * 100`, `y = (offsetY / height) * 100`.
- **Absolute Positioning**: Hotspots are placed using `left: x%`, `top: y%`, `width: w%`, `height: h%`.

## Calibration Workflow
Jimmy can use the built-in Debug tools to maintain the game:
1. **Toggle Debug**: Activates the calibration overlay.
2. **Draw Hotspot**: Allows drawing rectangular areas.
3. **JSON Export**: Provides ready-to-use snippets for `scenes.json`.

## Asset Pipeline
- **Backgrounds**: Must be 16:9 for best results.
- **Formats**: `.webp` or `.png`.
- **Cache Busting**: Versioning handled via `game.buildVersion`.
