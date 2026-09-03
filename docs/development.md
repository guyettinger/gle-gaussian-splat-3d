# Development

## Prerequisites

- Node.js 18 or newer — Rollup 4 requires it; the project is developed against Node 22. There is
  no `engines` field in `package.json`.
- npm

## Build

```shell
npm install
npm run build
```

On Windows, use the Windows-compatible variant:

```shell
npm run build-windows
```

`npm run build` does two things:

1. **`build-library`** — runs Rollup, producing UMD, ESM, minified variants and a `.d.ts` bundle
   in `build/`, then copies them into `build/demo/lib/`.
2. **`build-demo`** — copies `demo/` into `build/demo/` and drops a copy of `three.module.js`
   into `build/demo/lib/` so the demo pages can resolve `three` through their import map.

`build/` is generated and gitignored; it is what gets published to npm.

## Run the demo

```shell
npm run demo
```

The demo is then served at <http://127.0.0.1:8080/index.html>. `util/server.js` is a small
static server that sets the `Cross-Origin-Opener-Policy` and `Cross-Origin-Embedder-Policy`
headers the viewer needs for `SharedArrayBuffer` — see
[Cross-origin isolation](cross-origin-isolation.md). Pass `-p` to change the port and `-h` to
change the host.

The demo scene data is not in the repository. Download
[gaussian_splat_data.zip](https://projects.markkellogg.org/downloads/gaussian_splat_data.zip)
and extract it into:

```
<repo>/build/demo/assets/data
```

## Watch mode

```shell
npm run watch
```

Rebuilds the library when `src/**/*.js` changes and re-copies the demo when `demo/**/*.*`
changes. Run `npm run demo` in a second terminal alongside it.

## Linting and formatting

```shell
npm run lint          # eslint over src/, never fails the shell
npm run fix-js        # eslint --fix over src/
npm run prettify      # prettier --write over src/**/*.js
npm run fix-styling   # stylelint --fix over **/*.scss
```

The ESLint config extends `google` with project overrides in `.eslintrc.cjs`: 4-space indent,
140-character lines, and `prefer-const`, `require-jsdoc` and `padded-blocks` turned off.

There is no test suite. Changes are verified by building and exercising the demo scenes.

## Project layout

```
src/
  Viewer.js             Main viewer: render loop, camera, scene management
  DropInViewer.js       Object3D wrapper around Viewer
  OrbitControls.js      Vendored/adapted Three.js orbit controls
  raycaster/            Ray-splat intersection
  loaders/              File format parsing and the SplatBuffer data model
    ply/                INRIA v1/v2 and PlayCanvas-compressed .ply parsers
    splat/              .splat parser
    ksplat/             .ksplat loader
  splatmesh/            SplatMesh, SplatScene, geometry and 2D/3D materials
  splattree/            Octree used to cull splats before sorting
  worker/               Splat sort web worker plus the C++/WASM sorter
  ui/                   Loading spinner, progress bar, info panel
  webxr/                VR and AR entry buttons
  three-shim/           Compatibility shims across Three.js versions
util/
  create-ksplat.js      CLI .ply/.splat -> .ksplat converter
  server.js             Demo static server with COOP/COEP headers
  import-base-64.js     Rollup plugin that inlines .wasm as base64
demo/                   Demo pages, copied into build/demo at build time
```

## The WASM sorter

`src/worker/sorter.cpp` and `sorter_no_simd.cpp` compile to the four `.wasm` binaries checked in
next to them, via the `compile_wasm*.sh` scripts (Emscripten required). Those binaries are
inlined into the bundle as base64 by `util/import-base-64.js`, so the published library has no
separate `.wasm` asset to host. The `.wasm` files are committed — rebuild them only when the
C++ changes, and commit the result.

The four variants cover the SIMD / no-SIMD and shared-memory / non-shared-memory combinations,
selected at runtime from the `enableSIMDInSort` and `sharedMemoryForWorkers` viewer options.

## Releasing

1. Bump `version` in `package.json`.
2. Commit as `vX.Y.Z`.
3. `npm run build`
4. `npm publish`

## Relationship to upstream

This repository is a fork of [mkkellogg/GaussianSplats3D](https://github.com/mkkellogg/GaussianSplats3D),
which is configured as the `upstream` remote. It tracks upstream and adds bundled TypeScript
declarations. When pulling upstream changes, keep the packaging differences in
`package.json` and `rollup.config.js` intact.
