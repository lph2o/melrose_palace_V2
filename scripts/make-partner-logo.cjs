#!/usr/bin/env node
/**
 * Rasterise le logo du partenaire bancaire (SVG) en PNG pour le web.
 *
 *   node scripts/make-partner-logo.cjs
 *
 * Source : scripts/brand/partenaire-bis.svg — le logo officiel de la Banque
 * Islamique du Sénégal, tel que publié par la banque elle-même.
 * Sortie : public/images/partenaire-bis.png, sur fond TRANSPARENT.
 *
 * POURQUOI UN PNG ET PAS LE SVG. Le SVG est plus net et plus léger, mais le
 * bucket Supabase ne reçoit son type MIME que par une table d'extension :
 * `contentTypeOf()` dans `upload-media.cjs` ne connaît pas `.svg` et le
 * téléverserait en `application/octet-stream`, où les navigateurs refusent de
 * l'afficher. Le PNG est aussi ce que fait déjà la marque du site
 * (`logo-lockup.png`), donc l'ensemble reste cohérent.
 *
 * POURQUOI CHROME. Aucun moteur SVG n'est fourni par macOS ni par Node, et
 * ajouter une dépendance npm (sharp, resvg) pour un seul fichier serait
 * disproportionné. Chrome est déjà requis par `scripts/brochure/render.cjs`,
 * on réutilise donc la même détection.
 *
 * Le rendu se fait à `--scale` fois la taille d'affichage : le logo est posé à
 * 36 px de haut dans la section bancaire, 3× suffit largement pour les écrans
 * denses.
 */
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const ROOT = path.resolve(__dirname, '..');
const SOURCE = path.join(__dirname, 'brand', 'partenaire-bis.svg');
const OUT = path.join(ROOT, 'public', 'images', 'partenaire-bis.png');

/* Hauteur d'affichage dans BankingSection, et son multiple pour le rendu. */
const DISPLAY_HEIGHT = 36;
const SCALE = 3;

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
  throw new Error('Chrome/Chromium introuvable. Installez Google Chrome ou définissez CHROME_PATH.');
}

if (!fs.existsSync(SOURCE)) {
  throw new Error(
    `Source absente : ${SOURCE}\n` +
      'Le logo du partenaire est un fichier tiers : le récupérer sur le site de la banque.'
  );
}

/* Le ratio du viewBox détermine la largeur : on ne le code pas en dur, sinon
   un changement de logo produirait une image étirée. */
const svg = fs.readFileSync(SOURCE, 'utf8');
const viewBox = svg.match(/viewBox="([\d.\s-]+)"/);
if (!viewBox) throw new Error(`viewBox introuvable dans ${SOURCE}`);
const [, , vbWidth, vbHeight] = viewBox[1].trim().split(/\s+/).map(Number);
if (!vbWidth || !vbHeight) throw new Error(`viewBox illisible : ${viewBox[1]}`);

const height = DISPLAY_HEIGHT * SCALE;
const width = Math.round((vbWidth / vbHeight) * height);

fs.mkdirSync(path.dirname(OUT), { recursive: true });

/* Page de rendu : le SVG à la taille exacte voulue, sans marge ni fond. */
const page = path.join(__dirname, 'brand', '.render.html');
fs.writeFileSync(
  page,
  `<!doctype html><meta charset="utf-8">
<style>html,body{margin:0;padding:0;background:transparent}
img{display:block;width:${width}px;height:${height}px}</style>
<img src="${pathToFileURL(SOURCE).href}">`
);

try {
  execFileSync(
    findChrome(),
    [
      '--headless',
      '--disable-gpu',
      '--hide-scrollbars',
      /* Fond transparent : le logo doit pouvoir se poser sur n'importe quelle
         surface claire sans traîner de rectangle blanc. */
      '--default-background-color=00000000',
      `--window-size=${width},${height}`,
      `--screenshot=${OUT}`,
      pathToFileURL(page).href,
    ],
    { stdio: ['ignore', 'ignore', 'ignore'] }
  );
} finally {
  fs.rmSync(page, { force: true });
}

const size = fs.statSync(OUT).size;
console.log(`✓ ${path.relative(ROOT, OUT)} — ${width}×${height}, ${(size / 1024).toFixed(1)} Ko`);
console.log(`  source ${path.relative(ROOT, SOURCE)} (viewBox ${vbWidth}×${vbHeight})`);
console.log(`  affiché à ${DISPLAY_HEIGHT} px de haut dans la section bancaire, rendu ${SCALE}×`);
