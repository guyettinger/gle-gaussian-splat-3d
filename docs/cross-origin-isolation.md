# Cross-origin isolation

By default, `Viewer` uses shared memory — a typed array backed by a `SharedArrayBuffer` — to talk
to the web worker that sorts splats. Browsers only expose `SharedArrayBuffer` to
[cross-origin isolated](https://web.dev/articles/cross-origin-isolation-guide) pages, so your
server has to send two extra headers.

Without them you will see something like this in the console:

```
DOMException: Failed to execute 'postMessage' on 'DedicatedWorkerGlobalScope':
SharedArrayBuffer transfer requires self.crossOriginIsolated.
```

The headers are:

```
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

## The escape hatch

If you can't set headers on your server, pass `sharedMemoryForWorkers: false` to the `Viewer`
constructor. In that case you should also set `gpuAcceleratedSort: false`, since GPU-accelerated
sorting is only recommended alongside shared memory. Expect slower sorting.

## Local development server

The demo server included in this repository (`util/server.js`) already sets both headers:

```javascript
response.setHeader("Cross-Origin-Opener-Policy", "same-origin");
response.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
```

## Apache

Add to `.htaccess`:

```apache
Header add Cross-Origin-Opener-Policy "same-origin"
Header add Cross-Origin-Embedder-Policy "require-corp"
```

You may also need to force a secure connection by redirecting `http://` to `https://`:

```apache
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule (.*) https://%{HTTP_HOST}%{REQUEST_URI} [R,L]
```

## Vite

One option is the
[vite-plugin-cross-origin-isolation](https://github.com/chaosprint/vite-plugin-cross-origin-isolation)
plugin. Or set the headers inline in `vite.config.js`:

```javascript
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    {
      name: "configure-response-headers",
      configureServer: (server) => {
        server.middlewares.use((_req, res, next) => {
          res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
          res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
          next();
        });
      },
    },
  ],
});
```

Other approaches are discussed in
[mkkellogg/GaussianSplats3D#41](https://github.com/mkkellogg/GaussianSplats3D/issues/41).
