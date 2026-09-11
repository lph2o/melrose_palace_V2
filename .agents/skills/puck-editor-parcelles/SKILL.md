---
name: puck-editor-parcelles
description: Documente l'éditeur visuel Puck du site Sénégal Immobilier Consulting (route /admin/editor). À charger dès qu'une tâche touche à l'édition de contenu, aux sections de la page d'accueil, aux blocs Puck, à leurs props, ou au stockage du JSON de composition dans Supabase. Contient la liste des blocs et de leurs champs, la convention « un champ objet `content` par bloc », l'emplacement et le schéma du JSON persisté, et la procédure pour ajouter un nouveau bloc éditable.
---

# Éditeur visuel Puck — Sénégal Immobilier Consulting

## Ce que c'est

La page d'accueil du site n'est plus du JSX en dur : elle est **rendue depuis une
composition Puck** stockée dans Supabase, éditable en drag-and-drop depuis
`/admin/editor` (protégé par Supabase Auth, compte mono-admin).

- Moteur : **`@puckeditor/core`** (v0.23.x).
  ⚠️ Ne pas installer `@measured/puck` : ce paquet est **déprécié** et affiche
  « Puck has moved. Please use @puckeditor/core instead ».
- Le site public utilise l'entrée **render-only** `@puckeditor/core/rsc`
  (même `<Render />`, sans l'éditeur) : le code éditeur et sa feuille de style
  ne sont chargés qu'avec le chunk lazy de `/admin/editor`. Ne jamais importer
  `@puckeditor/core` (barrel complet) ni `puck.css` depuis le site public.
- Anti-vendor-lock-in : Puck est un composant React pur. Le JSON produit est
  stocké tel quel dans une colonne `jsonb` et relu par `<Render />`.

## Carte des fichiers

| Fichier | Rôle |
| --- | --- |
| `src/puck/config.tsx` | Config Puck (blocs + champs) **et** `buildDefaultPage()` / `puckPageId()` |
| `src/puck/usePuckPage.ts` | Charge la composition publiée, s'abonne au temps réel, applique le repli |
| `src/puck/richText.tsx` | Champ `richtext` enrichi (TipTap : couleurs, polices, tailles, surlignage, lien) + `withRichText()` ; importe `richText.css` |
| `src/puck/drawerCards.tsx` | Cartes illustrées de la bibliothèque de blocs (override `drawerItem`) : icône + libellé court + description — les métadonnées d'icône/description **dérivent de `SITE_SECTIONS`** ; exporte `resolveBlockName()` / `blockShortLabel()` |
| `src/puck/uiOverrides.tsx` | Overrides du panneau de props (`fieldLabel`) et des overlays de sélection (`componentOverlay`) — labels premium + badge du bloc au-dessus du canevas |
| `src/puck/richText.css` | Styles des contrôles de la barre d'outils richtext (chunk éditeur uniquement) |
| `src/puck/editorTheme.css` | Thème sombre premium de l'éditeur : surcharge des tokens Puck `--puck-*` (chunk éditeur uniquement) |
| `src/components/RichText.tsx` | Rendu public des valeurs HTML (assainies par DOMPurify) ou du canevas (composant Puck) |
| `src/components/HomePage.tsx` | Rendu public : bandeau promo + barre de progression + `<Render />` |
| `src/components/AdminEditorPage.tsx` | Route `/admin/editor` : auth, sélecteur FR/EN, `<Puck />`, publication — shell `.puck-editor-shell` + barre d'outils custom |
| `src/sections/*.tsx` | Les sections elles-mêmes, réutilisées par le site **et** par le canevas |
| `src/sections/icons.tsx` | Registre d'icônes sélectionnables dans Puck (champs `select`) |
| `src/puck/MediaField.tsx` | Champ `custom` média : `imageField()` / `videoField()` — aperçu + téléversement Supabase Storage + URL |
| `src/site/SiteContext.tsx` | Dépendances runtime des sections (settings, parcels, navigation) |
| `src/site/sectionsCatalog.ts` | **Catalogue des sections** (clé Puck + libellé + ancre HTML + icône + description) et helpers de visibilité (`hiddenSectionTypes`, `hiddenAnchors`, `sectionLabel`) — partagé par l'Espace Gérant, la bibliothèque de blocs et la navigation. N'importe **rien** de Puck : ne jamais y ajouter d'import éditeur |
| `src/components/AdminSectionsTab.tsx` | Onglet « Sections » de l'Espace Gérant : interrupteurs afficher/masquer (`settings.hiddenSections`) |
| `src/site/whatsapp.ts` | Ouverture WhatsApp partagée par les sections |
| `src/lib/supabase.ts` | `fetchPuckPage` / `upsertPuckPage` / `clearPuckPage` |
| `supabase/schema.sql` | Table `puck_pages` + RLS + publication temps réel |

## Où vit le JSON et son schéma

**Table `public.puck_pages`** (créée par `supabase/schema.sql`) :

| Colonne | Type | Contenu |
| --- | --- | --- |
| `id` | `text` (PK) | `home-fr` ou `home-en` — **une ligne par page et par langue** |
| `data` | `jsonb` | La composition Puck complète |
| `updated_at` | `timestamptz` | Horodatage de publication |

Identifiants : `puckPageId(lang)` dans `src/puck/config.tsx` (`home-${lang}`).

Schéma de `data` (format Puck `Data`) :

```jsonc
{
  "root": { "props": {} },
  "content": [
    { "type": "Hero", "props": { "content": { /* champs du bloc */ } } },
    { "type": "Garanties", "props": { "content": { } } }
    // ... un objet par bloc, dans l'ordre d'affichage
  ],
  "zones": {}
}
```

Chaque item `content` **doit porter un `props.id`** (contrat Puck `WithId`).
C'est la clé de l'index interne de l'éditeur : un item sans `id` fait planter
`<Puck />` à l'ouverture (`Cannot read properties of null (reading
'position')`) et déclenche un avertissement de clé React côté `<Render />`.
`buildDefaultPage()` fabrique des ids **déterministes** (`hero-default`,
`garanties-default`…) ; les blocs ajoutés/dupliqués par l'admin reçoivent des
uuid générés par Puck. `ensureItemIds()` (`src/puck/config.tsx`) complète les
ids manquants à la lecture d'une composition publiée ancienne. **Ne jamais
supprimer un `id` en réécrivant un JSON existant.**

### Visibilité des sections (hors composition)

Masquer une section ne touche **pas** la composition : le réglage vit dans
`site_settings.data.hiddenSections` (tableau de clés de blocs, ex.
`["Temoignages"]`), piloté depuis **Espace Gérant → onglet « Sections »**
(`src/components/AdminSectionsTab.tsx`). C'est donc **global aux deux langues**
et **non destructif** :

- `HomePage` filtre la composition au rendu (`visibleData`) — toutes les
  instances d'un type masqué disparaissent, la composition stockée reste
  intacte et reparaît telle quelle à la réactivation (aucune republication
  dans l'éditeur n'est nécessaire) ;
- `Navbar` retire les liens et CTA dont l'ancre appartient à une section masquée
  (`hiddenAnchors(settings)`), pour ne laisser aucun bouton inerte ;
- l'éditeur Puck **affiche toujours toutes les sections** (il faut pouvoir les
  éditer) : sa barre d'outils indique le nombre de sections masquées. Un canevas
  complet n'implique donc pas un site complet — ne pas s'en étonner lors d'un
  diagnostic « la section est là mais invisible sur le site ».

Chemin de lecture côté données : `fetchRemoteSettings()` (merge
`DEFAULT_SITE_SETTINGS` + ligne cloud) → `settings.hiddenSections` → helpers de
`sectionsCatalog.ts`. La liste vide (ou absente, ou après « Réinitialiser »)
affiche tout : c'est l'état par défaut, rien à migrer dans `schema.sql`
(`data` est du `jsonb` libre).

### Règle de repli (à ne jamais casser)

`usePuckPage()` renvoie **`buildDefaultPage(lang, settings)`** tant qu'aucune
ligne n'existe (ou si Supabase n'est pas configuré, ou si la table manque).
`buildDefaultPage()` reproduit le contenu historique construit depuis
`TRANSLATIONS` + `data.ts`. Conséquences :

- le premier déploiement, et tout suppression de ligne en base, retombe sur le
  contenu actuel sans rien casser ;
- chaque section fait aussi un repli **champ par champ** sur ses valeurs
  `default<Section>Content(lang, settings)` : un champ vidé dans l'éditeur
  réaffiche le texte par défaut plutôt qu'un vide.

## Les blocs éditables

Tous les blocs sont dans `puckConfig.components`. Ordre par défaut dans
`buildDefaultPage()` : Hero → Garanties → Vision → Videos → Localisation →
Simulateur → Packs → Banque → Témoignages → Articles → FAQ → Contact.

| `type` (clé) | Label éditeur | Section source | Champs éditables |
| --- | --- | --- | --- |
| `Hero` | Hero (bannière principale) | `HeroSection.tsx` | badge, title, titleHighlight, subMessage, description, bullet1-3, exploreCta, simulateCta, brochureCta, image, imageAlt, accentColor, `stats[]` |
| `Garanties` | Garanties & sécurisation | `GuaranteesSection.tsx` | sectionTag, title, description, commitmentTitle, commitmentDesc, verifyCta, accentColor, `points[]` |
| `Vision` | Vision & orthophoto | `VisionSection.tsx` | sectionTag, title, description, image, imageAlt, overlayBadge, planBadge, viewDroneLabel, viewPlanLabel, certifiedBadge, domainName, dashedLegend, explorePlanCta, `pillars[]` (icon, title, desc) |
| `Videos` | Vidéos du domaine | `VideoSection.tsx` | sectionTag, title, description, `videos[]` (src mp4, poster, badgeLeft, title, desc) |
| `Localisation` | Localisation stratégique | `LocationSection.tsx` | sectionTag, title, description, cardTag, regionPill, triangleTitle, triangleDesc, distancesFootnote, requestPlanCta, aibdTitle/Sub, terTitle/Sub, diamniadioTitle/Sub, ndayaneTitle/Sub |
| `Simulateur` | Simulateur de financement | `SimulatorSection.tsx` | transparencyTag, title, description, 5 libellés de lignes, resultTag/Title/Subtitle, cashTitle, cashDesc, studyCta, colDepositLabel, colRemainingLabel, colMonthlyLabel, colDurationLabel, depositBaseTag, depositFlexTag, perMonthUnit, recommendedTag, monthsUnit, depositShortcut1-4 (€) |
| `Packs` | Packs complémentaires | `PacksSection.tsx` | sectionTag, title, description, includedLabel, learnMoreCta |
| `Banque` | Financement bancaire | `BankingSection.tsx` | title, description, disclaimer, cta |
| `Temoignages` | Témoignages | `TestimonialsSection.tsx` | sectionTag, title, description |
| `Articles` | Articles & guides | `InsightsSection.tsx` | sectionTag, title, description, readGuideCta |
| `FAQ` | FAQ | `FaqSection.tsx` | sectionTag, title, description |
| `Contact` | Contact & dossier | `ContactSection.tsx` | 20 champs de libellés/placeholders + `interestOptions[]` |

### Ce que Puck ne pilote **pas** (et pourquoi)

Les **listes de contenu** restent pilotées par l'Espace Gérant → onglet
« Contenu du site » (`AdminContentTab.tsx`, stocké dans `settings.content`) :

`packs`, `faq`, `blogArticles`, `testimonials`, `paymentTiers`,
`connectivity`, `videos`.

Raison : dupliquer ces listes dans la composition Puck créerait deux sources de
vérité qui divergeraient. Les blocs Puck correspondants ne portent donc que
**l'en-tête de section** (sur-titre, titre, description) et le lecteur
d'articles ; les items viennent toujours de `settings.content?.xxx ?? défaut`.

> **Exception : le bloc `Videos` porte aussi ses items** (`videos[]` avec
> `src`/`poster`/`badgeLeft`/`title`/`desc`). C'est le seul endroit où l'admin
> peut **téléverser les vidéos du site depuis l'éditeur** (champ `videoField`,
> max 200 Mo, et `imageField` pour le poster) — exigence « upload de médias
> depuis l'éditeur » du chantier. Repli : `defaultVideosContent(lang, settings)`
> lit `settings.content?.videos ?? VIDEO_ITEMS` et résout les textes FR/EN par
> langue ; la liste de l'Espace Gérant sert donc de contenu par défaut tant
> qu'aucune édition n'est publiée.

Piloté par `settings` (Espace Gérant → WhatsApp & Promotions / Images) et
volontairement hors composition : bandeau promo, barre de progression de
lecture, numéro WhatsApp, e-mail, adresse, prix (`basePrice`, `cashPrice`,
`defaultDeposit`, `defaultMonthly`), `heroImage`, `aerialImage`, `brochureUrl`.

> Conséquence pratique : **modifier un prix ou une FAQ ne se fait pas dans
> `/admin/editor`** mais dans `/admin`. L'éditeur visuel gère la mise en page et
> les textes de section.

## Conventions de nommage des champs

1. **Un seul champ objet par bloc**, toujours nommé `content`. C'est ce qui
   permet à `render` de faire `<XSection content={props.content} />` et donc au
   canevas d'afficher la *vraie* section (même composant que le site public).
2. Les clés de `content` sont **exactement** celles de l'interface
   `<Section>Content` exportée par le fichier de section (camelCase, en
   français métier : `sectionTag`, `description`, `exploreCta`…).
3. Les champs absents ou vides ⇒ repli sur `default<Section>Content(lang, settings)`.
   Ne jamais supprimer une clé d'une interface `Content` sans retirer le champ
   Puck correspondant : la donnée stockée deviendrait orpheline.
4. Les libellés des champs Puck sont en français, orientés rédaction (« Bouton
   “Simuler” », « Sur-titre »), pas techniques.
5. Les listes variables sont des **tableaux d'objets** (jamais de tableau de
   chaînes ni de nombres : Puck ne les édite pas nativement). Les groupes de
   taille fixe sont des champs scalaires (`bullet1`, `bullet2`, `bullet3`,
   `depositShortcut1-4`) — y compris pour les valeurs numériques, avec
   `type: 'number'` et un repli `?? base.x` au rendu (un champ nombre vidé peut
   être `undefined`).
6. Les champs média (`Hero.image`, `Vision.image`, `Videos.videos[].src`,
   `Videos.videos[].poster`) sont des champs `type: 'custom'` construits par
   `imageField(label)` / `videoField(label)` (`src/puck/MediaField.tsx`) :
   aperçu du média courant, bouton de téléversement vers Supabase Storage
   (bucket `site-media`, même mécanique que l'Espace Gérant — `uploadSiteMedia`,
   8 Mo pour les images, 200 Mo pour les vidéos), saisie manuelle d'URL et
   bouton « retirer ». Ne pas les recréer en `text` simple : on perdrait
   l'upload depuis l'éditeur.
7. Variable d'interpolation dans un texte ⇒ garder la convention `{cash}`,
   `{full}`, `{saving}`, `{remaining}`, `{name}`… et le `replace()` côté section.
8. Une icône se stocke par **nom** (`'MapPin'`) issu de `SECTION_ICONS`, jamais
   par composant.

## Ajouter un bloc éditable (procédure)

1. **Créer la section** dans `src/sections/MonBlocSection.tsx` :
   - exporter `interface MonBlocContent { … }` ;
   - exporter `defaultMonBlocContent(lang, settings)` qui lit `TRANSLATIONS` / `settings` ;
   - exporter `MonBlocSection({ content }: { content?: Partial<MonBlocContent> })`
     qui fait `const c = { ...base, ...content }` et lit le runtime via `useSite()`.
   - Reprendre l'`id` d'ancre historique de la section (ex. `id="packs-section"`) :
     `Navbar` / `Footer` / `SearchModal` s'y réfèrent par `scrollToSection`.
2. **Déclarer le bloc** dans `src/puck/config.tsx` → `puckConfig.components`,
   avec `label`, `fields.content` (type `object` + `objectFields`), un
   `defaultProps: { content: {} }` **vide** (le repli gère le reste) et
   `render: (props) => <MonBlocSection content={props.content as Partial<MonBlocContent>} />`.
3. **Ajouter l'entrée au catalogue** `SITE_SECTIONS`
   (`src/site/sectionsCatalog.ts`) : `type` **identique** à la clé de config,
   plus `label`, `anchor` (l'`id` HTML de la section, s'il existe), `desc` et
   `icon`. C'est ce qui fait apparaître le bloc dans l'onglet « Sections » (donc
   masquable) et qui illustre sa carte dans la bibliothèque de l'éditeur —
   `DRAWER_BLOCK_META` en dérive, il n'y a plus d'icônes à maintenir en double.
   Un bloc absent du catalogue reste éditable mais **ne peut pas être masqué**
   et n'est pas illustré dans la bibliothèque.
4. **Ajouter la section par défaut** dans `buildDefaultPage()`, à la position
   voulue, avec `{ type: 'MonBloc', props: { content: defaultMonBlocContent(lang, settings) } }`.
5. Le bloc apparaît immédiatement dans la bibliothèque de `/admin/editor` et
   dans l'onglet « Sections » de l'Espace Gérant.
6. Vérifier : `npm run lint` puis `npm run build`, et contrôler dans le build
   que le chunk d'entrée public ne contient toujours pas de code éditeur
   (`grep -c 'puck-editor-shell' dist/assets/index-*.js` → `0`).

Aucune migration de schéma n'est nécessaire pour un nouveau bloc : `data` est du
`jsonb` libre. Le bloc n'existe que pour les pages publiées **après** son ajout ;
les compositions existantes l'ignorent simplement.

## Ajouter une dépendance runtime à une section

Si une section a besoin de quelque chose qui n'est pas sérialisable (settings,
parcels, navigation, callback), **ne pas** l'ajouter en prop Puck : l'ajouter à
`SiteContextValue` et l'alimenter dans **les deux** arbres React :

- `src/App.tsx` (site public) ;
- `src/components/AdminEditorPage.tsx` → `editorContext` (canevas).

Deux implémentations divergentes = un canevas qui ne ressemble plus au site.

## Route, indexation et accès

- URL : `/admin/editor` (ou `#/admin/editor`), **absente de la navigation publique**.
- Auth : Supabase Auth (`src/lib/adminAuth.ts` → `ADMIN_EMAIL`). Une session d'un
  autre compte est refusée et déconnectée.
- `noindex, nofollow` + canonical `/admin/editor` : `src/lib/seo.ts` (branche
  `view === 'admin'`).
- Exclu du sitemap par construction (`scripts/generate-seo-files.cjs` ne liste
  que `/fr`, `/en`, `/fr/plan`, `/en/plan`) et bloqué dans `robots.txt` par
  `Disallow: /admin` (préfixe, couvre donc `/admin/editor`).
- L'éditeur est chargé en `lazy()` **et** le site public passe par
  `@puckeditor/core/rsc` (render-only) + zéro CSS Puck : vérifié par le build
  (aucune trace d'`ActionBar`/`RichTextMenu` dans le chunk d'entrée public).
  Toute réintroduction d'import « barrel » depuis le site public le casserait.

## Thème de l'éditeur (`src/puck/editorTheme.css`)

L'éditeur n'utilise **pas** le thème Puck par défaut (clair, accent bleu azure).
`AdminEditorPage.tsx` enveloppe `<Puck />` dans un shell `.puck-editor-shell`
qui surcharge les tokens de theming global de Puck 0.22+ (`--puck-color-*`,
`--puck-header-*`, `--puck-canvas-*`, `--puck-drawer-item-*`, `--puck-radius-*`,
`--puck-font-family-monospaced`…). Référence :
https://puckeditor.com/docs/api-reference/theming/global.

Principes :

- **UI sombre premium** cohérente avec la marque du site (vert profond `#00261a`
  + or `#FED65B`) et avec l'Espace Gérant (déjà sombre). L'accent interactive/
  focus-ring/selection est l'or de la marque, plus le bleu azure par défaut.
- **Canvas clair** (`--puck-canvas-color-bg: #e9e6e0`) : il montre la page telle
  qu'elle sera publiée (pattern Framer/Webflow : chrome sombre, page claire).
- Le CSS est importé par `AdminEditorPage.tsx` → chargé **uniquement** avec le
  chunk lazy de l'éditeur ; jamais sur le site public (vérifié au build :
  `.puck-editor-shell` absent du CSS d'entrée public).
- La barre d'outils au-dessus de Puck (retour, FR/EN, statut de publication,
  contenu par défaut) vit dans `AdminEditorPage.tsx`, en dur dans le shell ;
  son état (`saving`/`saved`/`error`) s'affiche sous forme de pilules.
- La page de connexion de l'éditeur reprend la même direction (fond profond +
  halos doré/vert, carte verre, monogramme `Compass`).

Pour modifier l'apparence de l'éditeur, toucher `src/puck/editorTheme.css` et la
barre d'outils dans `AdminEditorPage.tsx` — pas les composants Puck eux-mêmes.

### Bibliothèque de blocs (`src/puck/drawerCards.tsx`)

`<Puck overrides={{ drawerItem: DrawerCard }} />` remplace les items de la
bibliothèque par des cartes illustrées. L'override reçoit `{ children, name }` :
`name` est tantôt la clé du bloc (`Hero`), tantôt son label (`Hero (bannière
principale)` — aperçu pendant le drag) ; `DrawerCard` résout les deux via
`resolveBlockName()`. Le drag-and-drop reste fonctionnel : il est porté par le
conteneur parent de Puck (`dragRef` + `data-puck-drawer-item`), pas par le
contenu remplacé. Un bloc absent de `DRAWER_BLOCK_META` retombe sur `children`
(rendu par défaut) — la bibliothèque ne casse jamais. Ajouter un bloc ⇒
l'ajouter aussi à `DRAWER_BLOCK_META` (icône lucide + description) pour qu'il
soit illustré.

### Panneau de props & overlays (`src/puck/uiOverrides.tsx`)

`<Puck overrides={{ fieldLabel: EditorFieldLabel, componentOverlay:
EditorComponentOverlay }} />` harmonise le panneau de props et les overlays du
canevas avec le thème sombre et les cartes :

- **`fieldLabel`** : les labels de champs gagnent une pastille dorée ; le
  champ objet « content » (rendu par Puck avec `el: "div"` + icône) est traité
  comme un **groupe de section** (fond discret + poignée + uppercase).

Le panneau de props est en outre restylé dans `editorTheme.css` (sélecteurs
sur les classes CSS-module de Puck, préfixes stables) : en-tête du panneau à
fond dégradé avec breadcrumbs dorés et titre du bloc en serif Playfair,
champs aérés (padding 14px) avec séparations douces, et groupe « Contenu »
traité en carte intérieure (fond discret + rayon 10px). Ne pas retirer ces
sélecteurs : ils maintiennent l'harmonie avec les cartes de la bibliothèque.
- **`componentOverlay`** : ajoute un badge flottant avec le nom court du bloc
  (via `blockShortLabel`) au-dessus du cadre de sélection fourni par Puck. Le
  badge est `pointer-events: none !important` (le portal Puck force
  `pointer-events: auto`), il ne capture donc jamais les clics du bloc.
- Les couleurs des champs sont pilotées par les tokens `--puck-field-*`
  définis dans `editorTheme.css` (surfaces, bordures, focus ring doré,
  espacements).

⚠️ Les tokens `--puck-field-*` doivent rester **dans** le bloc
`.puck-editor-shell` (pas hors du sélecteur) : une insertion hors du bloc
produit un `css-syntax-error` d'esbuild au build.

## Comportement attendu de l'éditeur

- Sélecteur FR/EN : on édite et publie **une langue à la fois**
  (`home-fr` / `home-en` séparément). Le canevas est remonté (`key={language}`)
  au changement de langue.
- « Publish » de Puck (bouton de sa barre d'outils) déclenche `onPublish` →
  `upsertPuckPage()`. Un bandeau indique le résultat, y compris l'échec typé
  (`tables-missing`, `session-expired`, `unauthorized`, `offline`).
- « Contenu par défaut » appelle `clearPuckPage()` : la ligne est supprimée et le
  site retombe sur `buildDefaultPage()`.
- Les interactions du canevas (CTA, FAQ, formulaire) sont neutralisées via
  `editorContext` : cliquer dans l'éditeur ne doit jamais naviguer hors canevas.

## Vérification

```bash
npm run lint      # tsc --noEmit
npm run build     # vite build (+ génération robots.txt / sitemap.xml)
```

Il n'existe pas encore de tests automatisés sur ce périmètre : toute modification
des sections doit être vérifiée visuellement sur `/fr` **et** sur `/admin/editor`,
en comparant le rendu avant/après publication.
