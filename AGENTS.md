# Agent Notes

Use this file as the durable project memory for future Codex work.

## Project Intent

Code Solo should feel like a tiny indie game studio desktop: personal, playful,
slightly retro, and handmade. It is not a polished corporate landing page. The
site should make the visitor understand quickly that Code Solo is a one-man game
maker with multiple small apps.

## Voice And Tone

- Friendly, direct, indie, and lightly self-aware.
- Keep the "one-man studio" feeling.
- Prefer compact copy over marketing language.
- Humor is welcome, but the site should still feel trustworthy for App Store
  users looking for privacy information.

## Design Direction

- Keep the retro desktop/window metaphor.
- The first screen should be the actual site experience, not a marketing hero.
- Each app should have its own small window with its own App Store, Privacy, and
  Info actions.
- Windows should be draggable on desktop/tablet-sized viewports.
- Mobile can stack windows vertically for readability.
- Punk energy should come from playful interaction and controlled chaos, not
  from making the site harder to understand.
- Prefer toy-like, game-like destructive tools such as `GUN.EXE` over
  realistic weapon imagery.
- Destruction effects should feel physical and expressive: windows can shatter,
  drop out of the viewport, and come back through auto-repair or explicit exit.
- `GUN.EXE` should behave like a desktop file/tool, not like a normal
  app window.
- The `GUN.EXE` desktop file should be draggable but visually live below
  normal windows, starting on a free visible area when possible.
- Experimental FPS mode can use a fixed center crosshair and bottom-center
  weapon placeholder; mouse movement should pan the desktop world under the
  crosshair even during continuous fire.
- Avoid adding large frameworks unless the project truly needs them.

## Hard Constraints

- Do not change existing privacy page URLs without explicit user approval.
- Do not remove or rename files under `privacy/` casually; these are connected
  to App Store metadata.
- Keep the project static unless there is a clear reason to introduce a build
  step.
- Preserve the existing App Store URLs unless the user provides replacements.

## Current App Data

- HUP
  - App Store: `https://apps.apple.com/ca/app/hup-shell-of-a-journey/id6758862472`
  - Privacy: `https://turanu77.github.io/codesolo/privacy/hup.html`
- LUNIO - Good Night, Dear Moon
  - App Store: `https://apps.apple.com/de/app/lunio-gute-nacht-lieber-mond/id6757497490`
  - Privacy: `https://turanu77.github.io/codesolo/privacy/lunio.html`
- WOLF - Party Game
  - App Store: `https://apps.apple.com/de/app/wolf-party-game/id6747474675`
  - Privacy: `https://turanu77.github.io/codesolo/privacy/wolf.html`
