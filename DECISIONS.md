# Decisions And Learnings

This log captures decisions that should survive across future editing sessions.

## 2026-07-19

- The repository was connected locally to `https://github.com/TuranU77/codesolo.git`.
- The site is intentionally static: HTML, CSS, JavaScript, and assets only.
- App presentation was changed from one shared app list plus one shared privacy
  viewer to one small window per app.
- Privacy links stayed unchanged because they are connected to App Store entries.
- Dragging was restored for narrower desktop/browser windows by changing the
  mobile breakpoint from `900px` to `700px`.
- A first `BUGBLASTER.EXE` experiment was added as an optional chaos mode:
  users can arm it, click the desktop to add pixel damage marks, and repair the
  desktop. The direction is punk/playful rather than realistic weapon imagery.
- `BUGBLASTER.EXE` became the protected repair console. Other windows can take
  repeated chaos-mode hits and enter a destroyed/crashed state; `Repair` restores
  them.
- The destroyed state was revised from a static K.O. label to a more physical
  shatter-and-fall animation with separate window shards.
- Per-shot audio is currently a generated Web Audio placeholder, not a committed
  sound asset. Bullet marks were refined toward darker holes with rings and
  cracks.
- Shatter fragments were revised toward a finer digital square grid rather than
  large organic shards.
- Fragment textures were removed again; keep flat black/white/gray blocks for a
  cleaner computer-pixel look.
- Destroyed windows should throw pixel fragments far apart before they drop out
  of the viewport.
- Bullet marks use the supplied `assets/bullet-hole.svg`, slightly randomized in
  size and rotation for variation. Its white SVG fills are made transparent so
  no white box appears around the mark.
- Window destruction uses `assets/glass.mp3`, copied from the user's Desktop,
  separate from the per-shot sound.
- Per-shot audio is currently `assets/gun_1.mp3`, copied from the user's Desktop
  as the selected shot sound. The generated Web Audio shot fallback was removed so only the
  asset is heard for shots.
- `GUN.EXE` was changed from a window with Arm/Repair buttons into a
  desktop file. Double-clicking starts chaos mode; an `EXIT GUN.EXE` taskbar
  button or a few seconds of idle time repairs the desktop and exits the mode.
- The `GUN.EXE` file remains under windows (`z-index` below focused
  windows), starts on a freer desktop area, and can be dragged when visible.
- The `GUN.EXE` desktop file uses a simple CSS pixel gun icon.
- Contact email links are assembled from parts in JavaScript to avoid exposing
  a plain email address or plain `mailto:` URL in static HTML.

## Recurring Checks

- Run `node --check script.js` after JavaScript edits.
- Search for privacy URL changes before deployment:
  `rg "github.io/codesolo/privacy" script.js index.html privacy`
- Preview `index.html` locally after layout changes.
