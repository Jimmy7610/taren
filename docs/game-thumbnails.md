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

*(Note: `.jpg` and `.png` can work if necessary, but `.webp` is highly preferred for web performance.)*

## 4. Naming rule
Use lowercase kebab-case for all image names, matching the exact name of the concept. Do not use spaces or Swedish characters:
- `linebound-thumbnail.webp`
- `pulseframe-thumbnail.webp`
- `void-runner-thumbnail.webp`

## 5. How to replace an image
To add or replace a game card image, follow these steps:
1. Create or generate an image at 1200x800 resolution.
2. Save or export the image as `.webp`.
3. Put the file in the `/assets/images/games/` folder.
4. Make sure the filename matches the card's expected name (e.g., `signal-lost-thumbnail.webp`).
5. Open `/games/index.html` and update the `style` attribute on the card's `card-visual` container to point to the new image. Example: `style="--card-image: url('/assets/images/games/signal-lost-thumbnail.webp');"`
6. Refresh the site.
7. If the live site does not update, verify the file path or check the build number/cache.

## 6. How a new game should be added
For a completely new game:
1. Create its dedicated folder: `/games/new-game/`
2. Create its image: `/assets/images/games/new-game-thumbnail.webp`
3. Add the HTML card to `/games/index.html`.
4. Connect the card visual to the new image path using the inline `--card-image` variable.

## 7. Fallback behavior
If no image file is assigned (or if it fails to load), the existing CSS concept thumbnail will automatically remain visible as a fallback. 

## 8. AI image prompt guidance
When generating thumbnails using AI tools, keep the Taren identity in mind. Images should feel:
- Dark
- Atmospheric
- Cinematic
- Minimal
- Game-like
- Not text-heavy (no logos or UI text baked into the image)

### Example AI Prompt Template
You can use this template to generate consistent concepts:
> "Create a dark cinematic abstract thumbnail for a minimalist browser game called [GAME NAME]. Style: atmospheric, premium, mysterious, violet and cyan accents, subtle glow, no text, no logo, no UI, 3:2 aspect ratio, 1200x800."
