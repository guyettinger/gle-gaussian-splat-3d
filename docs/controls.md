# Controls

These apply when the viewer uses its built-in camera controls
(`useBuiltInControls` defaults to `true`).

## Mouse

| Action | Result |
| --- | --- |
| Left click | Set the focal point |
| Left click and drag | Orbit around the focal point |
| Right click and drag | Pan the camera and focal point |

## Keyboard

| Key | Result |
| --- | --- |
| `C` | Toggle the mesh cursor, showing the intersection point of a mouse-projected ray and the splat mesh |
| `I` | Toggle the info panel |
| `U` | Toggle a debug object showing the orientation of the camera controls: a green arrow for the camera's orbital axis, and a white square for the plane at which the camera's elevation angle is 0 |
| `Left arrow` | Rotate the camera's up vector counter-clockwise |
| `Right arrow` | Rotate the camera's up vector clockwise |
| `P` | Toggle point-cloud mode, where each splat is rendered as a filled circle |
| `=` | Increase splat scale |
| `-` | Decrease splat scale |
| `O` | Toggle orthographic mode |

## The info panel

`I` toggles a debugging overlay that displays:

- Camera position
- Camera focal point / look-at point
- Camera up vector
- Mesh cursor position
- Current FPS
- Renderer window size
- Ratio of rendered splats to total splats
- Last splat sort duration
