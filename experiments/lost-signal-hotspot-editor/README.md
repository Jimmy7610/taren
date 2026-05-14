# Lost Signal - Hotspot Editor

A dedicated visual tool for placing accurate clickable hotspot coordinates for the Lost Signal game scenes.

## Purpose
This tool allows Jimmy to load scene background images and visually define rectangular hotspots. It handles the conversion between pixel coordinates and responsive percentage coordinates, which is essential for the game's flexible 16:9 architecture.

## Location
`experiments/lost-signal-hotspot-editor/`

## How to use
1. **Open the tool**: Open `index.html` in a modern browser.
2. **Load an image**: Click "Load Image" and select a scene background.
3. **Select Mode**: Use the "Creation Mode" toggle in the sidebar to choose between **Rectangle** or **Polygon**.

### Rectangle Hotspots (Default)
- **Create**: Click and drag on the image.
- **Edit**: Click to select, then drag corner handles to resize or the center to move.

### Polygon Hotspots
- **Create**: Click individual points on the image to define vertices. A dashed preview line shows the next segment.
- **Finish**: Press **Enter**, click the **"Finish Polygon"** button, or double-click to close the shape. Polygons must have at least 3 points.
- **Cancel**: Press **Escape** to discard the current polygon being drawn.
- **Edit**: Select the polygon to see its vertex handles. Drag individual points to reshape, or drag the shape itself to move it.
- **When to use**: Ideal for angled or irregular objects like the loose plank on the pier, winding cables, or perspective-heavy doorways.

4. **Edit details**: Select a hotspot to rename its ID, adjust labels (English/Swedish), or fine-tune its position in the sidebar.
5. **Export**: Copy the JSON from the "Output" area or download it as a file.

## Starting a new scene safely
To prevent accidental data loss, the editor includes several safety features:
- **Export first**: Always export or download your JSON before loading a new image or starting a new scene.
- **Confirmation dialogs**: The editor will ask for confirmation before clearing existing hotspots when you load a new image or import JSON. Choosing **No** keeps your current work.
- **New Scene / Clear**: Use the "New Scene / Clear" button in the header to start fresh. This will clear all hotspots but keep the current image.
- **Unsaved changes indicator**: A small "● Unsaved changes" indicator appears in the header when you have made modifications. It clears after you click **Copy** or **Download**.
- **Browser protection**: If you have unsaved changes, the browser will warn you before you reload or close the page.

## Features
- **Project Safety**: Confirmation dialogs and unsaved work indicators to prevent data loss.
- **Visual Editing**: Drag to create, move, and reshape with handles.
- **Shape Support**: Both simple rectangles and complex polygons.
- **Dual Coordinates**: Calculates absolute pixels and responsive percentage values.
- **Hit Testing**: Click anywhere inside a polygon to select it.
- **Persistence**: Work is auto-saved in `localStorage`.
- **Import/Export**: Supports both rect and polygon formats.

## Integration
The "Game Array" tab provides a simplified format. Percent coordinates are relative to the 16:9 stage (0-100%).

### Sample JSON Format
```json
{
  "id": "loose_plank",
  "label": { "en": "Loose Plank", "sv": "Lös planka" },
  "shape": "polygon",
  "points": [
    { "x": 345, "y": 605 },
    { "x": 890, "y": 638 },
    { "x": 885, "y": 742 },
    { "x": 320, "y": 705 }
  ],
  "pointsPercent": [
    { "x": 25.07, "y": 78.78 },
    { "x": 64.68, "y": 83.07 },
    { "x": 64.32, "y": 96.61 },
    { "x": 23.26, "y": 91.80 }
  ]
}
```

## Maintenance
All adjustable parameters are marked with `INSTÄLLNING -` in the code for easy tweaking.
- `HANDLE_SIZE`: Size of the rect drag handles.
- `POLYGON_POINT_RADIUS`: Size of the polygon vertex handles.
- `POLYGON_FILL_ALPHA`: Opacity of the polygon fill.

---
*Taren Internal Tools*
