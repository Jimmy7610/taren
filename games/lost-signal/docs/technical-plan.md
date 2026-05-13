# Lost Signal — Technical Plan

## Modular Architecture
The game is built using a component-based modular architecture to ensure scalability and isolation.

### Core Modules
- **SceneManager**: Handles background rendering and switching.
- **HotspotManager**: Manages interactive areas using percentage coordinates for responsive positioning.
- **Inventory**: Tracks player items and handles item selection/usage logic.
- **Dialogue**: A lightweight messaging system for narrative delivery.
- **SaveSystem**: Simple `localStorage` integration for progress persistence.
- **LanguageSystem**: Dynamic JSON loading for English and Swedish support.
- **PlayerManager**: Handles movement, depth-scaling, and direction.

## Why Percentage Coordinates?
Using percentage-based values (`left: 20%; top: 40%`) allows the hotspots and character markers to remain correctly positioned regardless of the screen size, as long as the 16:9 aspect ratio is maintained in the viewport.

## Asset Loading & Cache Busting
Visual assets are loaded using relative paths from the game root (`/games/lost-signal/`).
- **Standard Path Format**: `assets/[category]/[file].webp`
- **Cache Busting**: Assets are appended with a version query (e.g., `?v=115`) to ensure updates are reflected immediately during development.
- **Fallbacks**: If a file is missing, the engine falls back to CSS-based placeholders (solid colors/gradients) or hides the image layer to maintain playability.
