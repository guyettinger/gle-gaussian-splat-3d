/**
 * Captures the screenshots used in README.md.
 *
 * Boots the demo server against ./build/demo, loads each demo scene in Chrome, waits for the
 * splat scene to finish loading and reveal itself, and writes a JPEG per scene into
 * public/images/screenshots/.
 *
 * Usage:
 *   node util/capture-screenshots.js                 # all scenes
 *   node util/capture-screenshots.js bonsai garden   # only the named scenes
 *   node util/capture-screenshots.js --headless      # software rendering, see note below
 *
 * Requires `npm run build` to have been run, and the demo scene data to be extracted into
 * build/demo/assets/data (see docs/development.md).
 *
 * Runs headed by default. Gaussian splat rendering leans on the GPU, and headless Chrome falls
 * back to SwiftShader software rendering, which is slow enough on these scenes to time out or
 * capture a half-rendered frame. Use --headless only if you have no display.
 */

import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DEMO_ROOT = path.join(REPO_ROOT, 'build', 'demo');
const OUTPUT_DIR = path.join(REPO_ROOT, 'public', 'images', 'screenshots');

const PORT = 8099;
const ORIGIN = `http://127.0.0.1:${PORT}`;

// Capture size. The image is written at WIDTH * SCALE by HEIGHT * SCALE.
const WIDTH = 960;
const HEIGHT = 600;
const SCALE = 1.5;
const QUALITY = 80;

// How long to wait for a scene to finish loading, and how long to let it settle afterwards so
// the scene-reveal fade completes and the splat sort catches up before we capture.
const LOAD_TIMEOUT_MS = 180000;
const SETTLE_MS = 4000;

const SCENES = [
    { name: 'garden', page: 'garden.html' },
    { name: 'bonsai', page: 'bonsai.html' },
    { name: 'truck', page: 'truck.html' },
    { name: 'stump', page: 'stump.html' }
];

function parseArgs(argv) {
    const args = argv.slice(2);
    const headless = args.includes('--headless');
    const names = args.filter((a) => !a.startsWith('--'));
    const scenes = names.length ? SCENES.filter((s) => names.includes(s.name)) : SCENES;

    const unknown = names.filter((n) => !SCENES.some((s) => s.name === n));
    if (unknown.length) {
        throw new Error(`Unknown scene(s): ${unknown.join(', ')}. ` +
                        `Known scenes: ${SCENES.map((s) => s.name).join(', ')}`);
    }

    return { headless, scenes };
}

function checkPrerequisites(scenes) {
    if (!fs.existsSync(path.join(DEMO_ROOT, 'index.html'))) {
        throw new Error(`${DEMO_ROOT} not found. Run "npm run build" first.`);
    }

    const missing = scenes.filter((scene) => {
        return !fs.existsSync(path.join(DEMO_ROOT, 'assets', 'data', scene.name));
    });

    if (missing.length) {
        throw new Error(`Missing scene data for: ${missing.map((s) => s.name).join(', ')}.\n` +
                        `Extract the demo data into ${path.join(DEMO_ROOT, 'assets', 'data')} ` +
                        `- see docs/development.md`);
    }
}

function startServer() {
    const server = spawn('node', [path.join(REPO_ROOT, 'util', 'server.js'), '-d', DEMO_ROOT, '-p', String(PORT)], {
        stdio: ['ignore', 'ignore', 'inherit']
    });

    return new Promise((resolve, reject) => {
        server.on('error', reject);
        server.on('exit', (code) => reject(new Error(`Demo server exited early with code ${code}`)));

        const deadline = Date.now() + 10000;
        const poll = async () => {
            try {
                const response = await fetch(`${ORIGIN}/index.html`);
                if (response.ok) return resolve(server);
            } catch (e) {
                // Server not up yet.
            }
            if (Date.now() > deadline) return reject(new Error('Demo server did not start within 10s'));
            setTimeout(poll, 200);
        };
        poll();
    });
}

/**
 * Resolves once the viewer has hidden its loading UI and a canvas is present. The loading
 * spinner and progress bar are plain divs the viewer toggles via style.display, so we watch
 * those rather than reaching into the viewer, which the demo pages do not expose globally.
 */
function waitForSceneLoaded(page) {
    return page.waitForFunction(() => {
        const canvas = document.querySelector('canvas');
        if (!canvas || !canvas.width) return false;

        const overlays = document.querySelectorAll('[class^="spinnerOuterContainer"], .progressBarOuterContainer');
        for (const overlay of overlays) {
            if (overlay.style.display !== 'none') return false;
        }

        // A scene that never started loading also has no visible overlay, so require that the
        // viewer actually put something on screen.
        return overlays.length > 0;
    }, { timeout: LOAD_TIMEOUT_MS, polling: 500 });
}

async function capture(browser, scene) {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
        if (message.type() === 'error') errors.push(message.text());
    });

    try {
        await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: SCALE });
        await page.goto(`${ORIGIN}/${scene.page}`, { waitUntil: 'load', timeout: LOAD_TIMEOUT_MS });

        await waitForSceneLoaded(page);
        await new Promise((resolve) => setTimeout(resolve, SETTLE_MS));

        if (errors.length) {
            throw new Error(`Page reported errors:\n  ${errors.join('\n  ')}`);
        }

        const outputPath = path.join(OUTPUT_DIR, `${scene.name}.jpg`);
        await page.screenshot({ path: outputPath, type: 'jpeg', quality: QUALITY });

        const size = (fs.statSync(outputPath).size / 1024).toFixed(0);
        console.log(`  ${scene.name.padEnd(8)} -> ${path.relative(REPO_ROOT, outputPath)} (${size} KB)`);
    } finally {
        await page.close();
    }
}

async function main() {
    const { headless, scenes } = parseArgs(process.argv);
    checkPrerequisites(scenes);
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });

    console.log(`Capturing ${scenes.length} scene(s) at ${WIDTH * SCALE}x${HEIGHT * SCALE}` +
                `${headless ? ' (headless)' : ''}`);

    const server = await startServer();
    let browser;

    try {
        browser = await puppeteer.launch({
            headless,
            args: ['--enable-unsafe-swiftshader', '--hide-scrollbars', '--mute-audio']
        });

        for (const scene of scenes) {
            await capture(browser, scene);
        }
    } finally {
        if (browser) await browser.close();
        server.kill();
    }

    console.log('Done.');
}

main().catch((error) => {
    console.error(`\nFailed: ${error.message}`);
    process.exit(1);
});
