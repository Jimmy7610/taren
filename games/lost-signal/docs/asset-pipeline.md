# Lost Signal — Asset Pipeline

This document explains how to create and integrate AI-generated visual assets for Lost Signal.

## 1. Scene Backgrounds
Scenes are the core of the 2.5D experience.

- **Aspect Ratio**: 16:9
- **Resolution**: 1920x1080 px recommended.
- **Format**: `.webp` preferred (lossless or high quality).
- **Composition Rules**:
    - **No Characters**: Do not include Nilo or NPCs in the base background.
    - **Walkable Ground**: Keep the bottom 20-30% of the image clear for character movement.
    - **Interactive Objects**: Ensure objects like the "Fuse Box" or "Doors" are clearly visible but integrated into the environment.
    - **Mood**: Cinematic, mysterious, atmospheric. Use the "Amber/Cyan" theme.
- **Storage**: Save to `/games/lost-signal/assets/scenes/[scene-id]/background.webp`.

## 1.1 VFX Overlays (Optional but Recommended)
To add more depth, you can create separate transparent layers:
- **Fog Overlay**: A transparent webp with soft mist or fog. Save as `fog.webp` in the scene folder.
- **Signal Glow**: A transparent webp with specific glowing cyan elements. Save as `signal-glow.webp` in the scene folder.

## 2. Character Sprites
Nilo and other characters are layered on top of the scene.

- **Resolution**: Height around 500-800 px.
- **Format**: `.webp` with transparency (Alpha channel).
- **Style**: Stylized, matching the environment but slightly more defined.
- **Poses**: Create a neutral "Idle" pose first.
- **Storage**: Save to `/games/lost-signal/assets/characters/[char-id]-idle.webp`.

## 3. Inventory Items
Icons for the items collected.

- **Aspect Ratio**: 1:1 (Square).
- **Resolution**: 256x256 px.
- **Format**: `.webp` with transparency.
- **Style**: Clear, recognizable representation of the object.
- **Storage**: Save to `/games/lost-signal/assets/items/[item-id].webp`.

## 4. UI Elements
Frames, buttons, and icons.

- Matches the Amber/Cyan sci-fi aesthetic.
- Store in `/games/lost-signal/assets/ui/`.

## Suggested AI Prompt Template
> "Cinematic 2.5D adventure game background, [SCENE DESCRIPTION], mysterious atmosphere, dark environment with warm amber lighting and subtle cyan glowing technological signals, 1920x1080, high detail, no people, no text, concept art style."
