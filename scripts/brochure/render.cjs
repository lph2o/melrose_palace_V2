#!/usr/bin/env node
/**
 * Régénère la plaquette PDF depuis scripts/brochure/plaquette.html.
 *
 *   node scripts/brochure/render.cjs               → public/pdf/Dun-Tni-Brochure-Premium.pdf
 *   node scripts/brochure/render.cjs --out /tmp/x.pdf
 *
 * Chrome headless imprime en A4 avec les fonds (`print-color-adjust:exact`
 * est posé dans le CSS de la plaquette). Pas de dépendance npm : on pilote le
 * Chrome déjà installé, sinon on échoue avec un message explicite.
 */
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const ROOT = path.resolve(__dirname, '..', '..');
const SOURCE = path.join(__dirname, 'plaquette.html');

const CANDIDATES = [
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].filter(Boolean);

function findChrome() {
  for (const c of CANDIDATES) {
    try {
      fs.accessSync(c, fs.constants.X_OK);
      return c;
    } catch {}
  }
  throw new Error(
    'Chrome/Chromium introuvable. Installez Google Chrome ou définissez CHROME_PATH.'
  );
}

function arg(name, fallback) {
  const i = process.argv.indexOf(name);
  return i === -1 ? fallback : process.argv[i + 1];
}

const out = path.resolve(arg('--out', path.join(ROOT, 'public/pdf/Dun-Tni-Brochure-Premium.pdf')));

if (!fs.existsSync(SOURCE)) {
  throw new Error(`Source absente : ${SOURCE}`);
}
fs.mkdirSync(path.dirname(out), { recursive: true });

const chrome = findChrome();
execFileSync(
  chrome,
  [
    '--headless',
    '--disable-gpu',
    '--no-pdf-header-footer',
    '--run-all-compositor-stages-before-draw',
    '--virtual-time-budget=20000',
    `--print-to-pdf=${out}`,
    pathToFileURL(SOURCE).href,
  ],
  { stdio: ['ignore', 'inherit', 'inherit'] }
);

const size = fs.statSync(out).size;
console.log(`✓ ${path.relative(ROOT, out)} — ${(size / 1024 / 1024).toFixed(2)} Mo`);
