# Copilot instructions

## Project overview

SKYLINE RUN is a small, dependency-free browser game built with plain HTML, CSS, and JavaScript. `index.html` provides the Japanese-language page structure, HUD, start overlay, and touch controls; it loads `style.css` and `game.js` directly.

The game is drawn on a fixed logical 960×540 canvas. `game.js` owns the level data (`platforms`, `coins`), player physics, input, camera, game state, and canvas rendering. Its animation loop updates the game and renders each frame; world objects are positioned in world coordinates and shifted by `cameraX`. CSS scales the canvas and lays out the responsive page and controls.

## Commands

- Run: open `index.html` in a browser; there is no build step or package manager.
- Tests and lint: no test runner or linter is configured. `node --check game.js` checks JavaScript syntax only; it is not a gameplay test. There is no single-test command.

## Repository conventions

- Keep the implementation framework-free: the page loads `game.js` with `defer`, and stylesheets/scripts are linked directly from the HTML.
- Keep the HTML selectors used by `game.js` in sync when changing the HUD, overlay, or controls. Touch buttons use `data-control`; keyboard and touch input feed the same game input state.
- Treat canvas dimensions as logical game coordinates. Keep level geometry and collectible positions in `game.js` world coordinates, and account for the camera when drawing world objects.
- Display explanations and player-facing interface text in Japanese. Keep the page language as Japanese (`lang="ja"`).
