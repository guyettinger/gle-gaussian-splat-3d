# AGENTS.md

Guidance for AI coding agents working in this repository. Human-facing documentation lives in
[README.md](README.md) and [docs/](docs/).

## Project overview

`gle-gaussian-splat-3d` is a Three.js-based 3D Gaussian splat renderer, published to npm with
bundled TypeScript declarations. It is a fork of
[mkkellogg/GaussianSplats3D](https://github.com/mkkellogg/GaussianSplats3D), which is the
`upstream` git remote.

The library is plain JavaScript (ES modules). The `.d.ts` bundle is generated from the sources by
`rollup-plugin-dts` — there are no hand-written type declarations, so **do not create `.d.ts`
files in `src/`**.

## Setup and commands

```shell
npm install            # install dependencies
npm run build          # build library + demo into build/ (macOS/Linux)
npm run build-windows  # same, on Windows
npm run demo           # serve build/demo at http://127.0.0.1:8080
npm run watch          # rebuild on changes to src/ and demo/
npm run screenshots    # recapture README screenshots from the demo scenes (needs a display)
npm run lint           # eslint over src/ (exits 0 even on errors)
npm run fix-js         # eslint --fix over src/
npm run prettify       # prettier --write over src/**/*.js
```

There is no test suite. Verify changes by running `npm run build` and exercising the demo scenes
in a browser. Demo scene data is not in the repository — see
[docs/development.md](docs/development.md#run-the-demo).

## Layout

| Path | Contents |
| --- | --- |
| `src/Viewer.js` | Main viewer — render loop, camera, scene add/remove. The largest and most central file. |
| `src/DropInViewer.js` | `Object3D` wrapper so the viewer can be added to a user's own scene |
| `src/index.js` | The public API surface. Anything exported here is public. |
| `src/loaders/` | `.ply`, `.splat`, `.ksplat` parsing and the `SplatBuffer` data model |
| `src/splatmesh/` | `SplatMesh`, `SplatScene`, geometry, and the 2D/3D materials with their shaders |
| `src/splattree/` | Octree used to cull splats before sorting |
| `src/worker/` | Sort web worker plus the C++ sorter and its compiled `.wasm` binaries |
| `src/ui/`, `src/webxr/`, `src/raycaster/`, `src/three-shim/` | Loading UI, XR entry buttons, ray-splat intersection, Three.js version shims |
| `util/` | `create-ksplat.js` converter, `server.js` demo server, `import-base-64.js` Rollup plugin, `capture-screenshots.js` README screenshot capture |
| `demo/` | Demo pages, copied into `build/demo` at build time |
| `docs/` | Human documentation linked from the README |
| `build/` | Generated. Gitignored. Never edit or commit. |

## Code style

- 4-space indentation, single quotes, semicolons. Max line length 140.
- ESLint extends `google` with the overrides in `.eslintrc.cjs`. Match surrounding code before
  reaching for the linter's opinion.
- ES modules only (`"type": "module"`). No CommonJS in `src/`.
- The library must not import anything outside of `three`, which is a peer dependency and
  external to the bundle. Keep the runtime dependency list empty.
- Comments are sparse in this codebase. Add them for non-obvious math, shader work and format
  details; skip them elsewhere.

## Things that will bite you

- **`build/` is gitignored but is what gets published.** Always `npm run build` before publishing.
- **The `.wasm` files in `src/worker/` are committed binaries.** They are compiled from
  `sorter.cpp` / `sorter_no_simd.cpp` with the `compile_wasm*.sh` scripts (requires Emscripten)
  and inlined into the bundle as base64 by `util/import-base-64.js`. Don't touch them unless you
  changed the C++, and rebuild all four variants if you do.
- **Four WASM variants exist** covering SIMD / no-SIMD × shared-memory / non-shared-memory. A
  change to the sorter usually has to be made in both `.cpp` files.
- **`SharedArrayBuffer` requires cross-origin isolation.** `util/server.js` sets the COOP/COEP
  headers; anything else serving the demo must too.
- **Adding a viewer option means three edits:** the constructor in `src/Viewer.js`, the table in
  [docs/viewer-options.md](docs/viewer-options.md), and — if it's user-facing enough — the demo.
- **Loader methods return `AbortablePromise`, not `Promise`.** Its `then()` takes only a resolve
  handler, so `await` on one will never settle if the operation fails. Use `.then()`/`.catch()`
  in examples and docs.
- **`npm run screenshots` runs a headed browser.** It needs the built demo and the demo scene
  data, and it will not produce usable output under headless software rendering. Don't run it as
  a verification step; it's for refreshing the README images on purpose.
- **`src/OrbitControls.js` is adapted from Three.js.** Prefer minimal, well-marked changes there.
- **This is a fork.** Changes to `package.json` and `rollup.config.js` diverge from upstream on
  purpose (package name, types output). Preserve that divergence when merging upstream.

## Documentation

- README.md is for humans and stays short. Long or standalone topics go in `docs/` and are
  linked from the README's documentation table.
- Public API changes should be reflected in the relevant `docs/` page in the same change.

## Commits and pull requests

- Commit messages are short, imperative, and unprefixed (`Fix multi-scene load`,
  `Cleanup abort behavior`). Version bumps are commits titled `vX.Y.Z`.
- Pull requests target `main`.
- Run `npm run lint` and `npm run build` before opening a PR. Note that `npm run lint` exits 0
  regardless, so read its output rather than trusting the exit code.
