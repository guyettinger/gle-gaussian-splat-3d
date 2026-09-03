# Limitations and known issues

## Splat count limits

The number of splats that can be rendered depends mainly on the degree of spherical harmonics in
use, since that determines how much data has to be packed into textures:

| Spherical harmonics degree | Max splat count |
| --- | --- |
| `0` | ~ 16,000,000 |
| `1` | ~ 11,000,000 |
| `2` | ~ 8,000,000 |

Improving how splat data is packed into data textures would raise these limits.

## Known issues

- The splat sort runs on the CPU. A GPU-based approach would be better but hasn't been worked out.
- Artifacts are visible when the camera moves or rotates quickly, a consequence of the CPU-based sort.
- Performance on mobile devices is sub-optimal.
- The `.ksplat` format still needs work, especially around compression.
- The default integer-based splat sort does not hold up on larger scenes. Pass
  `integerBasedSort: false` to fall back to a slower floating-point sort.

## Future work

- Improve the way splat data is packed into data textures
- Continue optimizing the CPU-based splat sort — perhaps an incremental sort
- Support very large scenes through streaming and LOD
