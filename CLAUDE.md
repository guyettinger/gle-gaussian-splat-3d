@AGENTS.md

## Claude Code

- Read [AGENTS.md](AGENTS.md) above for build commands, layout, conventions, and pitfalls. It is
  the source of truth; add project-wide guidance there, not here, so other agents see it too.
- `src/Viewer.js` and `src/splatmesh/SplatMesh.js` are both very large. Grep for the relevant
  method and read a window around it rather than reading either file whole.
- Shader code lives inside `src/splatmesh/SplatMaterial*.js` as template strings. Changes there
  can't be verified by a build alone — say so plainly rather than claiming a visual change works.
- There are no tests, so don't claim a change is verified on the strength of `npm run build`
  succeeding. State what you actually ran.
