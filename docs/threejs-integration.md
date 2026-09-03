# Three.js integration

There are two ways to combine your own Three.js content with the splat renderer.

## Pass a scene to the viewer

Hand the viewer a `THREE.Scene` and it will render your objects along with the splats:

```javascript
import * as GaussianSplats3D from 'gle-gaussian-splat-3d';
import * as THREE from 'three';

const threeScene = new THREE.Scene();
const boxColor = 0xBBBBBB;
const boxGeometry = new THREE.BoxGeometry(2, 2, 2);
const boxMesh = new THREE.Mesh(boxGeometry, new THREE.MeshBasicMaterial({ 'color': boxColor }));
boxMesh.position.set(3, 2, 2);
threeScene.add(boxMesh);

const viewer = new GaussianSplats3D.Viewer({
    'threeScene': threeScene
});

viewer.addSplatScene('<path to .ply, .ksplat, or .splat file>')
.then(() => {
    viewer.start();
});
```

This only works correctly for objects that write to the depth buffer — that is, standard opaque
objects. Transparent objects are not currently supported.

## Drop the viewer into your scene

`DropInViewer` wraps `Viewer` in a Three.js `Object3D`, so you can add it to a scene you already
own and keep your existing render loop:

```javascript
import * as GaussianSplats3D from 'gle-gaussian-splat-3d';
import * as THREE from 'three';

const threeScene = new THREE.Scene();

const viewer = new GaussianSplats3D.DropInViewer({
    'gpuAcceleratedSort': true
});

viewer.addSplatScenes([{
        'path': '<path to .ply, .ksplat, or .splat file>',
        'splatAlphaRemovalThreshold': 5
    },
    {
        'path': '<path to .ply, .ksplat, or .splat file>',
        'rotation': [0, -0.857, -0.514495, 6.123233995736766e-17],
        'scale': [1.5, 1.5, 1.5],
        'position': [0, -2, -1.2]
    }
]);

threeScene.add(viewer);
```

`DropInViewer` accepts the same options as `Viewer` (see [Viewer options](viewer-options.md)),
minus the ones that concern owning the render loop.
