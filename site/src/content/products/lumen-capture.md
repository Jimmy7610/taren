---
# Sources (verified 2026-11-18): Jimmy7610/lumen-capture @ 85996b5 (v2.8.0) — README, CMakeLists.txt,
# res/app.rc, installer/LumenCapture.iss, website/index.html (owner copy), docs/screenshots;
# GitHub: no releases, no tags. Screenshots: v28-* captured from the 2.8.0 build (feature/taren-branding)
# under Wine at 200 % scaling; v25-* are the project's own English website captures of version 2.5.
slug: lumen-capture
name: Lumen Capture
tagline: Record anything. Edit it instantly. Go live.
description: >-
  A native Windows screen recorder with a built-in editor, live streaming and AI that runs on your
  own PC. One small app, no accounts.
category: App
platforms: [Windows 10, Windows 11]
status: in-development
statusNote: >-
  Version 2.8 builds automatically for Windows on every change. It has not been released yet: no
  installer or download is published.
published: true
featured: true
order: 1
device: desktop
icon: ../../assets/products/lumen-capture/icon.png
iconAlt: Lumen Capture app icon — a white ring with a red recording dot on a blue-violet rounded square.
heroImage: ../../assets/products/lumen-capture/v28-record-dark.webp
heroImageAlt: >-
  Lumen Capture's Record page in the dark theme: Full screen, Window and Region sources, a live
  preview, frame rate and quality settings, and Start recording, Screenshot and Go live buttons.
accent: '#6E8BFF'
accentAlt: '#FF4D5E'
screenshotsNote: >-
  Real captures of Lumen Capture — version 2.8 (Record, Settings, About) and version 2.5 (Editor,
  Export, Live), rendered under Wine on Linux, so the font differs from Windows' Segoe UI.
facts:
  - label: Type
    value: Screen recorder and editor
  - label: Runs on
    value: Windows 10 (2004+) and 11, x64
  - label: Accounts
    value: None — runs on your PC
  - label: Languages
    value: Six built in
  - label: On-device AI
    value: Captions and noise removal
  - label: Built with
    value: C++ · Direct3D 11
  - label: Graphics
    value: DirectX 11 GPU
  - label: Version
    value: 2.8 · not yet released
stepsEyebrow: How it works
stepsTitle: Record, edit, share — in one app
steps:
  - title: Record what you need
    description: >-
      Full screen, a window or a region, with system sound, microphone and camera. What you see in
      the preview is what gets recorded.
    image: ../../assets/products/lumen-capture/v28-record-dark.webp
    alt: The Record page with source choices, a live preview and recording settings.
  - title: Edit on a timeline
    description: >-
      Cut, zoom, annotate and add picture-in-picture on one timeline. Edits are non-destructive and
      Ctrl+Z undoes everything.
    image: ../../assets/products/lumen-capture/v25-editor-en.webp
    alt: The built-in editor with a video preview, an inspector panel and a multi-track timeline (version 2.5).
  - title: Export or go live
    description: >-
      Export MP4, GIF or sound — cuts-only edits are copied without re-encoding — or stream to
      Twitch, YouTube or Kick over encrypted RTMPS.
    image: ../../assets/products/lumen-capture/v25-export-en.webp
    alt: The editor's Export tab with MP4, Fast, GIF and Sound options (version 2.5).
gallery:
  - image: ../../assets/products/lumen-capture/v28-record-dark.webp
    alt: The Record page in the dark theme (version 2.8).
    caption: Record page, dark theme · 2.8
  - image: ../../assets/products/lumen-capture/v28-record-light.webp
    alt: The Record page in the light theme (version 2.8).
    caption: Record page, light theme · 2.8
  - image: ../../assets/products/lumen-capture/v25-editor-en.webp
    alt: The built-in editor with preview, inspector and timeline (version 2.5).
    caption: The built-in editor · 2.5
  - image: ../../assets/products/lumen-capture/v25-export-en.webp
    alt: Export options in the editor, including fast export without re-encoding (version 2.5).
    caption: Export, including Fast export · 2.5
  - image: ../../assets/products/lumen-capture/v25-layout-en.webp
    alt: Camera layout settings with screen-and-camera scenes and background blur (version 2.5).
    caption: Camera layouts and background blur · 2.5
  - image: ../../assets/products/lumen-capture/v25-live-en.webp
    alt: Live streaming settings with Twitch, YouTube, Kick and custom servers (version 2.5).
    caption: Live streaming · 2.5
  - image: ../../assets/products/lumen-capture/v28-settings-dark.webp
    alt: Settings with theme, language, countdown and instant replay options (version 2.8).
    caption: Settings · 2.8
  - image: ../../assets/products/lumen-capture/v28-help-light.webp
    alt: About and help, showing "A Taren App" with the Taren symbol and a taren.se link (version 2.8).
    caption: About & help — “A Taren App” · 2.8
features:
  - title: Screen, window or region
    description: >-
      Record any display, one window (even when it is covered) or an area, with system audio,
      microphones and camera. H.264 or HEVC, hardware-encoded where the GPU supports it.
  - title: A real editor, built in
    description: >-
      Cuts, zooms, annotations, picture-in-picture, speed per clip and silence removal — all
      non-destructive, with undo for everything.
  - title: Go live without extra software
    description: >-
      Its own encrypted RTMPS client with scenes you can switch live, a name tag and background blur.
      You can keep a local recording while you stream.
  - title: AI on your own PC
    description: >-
      Captions with Whisper and microphone noise removal with RNNoise run locally. After a one-time
      model download, audio never leaves the computer.
  - title: Fast, flexible export
    description: >-
      MP4, GIF, M4A or WAV. Edits with only cuts are copied without re-encoding, so they export in
      seconds without losing quality.
  - title: Made for everyone
    description: >-
      Six languages, light and dark themes, screen-reader support, high-contrast mode and full
      keyboard navigation.
milestones:
  - title: New interface, themes and library
    state: done
    note: Version 0.2.
  - title: Recording engine 2
    state: done
    note: Window capture, HDR, rotated displays, instant replay, webcam and per-app audio (0.3).
  - title: Built-in editor
    state: done
    note: Trim, cut, zoom, GIF export and chapter markers (0.4).
  - title: Live streaming and scenes
    state: done
    note: RTMP streaming, camera layouts, scheduled recording and live annotation (0.5).
  - title: AI captions, plugins and installer
    state: done
    note: Local Whisper captions, noise suppression, a plugin API and an installer (1.0).
  - title: Versions 1.1 to 2.8
    state: done
    note: Accessibility, overlays, fast export, six languages, resizing, and About & help with a printable manual.
  - title: Public release
    state: planned
    note: Needs the owner's approval. The installer is not code-signed and no download is published yet.
milestonesSource: Lumen Capture README roadmap and changelog (version 2.8.0, November 2026)
---

Lumen Capture is a native Windows screen recorder written in C++ on Win32, Direct2D, DXGI, Media
Foundation and WASAPI. It records the screen, a window or a region with sound, microphone and
camera — then lets you **edit the video right away** and share it, or stream it live.

Everything runs on your own computer. There are no accounts, and nothing is uploaded unless you
choose to stream. Even the AI features — captions and microphone noise removal — run locally.

Recording uses DXGI Desktop Duplication on the GPU and Media Foundation's hardware encoders, so it
stays light while you work. The built-in editor is non-destructive: the original recording is never
touched.

Lumen Capture is in development and has not been released. Details on this page reflect version
2.8 and may change.
