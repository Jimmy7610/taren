# Lumen Coil

Build 104 - A dark arena-survival game built with HTML5 Canvas and Web Audio API.

## Concept
Guide a glowing lumen coil through the void. Collect light fragments to grow and gain score. Avoid red corrupt shards and do not leave the arena. You are allowed to pass through your own tail. Survive as long as possible while the intensity increases.

## Controls
- **Mouse / Touch**: Steer the head of the coil toward the pointer.
- **Keyboard**: Use WASD or Arrow Keys to steer.
- **Space**: Trigger a Lumen Pulse to repel nearby corrupt shards (cooldown applies).

## Rules
- **Cyan Fragments**: Standard growth and points.
- **Amber Fragments**: Rare bonus points.
- **Red Shards**: Instant game over upon collision.
- **Self-Collision**: Disabled. You can safely cross your own coil.
- **Boundary**: Instant game over if leaving the arena.

## Settings
Editable values in `game.js`:
- `startSpeed`: Initial movement speed.
- `maxSpeed`: Maximum movement speed.
- `growAmount`: Segments added per fragment.
- `difficultyRamp`: Rate at which speed and shard count increases.

## Assets
- **Thumbnail**: `lumen-coil.webp` (placeholder recommended for local testing).
- **Audio**: Dynamically synthesized using Web Audio API. No external files.
