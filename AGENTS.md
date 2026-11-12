# AGENTS.md

Asteroids clone in pure HTML5 Canvas + vanilla JS. No dependencies, no `package.json`, no build step, no tests, no linter, no CI. The entire game is a single file, `game.js`; `index.html` is just the canvas shell.

## Running / verifying

Open `index.html` directly in a browser, or serve the directory (`npx serve .`, per README) and play at `http://localhost:3000`. There are no commands to install, build, or lint — verification is manual play-testing in the browser.

## Architecture

- All game state is module-level `let` bindings (`ship`, `bullets`, `asteroids`, `particles`, `score`, `lives`, `level`, `state`, `deadTimer`). `update()` mutates/reassigns them via `filter`/`concat` each frame; don't introduce parallel state containers.
- `state` is a `'playing' | 'dead' | 'gameover'` machine; `update()` early-returns per state, so only one branch's input handling runs per frame.
- Classes: `Ship`, `Asteroid` (sizes 3→2→1 via `split()`; tuning lives in the parallel `RADII`/`SPEEDS`/`POINTS` arrays), `Bullet`, `Particle`.
- Space is toroidal: all position updates must go through `wrap(v, max)`.
- The loop is dt-based with dt clamped to 0.05 s, so physics tolerates tab throttling.

## Gotchas

- **Canvas size is duplicated**: `W`/`H` in `game.js` must match the `width`/`height` attributes of `<canvas id="canvas">` in `index.html`. Change both together or wrapping/rendering breaks.
- **Input has two mechanisms**: `keys[e.code]` is held-state (rotation, thrust); `justPressed` + `pressed(code)` is a consume-once edge detector for single-shot actions (shoot, restart). Don't poll `keys['Space']` for single-shot actions — it fires every frame — and call `pressed()` at most once per key per frame.
- Key handling uses `KeyboardEvent.code` values (`'ArrowLeft'`, `'Space'`), not `e.key`.
- **README is partially stale/aspirational**: it advertises power-ups and a special "estrella fugaz" asteroid that do not exist in the code, and omits real features (levels, `nextLevel()`). Trust `game.js` over the README when they disagree.
- Comments, README, and on-screen text are in Spanish (HUD strings like `NIVEL`, `PUNTAJE`). Write new comments and UI strings in Spanish to match.
