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
- Bullet marks now use the small supplied `assets/hole.png`, slightly randomized
  in size and rotation for variation. Prefer this PNG over the earlier SVG for
  faster repeated rendering.
- Window destruction uses `assets/glass.mp3`, copied from the user's Desktop,
  separate from the per-shot sound.
- Per-shot audio uses `assets/gun_1.mp3`, copied from the user's Desktop as the
  selected shot sound. The preferred playback path is decoded Web Audio; HTMLAudio
  remains only as a local-file fallback if Web Audio asset fetch/decode is blocked.
- `GUN.EXE` was changed from a window with Arm/Repair buttons into a
  desktop file. Double-clicking starts chaos mode; an `EXIT GUN.EXE` taskbar
  button or a few seconds of idle time repairs the desktop and exits the mode.
- The `GUN.EXE` file remains under windows (`z-index` below focused
  windows), starts on a freer desktop area, and can be dragged when visible.
- The `GUN.EXE` desktop file uses a simple CSS pixel gun icon.
- FPS overlay test: activating `GUN.EXE` shows a fixed center crosshair and a
  placeholder weapon at the bottom center. Mouse movement pans the desktop world
  under the crosshair, including during continuous fire. Escape also exits.
- FPS weapon art uses separate Desktop-supplied frames:
  `assets/gun_idle.png` for stillness and `assets/gun_fire.png` for the short
  firing flash.
- Bullet marks live in a separate fixed `impact-layer` with a transformed
  `impact-world`. This keeps marks from being clipped by the desktop while still
  anchoring them to the hit target as the world pans under the crosshair.
- FPS firing listens on the full window and temporarily ignores the HUD during
  target lookup so shots are not limited to the transformed desktop area.
- Pointer lock is requested on `GUN.EXE` start and again on the first shot so the
  browser can keep mouse movement bounded like a game when supported.
- Pointer lock should request `{ unadjustedMovement: true }` first for raw mouse
  input and fall back to normal pointer lock if unsupported.
- The FPS experiment uses a strict fixed-center crosshair. Shots always resolve
  from the screen center; mouse movement pans the desktop world underneath.
  Without pointer lock, browser edges can still physically limit mouse movement.
- Mouse sensitivity is controlled by `aimSensitivity` in `script.js`. `1` is
  mathematically 1:1; the current prototype uses `1.35` to feel responsive but
  calmer than the earlier `1.8` test.
- Each shot should produce a visible optical kick: the desktop shake and weapon
  recoil use alternating short animation classes so they can retrigger during
  held-button autofire.
- Gun-mode latency work: preload the bullet-hole PNG and audio assets, prepare
  and warm audio before the first shot, prefer decoded Web Audio buffers over
  HTMLAudio when available, use a fixed pool of small DOM marks with the PNG
  rather than creating/removing marks or drawing to a full-screen canvas, apply
  mouse movement in `requestAnimationFrame`, avoid forced layout (`offsetWidth`)
  during autofire, throttle blast shake, and cap retained bullet marks. The
  canvas test was slower because each shot dirtied a large composited surface.
- FPS aiming listens to `pointerrawupdate`, `pointermove`, and `mousemove` with
  light duplicate filtering, so mouse movement can continue during held-button
  autofire across different browsers. Gun mode also prevents native drag starts
  because browser drag behavior can steal movement events during continuous fire.
- Gun mode shows a small `ESC - EXIT` HUD hint at the screen edge, matching the
  existing Escape-key exit behavior without opening another window.
- The yellow pixel grid belongs to the fixed page background, not the transformed
  desktop world, so the grid stays visible across the whole viewport while
  aiming pans the windows underneath.
- Gun mode adds hidden-offscreen programmer error popups as extra targets. They
  are invisible on the regular website, become visible only in FPS mode, and are
  placed beyond the initial viewport so the player discovers them by panning.
  Keep them only slightly outside the first viewport because the 82% pan radius
  limits what can be centered under the fixed crosshair and therefore shot.
- When every visible window and every error popup has been destroyed, a large
  `WIN!` message appears in the center, fades out, and the gun mode repairs and
  exits automatically.
- Contact email links are assembled from parts in JavaScript to avoid exposing
  a plain email address or plain `mailto:` URL in static HTML.

## Recurring Checks

- Run `node --check script.js` after JavaScript edits.
- Search for privacy URL changes before deployment:
  `rg "github.io/codesolo/privacy" script.js index.html privacy`
- Preview `index.html` locally after layout changes.
