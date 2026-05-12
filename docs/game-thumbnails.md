# Taren Game Thumbnails

This document explains the standard system for game card thumbnails in the Taren platform. Jimmy can easily replace the CSS-based placeholders with generated images by following these instructions.

## 1. Where images live
All game card images should be placed in:
`/assets/images/games/`

## 2. Recommended size
For optimal quality and performance, use:
**1200 x 800 px**  
Aspect ratio: **3:2**

## 3. Recommended format
Use:
**.webp**

*(Note: .jpg and .png can work if necessary, but .webp is highly preferred for web performance.)*

## 4. Naming rule
Use lowercase kebab-case for all image names, matching the exact name of the concept. Do not use spaces or Swedish characters:
- `pulseframe-thumbnail.webp`
- `linebound-thumbnail.webp`
- `memory-drift-thumbnail.webp`
- `static-bloom-thumbnail.webp`
- `void-runner-thumbnail.webp`
- `signal-lost-thumbnail.webp`
- `night-signal-thumbnail.webp`
- `echo-veil-thumbnail.webp`
- `hollow-path-thumbnail.webp`

## 5. How to replace an image
To add or replace a game card image, follow these steps:
1. Create or generate an image at 1200x800 resolution.
2. Save or export the image as `.webp`.
3. Put the file in the `/assets/images/games/` folder.
4. Make sure the filename matches the card's expected name.
5. Open `/games/index.html` and update the `style` attribute on the card's `card-visual` container to point to the new image. Example: `style="--card-image: url('/assets/images/games/signal-lost-thumbnail.webp');"`
6. Refresh the site.

## 6. Fallback behavior
If no image file is assigned (or if it fails to load), the existing CSS concept thumbnail will automatically remain visible as a fallback. 

## 7. AI image prompt guidance
When generating thumbnails using AI tools, keep the Taren identity in mind. Images should feel:
- Dark
- Atmospheric
- Cinematic
- Minimal
- Game-like
- Not text-heavy (no logos or UI text baked into the image)

### Example AI Prompt Template
> "Create a dark cinematic abstract thumbnail for a minimalist browser game called [GAME NAME]. Style: atmospheric, premium, mysterious, violet and cyan accents, subtle glow, no text, no logo, no UI, 3:2 aspect ratio, 1200x800."
