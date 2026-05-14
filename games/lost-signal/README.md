# Lost Signal — Den dag Taren ringde tillbaka

Lost Signal is a cinematic first-person point-and-click adventure set in the mysterious world of Taren.

## Build 001 — Foundation Rebuild
This is a clean restart of the game engine and design.

### Demo Scope: "Stationen vaknar"
1. **The Old Pier**: Arrive and find the necessary tools.
2. **Station Exterior**: Repair the fuse box and unlock the door.
3. **Control Room**: Discover the first signal and explore the heart of the station.

### How to Run Locally
1. Serve the Taren root directory using a local web server (e.g., `npx serve .`).
2. Navigate to `/games/lost-signal/`.

### Interaction
- **Look**: Hover over objects to see names. Click to examine.
- **Inventory**: Items appear in the sidebar. Click to select, then click on a scene object to use.
- **Combine**: Special "Clean Fuse" button appears when you have both the Rusty Fuse and the Rag.

### Asset Guidelines
- **Scene Images Path**: `games/lost-signal/assets/images/scenes/`
- **Expected Filenames**:
  - `scene-01-old-pier.webp`
  - `scene-02-station-exterior.webp`
  - `scene-03-control-room.webp`
- **Specifications**: 1920x1080 px (16:9), WebP format.
- **Hotspots**: Coordinates are currently temporary and optimized for testing. They will be refined using the Hotspot Editor tool once background art is finalized.

### Thumbnails
- **Path**: `/games/lost-signal/assets/ui/thumbnail.webp`
- **Size**: 600x400 px recommended.
- **Replacement**: Replace the placeholder image in the path above.

## Development Status
Current Build: 001
- Clean POV engine implemented.
- First 3 scenes defined.
- Inventory and basic puzzle logic active.
- Bilingual support (EN/SV) active.
