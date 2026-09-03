# The .ksplat format

`.ksplat` is a trimmed-down, compressed version of the original INRIA `.ply` output. It is
smaller on the wire and faster to load than either `.ply` or `.splat`, so it is the format the
demo scenes ship in.

## Compression levels

| Level | What it does |
| --- | --- |
| `0` | No compression |
| `1` | Scale, rotation, position and spherical harmonics coefficients compressed from 32-bit to 16-bit |
| `2` | Same as `1`, except spherical harmonics coefficients are compressed to 8-bit |

## Converting a file

### From the demo page

The easiest option. Run the demo locally (see [Development](development.md)), open
<http://127.0.0.1:8080/index.html>, and use the conversion UI on that page.

### From the browser, programmatically

```javascript
import * as GaussianSplats3D from 'gle-gaussian-splat-3d';

const compressionLevel = 1;
const splatAlphaRemovalThreshold = 5; // out of 255
const sphericalHarmonicsDegree = 1;

GaussianSplats3D.PlyLoader.loadFromURL('<path to .ply or .splat file>',
                                       compressionLevel,
                                       splatAlphaRemovalThreshold,
                                       sphericalHarmonicsDegree)
.then((splatBuffer) => {
    GaussianSplats3D.KSplatLoader.downloadFile(splatBuffer, 'converted_file.ksplat');
});
```

This prompts the browser to download the converted `.ksplat` file.

### From Node.js

A conversion script is included in the repository:

```shell
node util/create-ksplat.js [path to .PLY or .SPLAT] [output file] [compression level = 0] \
  [alpha removal threshold = 1] [scene center = "0,0,0"] [block size = 5.0] \
  [bucket size = 256] [spherical harmonics level = 0]
```

Large scenes may exhaust the default Node heap. Raise it with `--max-old-space-size`:

```shell
node util/create-ksplat.js --max-old-space-size=8192 [... remaining arguments]
```

## Status

The format still needs work, particularly around compression. See [Limitations](limitations.md).
