# Taren Game Mobile Standard

This document defines the official Taren mobile standard for games. All new games must follow these rules, and existing games will gradually be updated to comply.

## 1. Core Rules
- **Playability First:** Every game must be playable on mobile devices.
- **Touch Support:** Every game must support touch controls natively (minimum touch target size ~44px).
- **Unobstructed View:** No permanent sidebar may cover or shrink the game area on small screens.
- **Collapsible UI:** On mobile, side panels (inventory, debug, settings) must collapse into bottom sheets, drawers, tabs, or modal panels.
- **Visual Priority:** Gameplay must always remain the visual priority.
- **Debug Tools:** Must be hidden by default on mobile and easy to close. Never force-opened.
- **Exit/Back:** Every game must have a clear exit/back button leading back to the Taren gallery.
- **Focus Mode:** Every game should have a focus/fullscreen-style mode where the game gets maximum screen space.

## 2. Layout Rules
**Desktop:**
- Games may use a sidebar + game area layout.
- Debug tools may use a side/bottom panel.
- Inventory may use a sidebar or bottom bar.

**Tablet:**
- The game area should remain central and as large as possible.
- Sidebars should become collapsible if screen space is limited.

**Mobile Portrait:**
- Game scene must be full width.
- UI elements must be placed *below* the game scene or hidden in collapsible panels.
- Fixed sidebars are forbidden.
- Bottom controls must not cover important game content.

**Mobile Landscape:**
- Game scene must use as much screen space as possible.
- Controls may appear as compact overlay buttons.
- Panels must be collapsible.

## 3. Safe-Area Rules
- Respect iPhone and modern Android safe areas using `env(safe-area-inset-*)`.
- Avoid placing controls behind browser bars or notches.
- Avoid full-height layouts (`100vh` without safe-area consideration) that cause important buttons to disappear. Use `100svh` where possible, or allow scrolling for UI.

## 4. Overlay Rules
- Dialog/text boxes must not permanently block gameplay.
- Use compact bottom dialogue boxes on mobile.
- Use close/minimize buttons where needed.
- Popup windows must fit small screens.

## 5. Coordinate Rules for POV/Scene Games (e.g. Lost Signal)
- Coordinates must be relative to the actual scene stage, not the viewport.
- Use percentages (0–100%) or `getBoundingClientRect()` for math.
- Do not base coordinates on the raw window/document size.
- Avoid `background-size: cover` if it breaks hotspot alignment on extreme aspect ratios; prefer a stable 16:9 scene stage with letterboxing if necessary.

## 6. Games requiring follow-up mobile fixes
The following classic games were built prior to the Taren Mobile Standard and need to be audited and updated to use `game-shell.css`:
- Lumen Coil
- Echo Miner
- Signal Breach
- Void Runner
- Neon Drift
- Aether Hook
- Crystal Guard
- Pulse Edge
- Vapor Sky
- Binary Ghost
- Star Forge
- Iron Tide
- Amber Pulse
- Neon Strike
- Echo Core
- Solar Wind
- Void Prism
- Shadow Link
- Quantum Gate
- Aura Peak
- Cinder Path
- Night Signal
- Echo Veil
- Hollow Path

**What needs to be done:**
- Ensure `<meta name="viewport" content="width=device-width, initial-scale=1.0">` is present.
- Apply `taren-game-page` to `body` or main wrapper.
- Wrap the main game canvas/scene in `taren-game-stage` so it maintains aspect ratio.
- Replace any hardcoded absolute positioning of debug panels with `taren-game-sidebar` or standard collapsible elements.
- Verify `touch` controls work instead of relying solely on WASD/Arrow keys.
