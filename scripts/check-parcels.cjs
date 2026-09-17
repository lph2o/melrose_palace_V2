#!/usr/bin/env node
/**
 * Garde-fou cadastral : les lots, leurs surfaces et le plan officiel doivent
 * raconter la même histoire.
 *
 * Pourquoi ce script existe : l'audit du domaine a relevé 13 lots dont la
 * surface affichée contredisait les dimensions imprimées juste à côté
 * (« 10.00 m × 12.00 m » annoncé 150 m²). La surface est désormais dérivée
 * (`computeParcelArea`) au lieu d'être saisie à la main. Mais le domaine a
 * DEUX sources qui peuvent rediverger :
 *
 *   - `src/data.ts`            → surface, cotes, zone de chaque lot ;
 *   - `src/cadastreGeometry.ts` → tracé, cotes et zone du plan officiel.
 *
 * Les surcharges de l'Espace Gérant (table Supabase `parcels`) passent par la
 * même règle au runtime (`reconcileParcelArea`) ; le script en vérifie ici la
 * mécanique, pour qu'elle ne puisse pas être cassée sans que le build le dise.
 *
 * Enfin, la base elle-même refuse une surface qui contredit les cotes
 * (déclencheur `parcels_enforce_cadastre`, supabase/schema.sql section 6). Le
 * référentiel qu'il consulte est recopié de `PARCELS` : le script compare les
 * deux, sinon une correction de cote dans `src/data.ts` ferait rejeter par la
 * base des écritures parfaitement légitimes.
 *
 * Le script compile ces deux modules à la volée (esbuild) plutôt que de
 * recopier la liste des lots : une liste dupliquée finirait par diverger, et le
 * garde-fou ne garderait plus rien.
 *
 * Exécuté avant chaque build (script npm « prebuild ») : en cas d'écart, le
 * déploiement s'arrête au lieu de publier une fiche incohérente.
 *
 * Lancement manuel : npm run verify:parcels
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const esbuild = require('esbuild');
const { ROOT } = require('./lib/site-url.cjs');

const EXPECTED_LOTS = 54;
const BORNE_COUNT = 17;

/**
 * Cas de référence : ils figent le contrat du dérivé (rectangle, trapèze dans
 * les deux sens, mention entre parenthèses ignorée). Une régression du parsing
 * les fait échouer même si tous les lots restent « cohérents » entre eux.
 */
const FIXTURES = [
  ['15.00 m × 10.00 m', 150],
  ['10.00 m × 12.00 m', 120],
  ['12.00 m × 12.00 m', 144],
  ['15.00 m × 8.00 / 12.00 m', 150],
  ['10.00 m / 18.00 m × 12.00 m', 168],
  ['15.00 m × 10.00 / 4.77 m', 111],
  ['30.00 m × 15.00 m (Façade Nord B1)', 450],
];

const errors = [];

/** Charge un module TypeScript de `src/` depuis Node en le compilant à la volée. */
function loadModule(relativePath) {
  const bundle = esbuild.buildSync({
    entryPoints: [path.join(ROOT, relativePath)],
    bundle: true,
    format: 'cjs',
    platform: 'node',
    logLevel: 'silent',
    write: false,
  });
  const tmp = path.join(
    os.tmpdir(),
    `check-parcels-${process.pid}-${path.basename(relativePath)}.cjs`
  );
  fs.writeFileSync(tmp, bundle.outputFiles[0].text);
  try {
    return require(tmp);
  } finally {
    fs.unlinkSync(tmp);
  }
}

const {
  PARCELS,
  computeParcelArea,
  parseParcelCotes,
  expectedParcelArea,
  reconcileParcelArea,
  PARCEL_AREA_OVERRIDES,
  DEFAULT_SITE_SETTINGS,
} = loadModule('src/data.ts');
const { buildParcelSchedule, validateParcelPrices } = loadModule('src/lib/payment.ts');
const { CADASTRAL_PARCELS_GEO, CADASTRAL_BORNES, CADASTRAL_PERIMETER_MEASUREMENTS } =
  loadModule('src/cadastreGeometry.ts');

/* ---------------------------------------------------------------- surfaces */

FIXTURES.forEach(([dimensions, expected]) => {
  const got = computeParcelArea(dimensions);
  if (got !== expected) {
    errors.push(`Dérivé cassé : « ${dimensions} » → ${got} m² (attendu ${expected} m²)`);
  }
});

if (!Array.isArray(PARCELS) || PARCELS.length !== EXPECTED_LOTS) {
  errors.push(
    `Attendu ${EXPECTED_LOTS} parcelles, trouvé ${Array.isArray(PARCELS) ? PARCELS.length : 'rien'}`
  );
}

const seen = new Set();
for (const parcel of PARCELS ?? []) {
  if (seen.has(parcel.id)) errors.push(`Lot #${parcel.id} défini plusieurs fois`);
  seen.add(parcel.id);

  if (!parcel.dimensions) {
    errors.push(`Lot #${parcel.id} sans cotes : impossible de dériver sa surface`);
    continue;
  }

  const expected = expectedParcelArea(parcel.id, parcel.dimensions);
  if (parcel.area !== expected) {
    errors.push(
      `Lot #${parcel.id} : ${parcel.area} m² affiché ≠ ${expected} m² déduit de « ${parcel.dimensions} »`
    );
  }
  if (!(parcel.area > 0)) {
    errors.push(`Lot #${parcel.id} : surface invalide (${parcel.area} m²)`);
  }

  // Prix : désormais éditables dans l'Espace Gérant, donc à vérifier ici aussi.
  if (!Number.isInteger(parcel.price) || parcel.price <= 0) {
    errors.push(`Lot #${parcel.id} : prix échelonné invalide (${parcel.price} €)`);
  }
  if (
    !Number.isInteger(parcel.cashPrice) ||
    parcel.cashPrice <= 0 ||
    parcel.cashPrice > parcel.price
  ) {
    errors.push(
      `Lot #${parcel.id} : prix comptant ${parcel.cashPrice} € incohérent avec le prix ` +
        `échelonné ${parcel.price} € (le comptant doit rester sous le prix, sinon la ` +
        'remise affichée devient négative)'
    );
  }
}

/* -------------------------------------------------- échéancier d'un lot */

// La fiche du lot, l'infobulle du plan, la fiche PDF et l'Espace Gérant
// partagent une seule règle (`buildParcelSchedule`, sur le prix du lot). Ces
// cas la figent : un prix plus haut allonge la durée, un acompte plus gros que
// le prix est ramené à ce prix, et le total payé égale toujours le prix.
const RATES = {
  defaultDeposit: DEFAULT_SITE_SETTINGS.defaultDeposit,
  defaultMonthly: DEFAULT_SITE_SETTINGS.defaultMonthly,
};

const reference = buildParcelSchedule(DEFAULT_SITE_SETTINGS.basePrice, RATES);
if (reference.duration !== 40 || reference.total !== DEFAULT_SITE_SETTINGS.basePrice) {
  errors.push(
    `Échéancier du lot type : ${reference.duration} mois / ${reference.total} € ` +
      `(attendu 40 mois / ${DEFAULT_SITE_SETTINGS.basePrice} €)`
  );
}

// Le prix du lot est bien l'entrée : 20 000 € doit allonger la durée, pas la
// laisser à celle du lot type (c'était le cas avant que la fiche ne lise le prix).
const pricier = buildParcelSchedule(DEFAULT_SITE_SETTINGS.basePrice + 5000, RATES);
if (pricier.duration === reference.duration || pricier.total !== DEFAULT_SITE_SETTINGS.basePrice + 5000) {
  errors.push(
    `Échéancier : +5 000 € sur le prix ne change pas la durée (${pricier.duration} mois, ` +
      `${pricier.total} €) — le prix du lot ne pilote plus son échéancier`
  );
}

// Lot moins cher que l'acompte par défaut : l'acompte est ramené au prix.
const cheap = buildParcelSchedule(Math.round(DEFAULT_SITE_SETTINGS.defaultDeposit / 2), RATES);
if (cheap.deposit !== Math.round(DEFAULT_SITE_SETTINGS.defaultDeposit / 2) || cheap.remaining !== 0) {
  errors.push(
    `Échéancier d'un lot sous l'acompte par défaut : acompte ${cheap.deposit} € / reste ` +
      `${cheap.remaining} € (attendu acompte = prix, rien à échelonner)`
  );
}

for (const parcel of PARCELS ?? []) {
  const schedule = buildParcelSchedule(parcel.price, RATES);
  if (schedule.total !== parcel.price) {
    errors.push(
      `Lot #${parcel.id} : acompte + versements = ${schedule.total} € ≠ prix ${parcel.price} €`
    );
  }
}

// La saisie du Gérant (onglet Parcelles) doit refuser une paire de prix
// incohérente, sinon la fiche annoncerait une remise négative. Cas limites
// figés : entier attendu, comptant sous le prix.
[
  [0, 0, 'prix nul'],
  [-5000, 1000, 'prix négatif'],
  [15000.5, 13500, 'prix non entier'],
  [15000, 16000, 'comptant au-dessus du prix'],
  [15000, 0, 'comptant nul'],
].forEach(([price, cashPrice, label]) => {
  if (validateParcelPrices(price, cashPrice).ok) {
    errors.push(`Saisie de prix acceptée à tort (${label}) : ${price} € / ${cashPrice} €`);
  }
});

if (!validateParcelPrices(15000, 13500).ok) {
  errors.push('Saisie de prix refusée à tort : 15 000 € / 13 500 €');
}
if (!validateParcelPrices(15000, 15000).ok) {
  errors.push('Saisie de prix refusée à tort : comptant égal au prix (remise nulle)');
}

/* -------------------------------------------------- surcharges de l'admin */

// La réconciliation runtime doit ramener une surcharge incohérente sur les
// cotes, laisser passer un lot déjà juste, et respecter l'exception de forme.
// On tait l'avertissement : il est attendu, et le script le rapporte lui-même.
const warn = console.warn;
console.warn = () => {};
try {
  const broken = reconcileParcelArea({ id: 2, area: 999, dimensions: '10.00 m × 12.00 m' });
  if (broken.area !== 120) {
    errors.push(
      `Réconciliation d'une surcharge : surface ${broken.area} m² au lieu des 120 m² attendus`
    );
  }

  const coherent = { id: 5, area: 150, dimensions: '15.00 m × 10.00 m' };
  if (reconcileParcelArea(coherent) !== coherent) {
    errors.push('Réconciliation : un lot déjà cohérent est recopié sans raison');
  }

  const shapeOverride = reconcileParcelArea({
    id: 54,
    area: 999,
    dimensions: '30.00 m × 15.00 m (Façade Nord B1)',
  });
  if (shapeOverride.area !== 225) {
    errors.push(
      `Réconciliation : exception de forme ignorée (lot 54 → ${shapeOverride.area} m² au lieu de 225 m²)`
    );
  }
} finally {
  console.warn = warn;
}

/* ------------------------------------------------------------------- plan */

const geoIds = Object.keys(CADASTRAL_PARCELS_GEO ?? {}).map(Number);

for (const parcel of PARCELS ?? []) {
  const geo = CADASTRAL_PARCELS_GEO?.[parcel.id];
  if (!geo) {
    errors.push(`Lot #${parcel.id} absent du plan cadastral (aucun tracé)`);
    continue;
  }

  const cotesData = parseParcelCotes(parcel.dimensions ?? '');
  const cotesPlan = parseParcelCotes(geo.dimensions ?? '');
  if (JSON.stringify(cotesData) !== JSON.stringify(cotesPlan)) {
    errors.push(
      `Lot #${parcel.id} : cotes divergentes — data « ${parcel.dimensions} » [${cotesData}] ` +
        `vs plan « ${geo.dimensions} » [${cotesPlan}]`
    );
  }

  if (geo.zone !== parcel.zone) {
    errors.push(`Lot #${parcel.id} : zone « ${geo.zone} » sur le plan ≠ « ${parcel.zone} » dans les données`);
  }
  if (geo.zoneNameFR !== parcel.zoneName?.FR) {
    errors.push(
      `Lot #${parcel.id} : libellé de zone « ${geo.zoneNameFR} » sur le plan ≠ « ${parcel.zoneName?.FR} » dans les données`
    );
  }

  // Les cotes de tracé ne peuvent ni dépasser la plus grande cote ni tomber
  // sous la plus petite : elles décrivent la même emprise que le plan.
  const min = Math.min(...cotesPlan);
  const max = Math.max(...cotesPlan);
  for (const [name, value] of [
    ['widthM', geo.widthM],
    ['depthM', geo.depthM],
  ]) {
    if (!(value >= min - 1e-9 && value <= max + 1e-9)) {
      errors.push(
        `Lot #${parcel.id} : ${name} = ${value} hors des cotes [${min} … ${max}] de « ${geo.dimensions} »`
      );
    }
  }

  // L'emprise du tracé doit couvrir la surface : une cote oubliée la
  // sous-estimerait, ce qui est exactement le symptôme d'origine.
  const bounding = Math.round(geo.widthM * geo.depthM);
  if (bounding < parcel.area) {
    errors.push(
      `Lot #${parcel.id} : emprise du plan ${geo.widthM} × ${geo.depthM} = ${bounding} m² ` +
        `< surface ${parcel.area} m²`
    );
  }
}

for (const id of geoIds) {
  if (!(PARCELS ?? []).some((parcel) => parcel.id === id)) {
    errors.push(`Le plan trace un lot #${id} qui n'existe pas dans les données`);
  }
}

const bornes = (CADASTRAL_BORNES ?? []).map((borne) => borne.id);
if (bornes.length !== BORNE_COUNT) {
  errors.push(`Attendu ${BORNE_COUNT} bornes (B1 à B${BORNE_COUNT}), trouvé ${bornes.length}`);
}
bornes.forEach((id, index) => {
  if (id !== `B${index + 1}`) {
    errors.push(`Borne n°${index + 1} nommée « ${id} » au lieu de « B${index + 1} »`);
  }
});

const bornesSet = new Set(bornes);
for (const segment of CADASTRAL_PERIMETER_MEASUREMENTS ?? []) {
  for (const end of [segment.from, segment.to]) {
    if (!bornesSet.has(end)) {
      errors.push(`Cote périmétrique ${segment.from}→${segment.to} référence la borne inconnue « ${end} »`);
    }
  }
  if (!segment.dimension) {
    errors.push(`Cote périmétrique ${segment.from}→${segment.to} sans mesure`);
  }
}

/* --------------------------------------------------- référentiel Postgres */

// Le déclencheur PL/pgSQL ne peut pas appeler `computeParcelArea` : le
// référentiel est donc recopié en SQL. Cette comparaison est ce qui empêche la
// copie de prendre du retard sur la source.
const SCHEMA_PATH = path.join(ROOT, 'supabase', 'schema.sql');
const schema = fs.existsSync(SCHEMA_PATH) ? fs.readFileSync(SCHEMA_PATH, 'utf8') : '';

const seedBlock = schema.match(
  /insert into public\.parcel_cadastre \(id, dimensions, area\) values([\s\S]*?)on conflict \(id\) do update/
);

if (!schema) {
  errors.push('supabase/schema.sql introuvable : référentiel cadastral non vérifiable');
} else if (!seedBlock) {
  errors.push(
    'Bloc « insert into public.parcel_cadastre … » introuvable dans supabase/schema.sql (section 6)'
  );
} else {
  const sqlRows = new Map();
  const rowPattern = /\(\s*(\d+),\s*'((?:[^']|'')*)',\s*([\d.]+)\s*\)/g;
  let match;
  while ((match = rowPattern.exec(seedBlock[1])) !== null) {
    sqlRows.set(Number(match[1]), {
      dimensions: match[2].replace(/''/g, "'"),
      area: Number(match[3]),
    });
  }

  for (const parcel of PARCELS ?? []) {
    const row = sqlRows.get(parcel.id);
    if (!row) {
      errors.push(
        `Référentiel SQL : le lot #${parcel.id} manque — à ajouter dans supabase/schema.sql (section 6)`
      );
    } else if (row.dimensions !== parcel.dimensions || row.area !== parcel.area) {
      errors.push(
        `Référentiel SQL désynchronisé, lot #${parcel.id} : SQL « ${row.dimensions} » = ${row.area} m² ` +
          `vs data.ts « ${parcel.dimensions} » = ${parcel.area} m²`
      );
    }
  }

  for (const id of sqlRows.keys()) {
    if (!(PARCELS ?? []).some((parcel) => parcel.id === id)) {
      errors.push(`Référentiel SQL : le lot #${id} n'existe pas dans src/data.ts`);
    }
  }
}

/* ------------------------------------------------------------------ sortie */

if (errors.length) {
  console.error(`✖ Cadastre incohérent (${errors.length} problème(s)) :`);
  for (const error of errors) console.error(`   • ${error}`);
  console.error(
    '\nCorrigez `src/data.ts`, `src/cadastreGeometry.ts`, `src/lib/payment.ts` ' +
      'ou `supabase/schema.sql` avant de reconstruire.'
  );
  process.exit(1);
}

const exceptions = Object.keys(PARCEL_AREA_OVERRIDES).length;
console.log(
  `✓ Cadastre cohérent : ${PARCELS.length} lots, surfaces dérivées des cotes` +
    (exceptions ? ` (${exceptions} exception(s) de forme documentée)` : '') +
    ', surcharges Gérant réconciliées' +
    `, plan aligné (${bornes.length} bornes, ${CADASTRAL_PERIMETER_MEASUREMENTS.length} cotes périmétriques)` +
    ', échéanciers dérivés des prix des lots' +
    ', référentiel Postgres à jour.'
);
