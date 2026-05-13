# Echo Miner

Build 106 - Core Prototype

## Concept
Echo Miner is a dark sci-fi underground exploration game. You control a mining rig descending into crystal caves to extract luminous blue resources. Success requires careful management of life-support systems (Oxygen) and power (Energy) while navigating the increasing darkness of the deep.

## Core Loop
1. **Prepare**: Start at the Garage Facility base.
2. **Explore**: Maneuver the rig through the cave using WASD or Arrow keys.
3. **Mine**: Collect glowing crystals to gather resources.
4. **Survive**: Monitor gauges. Darkness increases with depth, draining systems faster.
5. **Extract**: Return to the surface (Garage Access Point) to secure your findings.

## Controls
- **WASD / Arrow Keys**: Move the mining rig.
- **Surface Return**: Move to the top of the map (y < 50) to end expedition successfully.

## Settings
Tweakable in `game.js`:
- `roverSpeed`: Movement agility.
- `oxygenDrainRate`: Survival difficulty.
- `darknessRamp`: How quickly visibility drops with depth.

## Build 106 Scope
- Functional exploration loop.
- Dynamic darkness and lighting (spotlight).
- Crystal collection and resource tracking.
- Persistent best stats (Depth, Resources).
- Base menu with placeholder upgrades.

## Future Assets
- Thumbnail: `echo-miner.webp` (1280x720)
