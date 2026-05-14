# Lost Signal — Asset Pipeline

This document explains how to create and integrate AI-generated visual assets for Lost Signal.

## 1. Scene Backgrounds
Scenes are the core of the 2.5D experience.

- **Aspect Ratio**: **Strictly 16:9** is recommended for easiest calibration.
- **Resolution**: 1920x1080 px recommended.
- **Format**: `.webp` preferred (lossless or high quality).
- **Composition Rules**:
    - **POV Focus**: Backgrounds should be designed from a first-person perspective.
    - **Interactive Objects**: Ensure objects like the "Fuse Box" or "Doors" are clearly visible and match the perspective.
- **Storage**: Save to `/games/lost-signal/assets/scenes/[scene-id]/background.webp`.

## 1.1 VFX Overlays (Optional but Recommended)
To add more depth, you can create separate transparent layers:
- **Fog Overlay**: A transparent webp with soft mist or fog. Save as `fog.webp` in the scene folder.
- **Signal Glow**: A transparent webp with specific glowing cyan elements. Save as `signal-glow.webp` in the scene folder.

## 2. Character Sprites
Nilo and other characters are layered on top of the scene.

- **Resolution**: Height around 500-800 px.
- **Format**: `.webp` preferred, but `.png` is supported as fallback for transparency issues.
- **Transparency**: Assets must have real alpha transparency. 
    - **Checkerboard Warning**: If you see a grey/white checkerboard in-game, it means the checkerboard is "baked" into the pixels. Ensure you export with a transparent background.
- **Cropping**: Tightly crop the image around the character. Avoid large empty spaces in the canvas.
- **Resolution**: Height around 512x768 or 768x1024 px.
- **Storage**: 
    - `/games/lost-signal/assets/characters/[id]-idle.webp` (or `.png`)
    - `/games/lost-signal/assets/characters/[id]-side-idle.webp` (or `.png`)

## 3. Inventory Items
Icons for the items collected.

- **Aspect Ratio**: 1:1 (Square).
- **Resolution**: 256x256 px.
- **Format**: `.webp` or `.png`.
- **Style**: Clear, recognizable representation of the object.
- **Storage**: Save to `/games/lost-signal/assets/items/[item-id].webp`.

## 4. UI Elements
Frames, buttons, and icons.

- Matches the Amber/Cyan sci-fi aesthetic.
- Store in `/games/lost-signal/assets/ui/`.

## Suggested AI Prompt Template
> "Cinematic 2.5D adventure game background, [SCENE DESCRIPTION], mysterious atmosphere, dark environment with warm amber lighting and subtle cyan glowing technological signals, 1920x1080, high detail, no people, no text, concept art style."
