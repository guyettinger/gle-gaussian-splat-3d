# Getting Started

## Install

```shell
npm install gle-gaussian-splat-3d
```

`three` is a peer dependency (`>=0.160.0`), so install it too if your project doesn't already have it:

```shell
npm install three
```

## Load a scene

The `Viewer` class is self-contained: it creates its own renderer, camera and controls unless
you hand it your own. Point it at a `.ply`, `.splat`, or `.ksplat` file and call `start()`.

### TypeScript

```typescript
import { Viewer } from 'gle-gaussian-splat-3d';

const viewer = new Viewer({
  ignoreDevicePixelRatio: false,
  gpuAcceleratedSort: true
});

viewer.addSplatScene('<path to .ply, .splat, or .ksplat file>', {
  splatAlphaRemovalThreshold: 5, // out of 255
  halfPrecisionCovariancesOnGPU: true
}).then(() => {
  viewer.start();
});
```

`addSplatScene()` returns an `AbortablePromise`, not a native `Promise`, so that the download can
be cancelled. Use `.then()` and `.catch()` on it rather than `await` — its `then()` accepts only a
resolve handler, so an `await` will not settle if the load fails.

### JavaScript

```javascript
import * as GaussianSplats3D from 'gle-gaussian-splat-3d';

const viewer = new GaussianSplats3D.Viewer({
    'cameraUp': [0, -1, -0.6],
    'initialCameraPosition': [-1, -4, 6],
    'initialCameraLookAt': [0, 4, 0]
});

viewer.addSplatScene('<path to .ply, .ksplat, or .splat file>', {
    'splatAlphaRemovalThreshold': 5,
    'showLoadingUI': true,
    'position': [0, 1, 0],
    'rotation': [0, 0, 0, 1],
    'scale': [1.5, 1.5, 1.5]
})
.then(() => {
    viewer.start();
});
```

By default the viewer appends its own canvas to the document and drives its own render loop.
See [Viewer options](viewer-options.md) to take over any part of that.

## Load several scenes at once

`addSplatScenes()` accepts an array of scene descriptors and loads them into one splat mesh:

```javascript
viewer.addSplatScenes([{
        'path': '<path to first .ply, .ksplat, or .splat file>',
        'splatAlphaRemovalThreshold': 20
    },
    {
        'path': '<path to second .ply, .ksplat, or .splat file>',
        'rotation': [-0.14724434, -0.0761755, 0.1410657, 0.976020],
        'scale': [1.5, 1.5, 1.5],
        'position': [-3, -2, -3.2]
    }
])
.then(() => {
    viewer.start();
});
```

Scenes can be removed later with `removeSplatScene(index)` or `removeSplatScenes([indexes])`.

## Supported file formats

| Format | Notes |
| --- | --- |
| `.ply` | The original output of the INRIA training pipeline, plus the PlayCanvas compressed variant. |
| `.splat` | The community standard binary format. |
| `.ksplat` | A trimmed-down, compressed format specific to this project. Smallest and fastest to load. See [The .ksplat format](ksplat-format.md). |

When loading from a URL with no file extension, pass the `format` option so the loader knows
what it is receiving.

## Heads up: SharedArrayBuffer

The viewer sorts splats in a web worker and, by default, shares memory with that worker via a
`SharedArrayBuffer`. That requires your server to send cross-origin isolation headers. If you
see `SharedArrayBuffer transfer requires self.crossOriginIsolated` in the console, read
[Cross-origin isolation](cross-origin-isolation.md).

## Next steps

- [Viewer options](viewer-options.md) — every constructor and scene parameter
- [Three.js integration](threejs-integration.md) — render your own scene alongside the splats
- [Controls](controls.md) — mouse and keyboard reference
