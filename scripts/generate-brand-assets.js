#!/usr/bin/env node
/**
 * Regenerate the Android launcher icons and the boot-splash logo from the brand SVGs.
 *
 * There is no native SVG rasteriser in the toolchain, so every asset is rendered by
 * headless Chrome from a throwaway page whose body is exactly the target pixel size.
 * That keeps the output 1:1 with each density bucket without adding a dependency.
 *
 *   node scripts/generate-brand-assets.js
 *
 * Override the browser with CHROME_PATH when Chrome is not in /Applications.
 */
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const RES_DIR = path.join(ROOT, 'android/app/src/main/res');
const DEBUG_RES_DIR = path.join(ROOT, 'android/app/src/debug/res');
const BRAND_DIR = path.join(ROOT, 'src/assets/brand');
const COLORS_XML = path.join(RES_DIR, 'values/colors.xml');
const DEBUG_COLORS_XML = path.join(DEBUG_RES_DIR, 'values/colors.xml');

const CHROME =
  process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const APP_ICON = path.join(BRAND_DIR, 'app-icon.svg');
const APP_ICON_MONOCHROME = path.join(BRAND_DIR, 'app-icon-monochrome.svg');

/** density bucket -> scale factor relative to mdpi */
const DENSITIES = [
  ['mdpi', 1],
  ['hdpi', 1.5],
  ['xhdpi', 2],
  ['xxhdpi', 3],
  ['xxxhdpi', 4],
];

const ADAPTIVE_ICON_DP = 108;
const LEGACY_ICON_DP = 48;
const BOOTSPLASH_DP = 288;

/**
 * The artwork occupies ~72% of the 512 viewBox, so the frame scale below is what
 * decides the rendered mark size.
 *   - adaptive foreground: 70% frame -> ~53% of the canvas, keeping ~5dp above
 *     and ~10dp below the drop inside the 72dp visible tile
 *   - legacy icons: 90% frame, they have no safe-area rule
 *   - splash logo: 61.5% frame -> a 128dp mark inside the 288dp splash canvas
 */
const FOREGROUND_SCALE = 0.7;
const LEGACY_SCALE = 0.9;
const BOOTSPLASH_SCALE = 0.615;

function readLauncherBackground(colorsXml) {
  const xml = fs.readFileSync(colorsXml, 'utf8');
  const match = /<color name="ic_launcher_background">\s*(#[0-9a-fA-F]{3,8})\s*<\/color>/.exec(xml);
  if (!match) {
    throw new Error(`ic_launcher_background not found in ${colorsXml}`);
  }
  return match[1];
}

function pngSize(file) {
  const buffer = fs.readFileSync(file);
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

function createRenderer(tmpDir) {
  return function render(name, size, { svg, scale = 1, background, radius }) {
    const markSize = Math.round(size * scale);
    const page = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
  html, body { margin: 0; padding: 0; width: ${size}px; height: ${size}px; overflow: hidden; background: transparent; }
  .frame { width: ${size}px; height: ${size}px; display: flex; align-items: center; justify-content: center;
           background: ${background ?? 'transparent'}; border-radius: ${radius ?? 0}; }
  .frame img { display: block; width: ${markSize}px; height: ${markSize}px; }
</style></head><body>
  <div class="frame"><img src="file://${svg}" /></div>
</body></html>`;

    const htmlPath = path.join(tmpDir, `${name}.html`);
    const pngPath = path.join(tmpDir, `${name}.png`);
    fs.writeFileSync(htmlPath, page);

    execFileSync(
      CHROME,
      [
        '--headless=new',
        '--disable-gpu',
        '--hide-scrollbars',
        '--force-device-scale-factor=1',
        '--default-background-color=00000000',
        `--screenshot=${pngPath}`,
        `--window-size=${size},${size}`,
        `file://${htmlPath}`,
      ],
      { stdio: 'ignore' },
    );

    if (!fs.existsSync(pngPath)) {
      throw new Error(`headless Chrome produced no screenshot for ${name}`);
    }

    const actual = pngSize(pngPath);
    if (actual.width !== size || actual.height !== size) {
      throw new Error(
        `${name}: expected ${size}x${size}, got ${actual.width}x${actual.height}`,
      );
    }

    return pngPath;
  };
}

function writeAsset(source, target) {
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
}

function main() {
  if (!fs.existsSync(CHROME)) {
    throw new Error(`Chrome not found at ${CHROME}. Set CHROME_PATH to override.`);
  }
  for (const svg of [APP_ICON, APP_ICON_MONOCHROME]) {
    if (!fs.existsSync(svg)) {
      throw new Error(`Missing brand asset: ${svg}`);
    }
  }

  const background = readLauncherBackground(COLORS_XML);
  // Adaptive icons resolve the background colour at build time, so debug only needs
  // the API 24-25 legacy bitmaps re-rendered against its own colour.
  const debugBackground = fs.existsSync(DEBUG_COLORS_XML)
    ? readLauncherBackground(DEBUG_COLORS_XML)
    : null;
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pennysplash-brand-'));
  const render = createRenderer(tmpDir);
  const written = [];

  try {
    for (const [bucket, density] of DENSITIES) {
      const foregroundSize = Math.round(ADAPTIVE_ICON_DP * density);
      const legacySize = Math.round(LEGACY_ICON_DP * density);
      const splashSize = Math.round(BOOTSPLASH_DP * density);

      writeAsset(
        render(`foreground-${bucket}`, foregroundSize, {
          svg: APP_ICON,
          scale: FOREGROUND_SCALE,
        }),
        path.join(RES_DIR, `mipmap-${bucket}/ic_launcher_foreground.png`),
      );

      writeAsset(
        render(`monochrome-${bucket}`, foregroundSize, {
          svg: APP_ICON_MONOCHROME,
          scale: FOREGROUND_SCALE,
        }),
        path.join(RES_DIR, `mipmap-${bucket}/ic_launcher_monochrome.png`),
      );

      writeAsset(
        render(`launcher-${bucket}`, legacySize, {
          svg: APP_ICON,
          scale: LEGACY_SCALE,
          background,
          radius: '22%',
        }),
        path.join(RES_DIR, `mipmap-${bucket}/ic_launcher.png`),
      );

      writeAsset(
        render(`launcher-round-${bucket}`, legacySize, {
          svg: APP_ICON,
          scale: LEGACY_SCALE,
          background,
          radius: '50%',
        }),
        path.join(RES_DIR, `mipmap-${bucket}/ic_launcher_round.png`),
      );

      if (debugBackground) {
        writeAsset(
          render(`debug-launcher-${bucket}`, legacySize, {
            svg: APP_ICON,
            scale: LEGACY_SCALE,
            background: debugBackground,
            radius: '22%',
          }),
          path.join(DEBUG_RES_DIR, `mipmap-${bucket}/ic_launcher.png`),
        );

        writeAsset(
          render(`debug-launcher-round-${bucket}`, legacySize, {
            svg: APP_ICON,
            scale: LEGACY_SCALE,
            background: debugBackground,
            radius: '50%',
          }),
          path.join(DEBUG_RES_DIR, `mipmap-${bucket}/ic_launcher_round.png`),
        );
      }

      writeAsset(
        render(`bootsplash-${bucket}`, splashSize, {
          svg: APP_ICON,
          scale: BOOTSPLASH_SCALE,
        }),
        path.join(RES_DIR, `drawable-${bucket}/bootsplash_logo.png`),
      );

      written.push(`${bucket}: icon ${legacySize}px, foreground ${foregroundSize}px, splash ${splashSize}px`);
    }
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }

  console.log(`Launcher background: ${background}`);
  if (debugBackground) {
    console.log(`Debug launcher background: ${debugBackground}`);
  }
  for (const line of written) {
    console.log(`  ${line}`);
  }
  console.log('Brand assets regenerated.');
}

main();
