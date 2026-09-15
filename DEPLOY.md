# Déploiement sur Vercel

Runbook du déploiement du site (SPA **Vite + React 19 + Tailwind v4**, contenu et médias sur **Supabase**).

## Ce qui est déjà en place dans le dépôt

| Fichier | Rôle |
| --- | --- |
| `vercel.json` | preset `vite`, `npm ci` / `npm run build`, sortie `dist`, fallback SPA, cache long sur `/assets/*`, `X-Robots-Tag: noindex` sur `/admin*` |
| `.vercelignore` | exclut du téléversement CLI les artefacts locaux (audit mobile, `dist/`, `.DS_Store`) |
| `scripts/generate-seo-files.cjs` | généré avant chaque build (`prebuild`) : `robots.txt` + `sitemap.xml` |

Le site est un **SPA à routes réelles** (`/fr`, `/en`, `/fr/plan`, `/en/plan`, `/admin`, `/admin/editor`) : sans le fallback
`rewrites → /index.html`, un accès direct à `/fr/plan` renverrait un 404. Les fichiers statiques (`robots.txt`,
`sitemap.xml`, `/images`, `/videos`, `/pdf`) restent servis tels quels, Vercel vérifiant le système de fichiers avant
d'appliquer la réécriture.

## Variables d'environnement

À définir dans **Vercel → Project → Settings → Environment Variables** (Production, Preview, Development) :

| Variable | Obligatoire | Rôle |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | oui | URL du projet Supabase — inlinée dans le bundle par `vite.config.ts` (`define`) |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | oui | clé publique (anon/publishable) — protégée par les RLS de `supabase/schema.sql` |
| `SITE_URL` | recommandé | domaine public définitif (ex. `https://www.duntni-sebikhotane.com`) utilisé par `robots.txt` / `sitemap.xml` |
| `SUPABASE_SERVICE_ROLE_KEY` | **non** | réservée aux scripts locaux (`scripts/upload-media.cjs`) — ne jamais l'exposer sur Vercel |

Sans `SITE_URL`, le build retombe automatiquement sur `VERCEL_PROJECT_PRODUCTION_URL` / `VERCEL_URL` : le sitemap
pointe alors sur l'URL `.vercel.app` et un avertissement apparaît dans les logs de build.

> Les variables `NEXT_PUBLIC_*` sont lues **au build** puis inlinées dans le bundle : après les avoir ajoutées ou
> modifiées sur Vercel, il faut **redéployer** (aucune lecture à l'exécution).

## Déployer

### 1. Première mise en ligne (CLI)

```bash
npx vercel login          # si nécessaire
npx vercel link           # lie le dossier au projet Vercel
npx vercel                # déploiement de prévisualisation (preview)
npx vercel --prod         # déploiement de production
```

### 2. Déploiement continu via GitHub (recommandé ensuite)

Importer le dépôt `lph2o/melrose_palace_V2` sur [vercel.com/new](https://vercel.com/new). Vercel détecte Vite et
`vercel.json` prend le reste en charge. Chaque push sur `main` déploie en production, chaque PR en preview.

## À faire côté Supabase

1. Le schéma doit être exécuté sur le projet (`supabase/schema.sql`) : tables `site_settings`, `parcels`, `puck_pages`,
   `leads`, bucket `site-media`, politiques RLS, publication temps réel.
2. **Auth → URL Configuration** : ajouter le domaine Vercel (`https://<projet>.vercel.app` et le domaine définitif)
   dans *Site URL* / *Redirect URLs*. La connexion e-mail/mot de passe du mono-admin fonctionne sinon, mais les liens
   de réinitialisation pointeraient vers `localhost`.
3. Les comptes autorisés sont listés dans `ADMIN_EMAILS` (`src/lib/adminAuth.ts`) et dans `public.is_admin()`
   (`supabase/schema.sql`) — **les deux listes doivent rester identiques** : le garde-fou client refuse la session, la
   RLS refuse l'écriture. Ajouter un administrateur = créer le compte Supabase Auth, ajouter l'email aux deux listes,
   redéployer, puis ré-exécuter `supabase/schema.sql` dans le SQL Editor.

## SEO / indexation

- `VERCEL_ENV === 'production'` ⇒ `robots.txt` indexable, `/admin` interdit, sitemap référencé.
- Déploiements **preview** et build local ⇒ `Disallow: /` (aucune URL temporaire indexée).
- En-tête `X-Robots-Tag: noindex` sur `/admin*` en complément du `<meta robots>` posé par `src/lib/seo.ts`.

### Balises de partage par route (Open Graph / Twitter Card)

WhatsApp, Facebook, LinkedIn et X **n'exécutent pas le JavaScript** : ils ne voient que le HTML servi.
Le build écrit donc un vrai fichier par route, avec ses propres balises :

| Fichier généré | Route servie |
| --- | --- |
| `dist/index.html` | `/` (repli SPA, carte FR) |
| `dist/fr/index.html`, `dist/en/index.html` | `/fr`, `/en` |
| `dist/fr/plan/index.html`, `dist/en/plan/index.html` | `/fr/plan`, `/en/plan` |
| `dist/admin/index.html`, `dist/admin/editor/index.html` | `/admin`, `/admin/editor` (`noindex`) |

Vercel sert un fichier existant **avant** d'appliquer la réécriture SPA de `vercel.json` : ces pages
prennent donc le pas sans changer le comportement de l'app (mêmes bundles, le client réapplique les
mêmes balises via `src/lib/seo.ts`).

- Textes : **`src/seo/routeMeta.json`** — source unique, utilisée à la fois par le build
  (`scripts/prerender-routes.cjs`, postbuild) et par le client (`src/lib/seo.ts`). Modifier une
  accroche de partage se fait donc **dans ce JSON**, jamais dans les balises de `index.html`.
- Images : `public/og/og-{home,plan}-{fr,en}.jpg` (1200×630), générées par
  `swift scripts/make-og-image.swift` (voir l'en-tête du script pour la commande exacte), puis
  déployées depuis notre domaine. Régénérer si le visuel ou l'accroche changent.
- Origine des URLs absolues : `SITE_URL`, sinon l'URL Vercel détectée automatiquement. En local,
  l'origine est le placeholder `https://votre-domaine.com`.
- Contrôle rapide après déploiement : le `<title>` et l'`og:image` doivent **différer** entre
  `/fr/plan` et `/en/plan` (voir les commandes ci-dessous).

## Domaine personnalisé

**Vercel → Project → Settings → Domains** : ajouter le domaine, puis chez le registrar un `A` vers `76.76.21.21`
(apex) ou un `CNAME` vers `cname.vercel-dns.com` (sous-domaine). Ensuite mettre `SITE_URL` à cette valeur exacte et
redéployer, pour que canonical/hreflang, sitemap et `robots.txt` utilisent le bon domaine.

## Vérifications après déploiement

```bash
curl -sI https://<domaine>/fr/plan | head -1     # 200 (fallback SPA, pas 404)
curl -s  https://<domaine>/robots.txt            # Allow: / + Sitemap, pas Disallow: /
curl -s  https://<domaine>/sitemap.xml | head    # URLs sur le bon domaine
curl -sI https://<domaine>/admin/editor | grep -i x-robots-tag

# Carte de partage propre à chaque route (doivent tous différer)
for p in /fr /en /fr/plan /en/plan; do
  echo "$p  $(curl -s https://<domaine>$p | grep -o '<title>[^<]*')"
  curl -s https://<domaine>$p | grep -o 'og:image" content="[^"]*"'
done
curl -sI https://<domaine>/og/og-plan-en.jpg | head -1   # 200 (image servie par le domaine)
```

Puis, dans le navigateur : `/fr` (contenu publié ou repli), `/admin` (connexion), `/admin/editor` (publication Puck).
