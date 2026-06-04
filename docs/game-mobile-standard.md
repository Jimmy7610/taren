# Taren Game Mobile Standard

This document defines the official Taren mobile standard for games. All new games must follow these rules, and existing games will gradually be updated to comply.

## 1. Core Rules
- **Playability First:** Every game must be playable on mobile devices.
- **Clear App States:** Games must use true view states (e.g. `data-screen="start"`, `data-screen="game"`) to separate menus from the active game. 
- **No Start Overlays:** Start screens and menus must NEVER be built as modals/overlays layered on top of the game scene. Only one primary view should be displayed at a time. The game view must have `display: none` or the `hidden` attribute while the start view is active, and vice versa.
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

## 6. Games with Mobile Fixes (Build 129)
The following 25 classic games have received a global mobile playability pass. They have been injected with `<meta name="viewport">` and a global fallback CSS rule ensuring horizontal overflow is prevented and canvases scale to fit the screen.

- Ashveil
- Coreloom
- Crosshush
- Echo Hollow
- Echo Veil
- Fourfold
- Hollow Path
- Linebound
- Lost Signal (Pass - Fully Updated)
- Lumen Coil
- Lumen Sequence
- Memory Drift
- Night Array
- Night Signal
- Nightcoil
- Pulse Duel
- Pulseframe
- Shardrift
- Signal Keeper
- Signal Lost
- Static Bloom
- Tetrafall
- Veil Patience
- Void Runner
- Voidbreaker

*(Note: Stale references to missing games like Echo Miner have been removed.)*

**Status:**
Most games are in **PARTIAL** status. They are now playable on mobile (responsive canvas, no horizontal scroll, viewport defined) but may still use desktop-first design patterns rather than the native `game-shell.css` standard.

Future games MUST be built mobile-first using the Taren Game Mobile Standard.
