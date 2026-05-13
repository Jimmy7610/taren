# Signal Keeper

Build 99 - A dark 3D signal-defense game built with Three.js, Web Audio API, and HTML5 Canvas.

## Concept
The player protects a glowing signal core in the center of a dark digital void. Incoming signals travel toward the core. The player controls a rotating shield/opening around the core. Good signals should be allowed through. Corrupt signals should be blocked.

## Technical Notes
- **Three.js**: Loaded via CDN (`https://unpkg.com/three@0.160.0/build/three.module.js`). This keeps the repository lightweight and static-site friendly.
- **Web Audio API**: Audio is synthesized dynamically. Starts only after user interaction.
- **Canvas 2D**: Used as an overlay for scanlines and HUD effects.

## Controls
- **Mouse / Touch**: Rotate shield gap
- **A/D / Arrows**: Rotate shield gap
- **Space**: Trigger pulse shield
