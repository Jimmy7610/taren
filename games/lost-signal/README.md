# Lost Signal — Taren Adventure

Lost Signal is a vibe-coded 2.5D cinematic point-and-click adventure game prototype for the Taren project.

## Build 002 — Movement + Real Assets
This build connects real AI-generated assets and implements a point-and-click movement system.

### New Features
- **Player Movement**: Click any walkable area to move Nilo smoothly across the scene.
- **Walk Area**: A defined traversable zone for the Dock scene.
- **Hotspot Walk-to**: Nilo now walks to the correct position before interacting with objects.
- **Depth Scaling**: Nilo automatically scales based on vertical position to simulate distance.
- **Debug Mode**: A new tool for Jimmy to align hotspots and walk areas on new backgrounds.
- **Real Assets Support**: Automatic loading of `background.webp`, `nilo-idle.webp`, `fog.webp`, etc.

### How to Play
1. Click **Start Expedition**.
2. **Move**: Click the ground to move Nilo. He will walk toward your click.
3. **Interact**: Click hotspots (Sign, Fuse Box, Door). Nilo will walk to them before the action triggers.
4. **Debug**: Toggle **Debug** at the bottom to see coordinate overlays and walkable areas.

### Debug Mode Helper
- Click **Debug** to toggle the development overlay.
- Green area = Walkable zone.
- Red boxes = Interaction hotspots.
- Green dots = Walk-to positions.
- **Coordinate Picker**: Click anywhere on the scene in Debug mode to see the `x/y` percentage. Use the **Copy** button to grab the values for `scenes.json`.
