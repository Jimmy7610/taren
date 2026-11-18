# Taren brand integration for apps ("A Taren App")

How every Taren application credits the studio without losing its own identity. Reference
implementation: Lumen Capture (`Jimmy7610/lumen-capture`, branch `feature/taren-branding`).

## Rules
1. **The app keeps its own name, icon and logo.** Taren never replaces them.
2. **About screen:** below the app's own identity block, add a hairline divider and one row —
   official Taren symbol (≈ 20–24 logical px) · **"A Taren App"** (translated) · a **taren.se** link
   (opens `https://taren.se` in the browser).
3. **"by Taren"** elsewhere only where it genuinely improves the design (e.g. installer "publisher
   link", file-properties comment). Never in toolbars, editors or anything that competes with the task.
4. **Publisher identity stays truthful.** Keep the existing publisher/copyright (currently
   "Jimmy Eliasson"); add `https://taren.se` as the publisher *link* only. No code-signing claims.
5. **Assets:** use the official symbol — `site/src/assets/brand/taren-symbol.png` in this repository
   (pixel-identical crop of `site/brand/masters/taren-icon.png`). Down-scale only (Lanczos), keep RGBA
   transparency and the 1:1 aspect ratio; never recolour, stretch or crop. 128×128 is enough for
   ~5× scaling at 24 px. The symbol reads on both light and dark themes.
6. **Never overwrite existing brand assets**; add new files under a `taren/` folder with a README
   recording the source.
7. **Accessibility:** the link is a real focusable control with an accessible name ("Visit taren.se"),
   keyboard-activatable, with a tooltip; colours from the app's theme palette (accent for the link,
   primary text for "A Taren App").
8. **Translations:** "A Taren App", "Visit taren.se", "Opens taren.se in your browser" in every
   language the app ships.

## Per-framework recipes

| Framework | Symbol | Row | Link |
|---|---|---|---|
| **Win32 + Direct2D** (Lumen Capture) | PNG as `RCDATA`, decoded with WIC (`IWICStream::InitializeFromMemory` → `CreateBitmapFromWicBitmap`), cached `ID2D1Bitmap`, reset on `D2DERR_RECREATE_TARGET` | Draw with the app's own text/fill helpers | `ShellExecuteW(hwnd, L"open", L"https://taren.se", …)` via the app's command queue |
| **WPF** | `Resource` build action, `<Image Source="pack://application:,,,/Assets/Taren/taren-symbol-128.png" Width="22" RenderOptions.BitmapScalingMode="HighQuality"/>` | `StackPanel` with `TextBlock` bound to localized resources; theme brushes via `DynamicResource` | `<Hyperlink NavigateUri="https://taren.se" RequestNavigate=…>` → `Process.Start(new ProcessStartInfo(uri){UseShellExecute=true})` |
| **WinUI 3 / Windows App SDK** | `ms-appx:///Assets/Taren/taren-symbol-128.png` in an `Image`; theme-aware via `ThemeResource` brushes | `StackPanel` / `Grid` row in the About `SettingsCard` or page | `HyperlinkButton NavigateUri="https://taren.se"` (accessible by default) |
| **WinForms** | `PictureBox` (`SizeMode=Zoom`) or `Graphics.DrawImage` with `HighQualityBicubic`; DPI via `AutoScaleMode.Dpi` | `TableLayoutPanel` row | `LinkLabel` + `Process.Start(… UseShellExecute=true)` |
| **Electron / web** | `<img src="taren-symbol-128.png" width="22" height="22" alt="">` | Flex row | `<a href="https://taren.se" target="_blank" rel="noopener noreferrer">taren.se</a>` / `shell.openExternal` |

## Verification checklist (per app)
- Builds clean on the app's own toolchain; existing tests pass.
- About row correct in dark and light themes, at 100 / 150 / 200 % scaling, in every shipped language.
- Keyboard: the link is reachable with Tab, shows a focus indicator and opens taren.se with Enter.
- Mouse: hover state + tooltip; click opens `https://taren.se`.
- Pages other than About are unchanged (screenshot diff against `main`).

## Status
| App | Status |
|---|---|
| Lumen Capture | ✅ Implemented on `feature/taren-branding` (not merged). Verified under Wine (see TEST_REPORT §2.2). Needs a real-Windows check before merge. |
| PDF Studio | ✅ Implemented locally on the PDFStudio repo's `feature/taren-branding` (commit `4802bd8`, per `docs/products/pdfstudio/HANDOFF_README.md`); About dialog captured in screenshots 11–13. Not merged; the repository is local-only. |
| Pulse Garden | Not in scope for 2.2 (Godot/iOS). |
