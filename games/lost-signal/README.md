# Lost Signal — Taren Adventure

Lost Signal is a vibe-coded 2.5D cinematic point-and-click adventure game prototype for the Taren project.

## Build 001 — First Playable Foundation
This build establishes the core engine and the first interactive scene.

### Features
- Modular engine: Scene Manager, Hotspot Manager, Inventory, Dialogue, Save System.
- Bilingual support: English and Swedish.
- Local persistence: Progress is saved to `localStorage`.
- Thematic visuals: Subtle fog, vignette, and amber/cyan lighting layers.

### How to Play
1. Click **Start Expedition** on the start screen.
2. You are at the **Old Dock**.
3. **Explore**: Click the "Old Sign" to investigate.
4. **Collect**: Investigating the sign will give you the **Rusty Fuse**.
5. **Inventory**: The fuse appears in the inventory bar at the bottom.
6. **Use Item**: Click the Rusty Fuse in your inventory to select it (it will glow cyan).
7. **Solve Puzzle**: While the fuse is selected, click the **Rusty Fuse Box** to restore power.
8. **Result**: The scene will pulse with cyan light, and the **Locked Signal Door** will now indicate it has power.

### Testing & Debugging
- **Reset Progress**: Use the button on the start screen to clear all saved state and restart.
- **Language**: Toggle between EN and SV using the UI button.
- **Theme**: Switch between Dark and Light modes.

### Technical Structure
- `/engine/`: Core logic components (ES modules).
- `/data/`: Game content defined in JSON files for easy modification.
- `/assets/`: Placeholders for future AI-generated visuals.

### Future Assets
Jimmy, you should generate the following assets to replace placeholders:
1. **Background**: `assets/scenes/dock/background.webp` (16:9, cinematic dock scene).
2. **Character**: `assets/characters/nilo-idle.webp` (Nilo idle pose).
3. **Item**: `assets/items/rusty-fuse.webp` (Inventory icon for the fuse).

See `/docs/asset-pipeline.md` for detailed generation specs.
