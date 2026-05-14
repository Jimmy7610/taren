# Lost Signal - Hotspot Editor

A dedicated visual tool for placing accurate clickable hotspot coordinates for the Lost Signal game scenes.

## Purpose
This tool allows Jimmy to load scene background images and visually define rectangular hotspots. It handles the conversion between pixel coordinates and responsive percentage coordinates, which is essential for the game's flexible 16:9 architecture.

## Location
`experiments/lost-signal-hotspot-editor/`

## How to use
1. **Open the tool**: Open `index.html` in a modern browser.
2. **Load an image**: Click "Load Image" and select a scene background (recommended: 1920x1080, 16:9 ratio).
3. **Define a hotspot**: Click and drag on the image to create a rectangle.
4. **Edit details**: Select a hotspot to rename its ID, adjust labels (English/Swedish), or fine-tune its position and size in the sidebar.
5. **Export**: Copy the JSON from the "Output" area or download it as a file.

## Features
- **Visual Editing**: Drag to create, move, and resize with corner handles.
- **Dual Coordinates**: Automatically calculates both absolute pixels and percentage values.
- **Hotspot Management**: Duplicate, delete, or clear all hotspots.
- **Persistence**: Your work is automatically saved in `localStorage` so you don't lose progress on refresh.
- **Import/Export**: Easily import existing JSON data to continue editing.

## Integration
The "Game Array" tab in the Output area provides a simplified array format that can be pasted directly into `scenes.js` for the game loop.

### Sample JSON Format
```json
{
  "sceneId": "scene-01-old-pier",
  "image": "scene-01-old-pier.webp",
  "imageWidth": 1920,
  "imageHeight": 1080,
  "hotspots": [
    {
      "id": "toolbox",
      "label": { "en": "Toolbox", "sv": "Verktygslåda" },
      "shape": "rect",
      "x": 210,
      "y": 670,
      "width": 180,
      "height": 120,
      "xPercent": 10.94,
      "yPercent": 62.04,
      "widthPercent": 9.38,
      "heightPercent": 11.11
    }
  ]
}
```

## Maintenance
All adjustable parameters are marked with `INSTÄLLNING -` in the code for easy tweaking.
- `HANDLE_SIZE`: Size of the drag handles.
- `MIN_SIZE`: Minimum allowed width/height.
- `DEFAULT_HOTSPOT_ID_PREFIX`: Prefix for auto-generated IDs.

---
*Taren Internal Tools*
