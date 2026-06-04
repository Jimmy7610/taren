# Mobile Game Test Checklist

Before pushing any new game or updating an existing game on Taren, developers must follow this manual checklist to ensure the game works smoothly on mobile devices.

## Manual Test Steps
1. **Desktop Verification:** Open the game on desktop and ensure base functionality (layout, controls, logic) is intact.
2. **Narrow Mobile Width:** Resize the browser to a narrow mobile width (around 390px - iPhone layout).
3. **Horizontal Scroll Check:** Verify there is absolutely NO horizontal scrollbar (`overflow-x: hidden` on body/wrappers).
4. **Game Area Visibility:** Verify the game area (canvas/scene) is fully visible, not pushed off-screen, and not obscured by sidebars.
5. **Touch Targets:** Verify all interactive controls are at least touch-sized (~44px minimum).
6. **Overlay & Dialogue Check:** Verify that overlays, text boxes, and dialogues do not permanently block the gameplay area. They must be compact or closable.
7. **Debug Panel Check:** Verify debug tools can be opened and closed, and are hidden by default.
8. **Exit/Back Button:** Verify the back/exit button is present and clearly visible.
9. **Coordinate Stability (for Point & Click):** Verify that hotspots still align correctly with the background scene after the browser is resized.
10. **Landscape Check:** Test mobile landscape-ish width. Verify the game scene uses maximum screen space.
11. **Inventory/UI:** Verify the inventory and dialogues remain usable without breaking layout.
12. **Safe Area:** If possible, test on an actual mobile device to verify that buttons are not hidden under the notch or browser navigation bars.
