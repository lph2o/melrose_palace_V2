#!/usr/bin/env node
/**
 * Migration des médias vers Supabase Storage (bucket `site-media`).
 *
 * - Téléverse les fichiers de public/images, public/videos et public/pdf
 *   (et les placeholders Unsplash : hero, blog, avatars) dans le bucket,
 *   en conservant des noms de chemin propres et stables.
 * - Écrit le mapping ancien chemin → URL publique dans scripts/media-urls.json
 *   (fichier jetable, non committé).
 *
 * Prérequis :
 *   .env à la racine avec NEXT_PUBLIC_SUPABASE_URL,
 *   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, et SIC_ADMIN_PASSWORD
 *   (mot de passe du compte admin thiamabda@gmail.com).
 *
 * Usage :
 *   node scripts/upload-media.cjs
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const ROOT = path.join(__dirname, '..');
const BUCKET = 'site-media';
const ADMIN_EMAIL = 'thiamabda@gmail.com';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
// Tolère l'orthographe exacte ET la faute de frappe fréquente « SERICE » dans .env.local.
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERICE_ROLE_KEY;
const password = process.env.SIC_ADMIN_PASSWORD;

if (!url) {
  console.error('Erreur : NEXT_PUBLIC_SUPABASE_URL manquante dans .env.local');
  process.exit(1);
}
if (!serviceRoleKey && !publishableKey) {
  console.error('Erreur : aucune clé — ajoutez SUPABASE_SERVICE_ROLE_KEY ou NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY dans .env.local');
  process.exit(1);
}
if (!serviceRoleKey && !password) {
  console.error(
    "Erreur : pas de SUPABASE_SERVICE_ROLE_KEY, il faut donc SIC_ADMIN_PASSWORD dans .env.local " +
      `(mot de passe du compte admin ${ADMIN_EMAIL}) pour passer les politiques RLS du bucket.`
  );
  process.exit(1);
}

/** URL publique stable d'un objet du bucket. */
const publicUrl = (p) => `${url}/storage/v1/object/public/${BUCKET}/${p}`;

/** Fichiers locaux à téléverser : { src, dest } */
function localFiles() {
  const out = [];
  const folders = [
    { dir: 'public/images', dest: 'images' },
    { dir: 'public/videos', dest: 'videos' },
    { dir: 'public/pdf', dest: 'pdf' },
  ];
  for (const { dir, dest } of folders) {
    const abs = path.join(ROOT, dir);
    if (!fs.existsSync(abs)) continue;
    for (const name of fs.readdirSync(abs)) {
      if (name.startsWith('.')) continue; // .DS_Store etc.
      const src = path.join(abs, name);
      if (!fs.statSync(src).isFile()) continue;
      out.push({ src, dest: `${dest}/${name}` });
    }
  }
  return out;
}

/** Placeholders Unsplash (externes) à rapatrier dans le bucket. */
function remoteFiles() {
  return [
    { url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1800&auto=format&fit=crop', dest: 'images/hero.jpg' },
    { url: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?q=80&w=400&auto=format&fit=crop', dest: 'images/blog-1.jpg' },
    { url: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?q=80&w=400&auto=format&fit=crop', dest: 'images/blog-2.jpg' },
    { url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=400&auto=format&fit=crop', dest: 'images/blog-3.jpg' },
  ];
  // Les avatars des témoignages ne sont plus des placeholders distants : ils
  // proviennent des photos réelles des clients, recadrées par
  // `scripts/make-avatar-assets.swift` dans `public/images/avatar-<n>.jpg`,
  // donc repris par `localFiles()` ci-dessus. Ne pas réintroduire d'URL
  // distante ici : elle écraserait les portraits des acquéreurs.
}

async function main() {
  // Service role : aucune session nécessaire (contourne RLS).
  // Sinon : session admin via publishable key + mot de passe.
  const supabase = serviceRoleKey
    ? createClient(url, serviceRoleKey, { auth: { persistSession: false } })
    : createClient(url, publishableKey);

  if (!serviceRoleKey) {
    console.log(`Connexion admin (${ADMIN_EMAIL})…`);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: ADMIN_EMAIL, password });
    if (signInError) {
      console.error(`Erreur de connexion : ${signInError.message}`);
      process.exit(1);
    }
    console.log('Connecté.\n');
  } else {
    console.log('Mode service role (contourne les politiques RLS).\n');
  }

  const jobs = [...localFiles().map(({ src, dest }) => ({ src, dest })), ...remoteFiles()];
  const map = {};

  for (const job of jobs) {
    let data;
    let contentType;
    if (job.src) {
      data = fs.readFileSync(job.src);
      contentType = contentTypeOf(job.src);
    } else {
      const res = await fetch(job.url);
      if (!res.ok) {
        console.error(`  ✗ Échec du téléchargement ${job.url} (${res.status})`);
        continue;
      }
      data = Buffer.from(await res.arrayBuffer());
      contentType = res.headers.get('content-type') || undefined;
    }

    // Upsert = ré-exécution sans doublon ; on écrase la version précédente.
    const { error } = await supabase.storage.from(BUCKET).upload(job.dest, data, {
      contentType,
      cacheControl: '3600',
      upsert: true,
    });

    if (error) {
      console.error(`  ✗ ${job.dest} → ${error.message}`);
      continue;
    }

    const newUrl = publicUrl(job.dest);
    map[job.dest] = newUrl;
    const size = data.length;
    console.log(`  ✓ ${job.dest} (${(size / 1024 / 1024).toFixed(2)} Mo) → ${newUrl}`);
  }

  fs.writeFileSync(path.join(__dirname, 'media-urls.json'), JSON.stringify(map, null, 2));
  const ok = Object.keys(map).length;
  console.log(`\nTerminé : ${ok}/${jobs.length} objets téléversés. Mapping écrit dans scripts/media-urls.json`);
  if (ok !== jobs.length) process.exitCode = 1;
}

function contentTypeOf(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const types = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.mp4': 'video/mp4',
    '.pdf': 'application/pdf',
  };
  return types[ext];
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});