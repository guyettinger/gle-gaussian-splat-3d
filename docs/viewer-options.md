# Viewer options

All options are passed as a single object to the `Viewer` (or `DropInViewer`) constructor.
Everything is optional.

## Camera and framing

| Parameter | Purpose |
| --- | --- |
| `cameraUp` | The natural 'up' vector for viewing the scene (only has an effect when used with orbit controls and when the viewer uses its own camera). Serves as the axis around which the camera will orbit, and is used to determine the scene's orientation relative to the camera. |
| `initialCameraPosition` | The camera's initial position (only used when the viewer uses its own camera). |
| `initialCameraLookAt` | The initial focal point of the camera and center of the camera's orbit (only used when the viewer uses its own camera). |

## Taking control of the render loop

By default the viewer creates its own renderer, camera and controls and drives its own
animation loop. Pass `selfDrivenMode: false` and call `update()` and `render()` yourself:

```javascript
const viewer = new GaussianSplats3D.Viewer({
    'selfDrivenMode': false,
    'renderer': renderer,
    'camera': camera,
    'useBuiltInControls': false
});

viewer.addSplatScene('<path to .ply, .ksplat, or .splat file>')
.then(() => {
    requestAnimationFrame(update);
});

function update() {
    requestAnimationFrame(update);
    viewer.update();
    viewer.render();
}
```

| Parameter | Purpose |
| --- | --- |
| `selfDrivenMode` | If `false`, tells the viewer that you will manually call its `update()` and `render()` methods. Defaults to `true`. |
| `renderer` | Pass an instance of a Three.js `Renderer` to the viewer, otherwise it will create its own. Defaults to `undefined`. |
| `camera` | Pass an instance of a Three.js `Camera` to the viewer, otherwise it will create its own. Defaults to `undefined`. |
| `useBuiltInControls` | Tells the viewer to use its own camera controls. Defaults to `true`. |
| `threeScene` | A Three.js `Scene` to render along with the splats. See [Three.js integration](threejs-integration.md). |

## Performance

| Parameter | Purpose |
| --- | --- |
| `ignoreDevicePixelRatio` | Tells the viewer to pretend the device pixel ratio is 1, which can boost performance on devices where it is larger, at a small cost to visual quality. Defaults to `false`. |
| `gpuAcceleratedSort` | Tells the viewer to use a partially GPU-accelerated approach to sorting splats. Currently this means pre-computation of splat distances from the camera is performed on the GPU. It is recommended that this only be set to `true` when `sharedMemoryForWorkers` is also `true`. Defaults to `false` on mobile devices, `true` otherwise. |
| `enableSIMDInSort` | Enable the usage of SIMD WebAssembly instructions for the splat sort. Default is `true`. |
| `sharedMemoryForWorkers` | Tells the viewer to use shared memory via a `SharedArrayBuffer` to transfer data to and from the sorting web worker. If set to `false`, it is recommended that `gpuAcceleratedSort` be set to `false` as well. Defaults to `true`. Requires [cross-origin isolation](cross-origin-isolation.md). |
| `integerBasedSort` | Tells the sorting web worker to use the integer versions of relevant data to compute the distance of splats from the camera. Since integer arithmetic is faster than floating point, this reduces sort time. However it can result in integer overflows in larger scenes so it should only be used for small scenes. Defaults to `true`. |
| `halfPrecisionCovariancesOnGPU` | Tells the viewer to use 16-bit floating point values when storing splat covariance data in textures, instead of 32-bit. Defaults to `false`. |
| `dynamicScene` | Tells the viewer to not make any optimizations that depend on the scene being static. Additionally all splat data retrieved from the viewer's splat mesh will not have their respective scene transform applied to them by default. |
| `renderMode` | Controls when the viewer renders the scene. Valid values are defined in the `RenderMode` enum: `Always`, `OnChange`, and `Never`. Defaults to `Always`. |
| `freeIntermediateSplatData` | When true, the intermediate splat data that is the result of decompressing splat buffer(s) and used to populate data textures will be freed. This reduces memory usage, but if that data needs to be modified it will need to be re-populated from the splat buffer(s). Defaults to `false`. |
| `plyInMemoryCompressionLevel` | Level to compress `.ply` files when loading them for direct rendering (not exporting to `.ksplat`). Valid values are the same as `.ksplat` compression levels (0, 1, or 2). Default is 2. |

## Visual quality

| Parameter | Purpose |
| --- | --- |
| `antialiased` | When true, will perform additional steps during rendering to address artifacts caused by the rendering of gaussians at substantially different resolutions than that at which they were rendered during training. This will only work correctly for models that were trained using a process that utilizes this compensation calculation. For more details see [gsplat#117](https://github.com/nerfstudio-project/gsplat/pull/117) and [gaussian-splatting#294](https://github.com/graphdeco-inria/gaussian-splatting/issues/294#issuecomment-1772688093). |
| `focalAdjustment` | Hacky, non-scientific parameter for tweaking focal length related calculations. For scenes with very small gaussians and small details, increasing this value can help improve visual quality. Default value is 1.0. |
| `sphericalHarmonicsDegree` | Degree of spherical harmonics to utilize in rendering splats (assuming the data is present in the splat scene). Valid values are 0, 1, or 2. Default value is 0. See [Limitations](limitations.md) for the effect on maximum splat count. |
| `splatRenderMode` | Determines which splat rendering mode to enable. Valid values are defined in the `SplatRenderMode` enum: `ThreeD` and `TwoD`. `ThreeD` is the original/traditional mode; `TwoD` is the mode described at [surfsplatting.github.io](https://surfsplatting.github.io/). |
| `sceneRevealMode` | Controls the fade-in effect used when the scene is loaded. Valid values are defined in the `SceneRevealMode` enum: `Default`, `Gradual`, and `Instant`. `Default` results in a slow fade-in for progressively loaded scenes and a fast fade-in otherwise. `Gradual` forces a slow fade-in for all scenes. `Instant` makes all loaded scene data immediately visible. |
| `enableOptionalEffects` | When true, allows for usage of extra properties and attributes during rendering for effects such as opacity adjustment. Default is `false` for performance reasons. These properties are separate from transform properties (scale, rotation, position) that are enabled by the `dynamicScene` parameter. |

## Environment

| Parameter | Purpose |
| --- | --- |
| `webXRMode` | Tells the viewer whether or not to enable built-in Web VR or Web AR. Valid values are defined in the `WebXRMode` enum: `None`, `VR`, and `AR`. Defaults to `None`. |
| `logLevel` | Verbosity of the console logging. Valid values are defined in the `LogLevel` enum. Defaults to `LogLevel.None`. |

## Scene options

These are passed as the second argument to `addSplatScene()`, or as entries in the array passed
to `addSplatScenes()` (where the file path is given as the `path` property).

| Parameter | Purpose |
| --- | --- |
| `format` | Force the loader to assume the specified file format when loading a splat scene. This is useful when loading from a URL where there is no file extension. Valid values are defined in the `SceneFormat` enum: `Ply`, `Splat`, and `KSplat`. |
| `splatAlphaRemovalThreshold` | Ignore any splats with an alpha less than the specified value (valid range: 0 - 255). Defaults to `1`. |
| `showLoadingUI` | Displays a loading spinner and/or loading progress bar while the scene is loading. Defaults to `true`. |
| `position` | Position of the scene, acts as an offset from its default position. Defaults to `[0, 0, 0]`. |
| `rotation` | Rotation of the scene represented as a quaternion. Defaults to `[0, 0, 0, 1]` (identity quaternion). |
| `scale` | Scene's scale. Defaults to `[1, 1, 1]`. |
| `progressiveLoad` | Progressively load the scene's splat data and allow the scene to be rendered and viewed as the splats are loaded. Only valid for `addSplatScene()`, not for `addSplatScenes()`. |

## A fully customized example

```javascript
import * as GaussianSplats3D from 'gle-gaussian-splat-3d';
import * as THREE from 'three';

const renderWidth = 800;
const renderHeight = 600;

const rootElement = document.createElement('div');
rootElement.style.width = renderWidth + 'px';
rootElement.style.height = renderHeight + 'px';
document.body.appendChild(rootElement);

const renderer = new THREE.WebGLRenderer({ antialias: false });
renderer.setSize(renderWidth, renderHeight);
rootElement.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(65, renderWidth / renderHeight, 0.1, 500);
camera.position.copy(new THREE.Vector3().fromArray([-1, -4, 6]));
camera.up = new THREE.Vector3().fromArray([0, -1, -0.6]).normalize();
camera.lookAt(new THREE.Vector3().fromArray([0, 4, -0]));

const viewer = new GaussianSplats3D.Viewer({
    'selfDrivenMode': false,
    'renderer': renderer,
    'camera': camera,
    'useBuiltInControls': false,
    'ignoreDevicePixelRatio': false,
    'gpuAcceleratedSort': true,
    'enableSIMDInSort': true,
    'sharedMemoryForWorkers': true,
    'integerBasedSort': true,
    'halfPrecisionCovariancesOnGPU': true,
    'dynamicScene': false,
    'webXRMode': GaussianSplats3D.WebXRMode.None,
    'renderMode': GaussianSplats3D.RenderMode.OnChange,
    'sceneRevealMode': GaussianSplats3D.SceneRevealMode.Instant,
    'antialiased': false,
    'focalAdjustment': 1.0,
    'logLevel': GaussianSplats3D.LogLevel.None,
    'sphericalHarmonicsDegree': 0,
    'enableOptionalEffects': false,
    'plyInMemoryCompressionLevel': 2,
    'freeIntermediateSplatData': false
});

viewer.addSplatScene('<path to .ply, .ksplat, or .splat file>')
.then(() => {
    requestAnimationFrame(update);
});
```
