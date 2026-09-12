# Refonte design premium — Sénégal Immobilier Consulting

> Document de référence. Il fait autorité sur toute contribution visuelle.
> Les jetons sont implémentés dans `src/index.css` (`@theme`) ; le filet de
> vérification automatique vit dans `public/mobile-audit.html` (`npm run audit:mobile`).

## 1. Audit initial (mesuré, pas estimé)

Relevé sur le site rendu (navigateur réel, 375 px et 647 px) et recensement
statique des 85 fichiers source.

| Constat | Mesure initiale |
| --- | --- |
| Tailles de police écrites à la main | **280** (`text-[Npx]`), dont 104 à 10 px, 71 à 9 px, 25 à 8 px, 9 à 7 px, 1 à 6 px — **209 occurrences sous 11 px** |
| Nuances de texte blanc | 13 (`/30` … `/90`) |
| Ors différents | 4 (`#FED65B`, `#D4AF37`, `#8C7A53`, `#E8942E`) + 3 teintes dérivées |
| Blancs cassés | 3 (`#FAF9F5`, `#FBF9F4`, `#fcf9f8`) |
| Rayons distincts | une douzaine (`rounded` → `rounded-3xl` + 4 valeurs `calc()`) |
| Ombres | 7 paliers Tailwind **+ 34 valeurs `shadow-[…]`** écrites à la main |
| Bordures grises froides | 94 (`border-gray-200` ×53, `-300` ×30, …) |
| Courbes d'animation | 2 courbes personnalisées + `ease-in` / `ease-out` par défaut |
| Rayon du chrome mobile | menu posé en `top-[56px]` sous une navbar de **81 px** ; `--nav-h` figé à 61 px |
| Contraste | `text-outline` 4,2:1, `text-white/40` 3,7:1, blanc sur vert WhatsApp **1,98:1** |
| Cibles tactiles | ~30 contrôles sous 44 px à 375 px (icônes 32×32, pilules 25-28 px, FAQ 24 px) |
| Chrome permanent | navbar 81 px + bandeau promo collant 133 px = **26 % de l'écran d'un téléphone** |
| Rythme vertical | plafond à `py-20` (80 px) |
| Hiérarchie de titres | 1 `h1` ✓ mais **28 `h4` pour 2 `h3`** |
| Police de labeur | Inter (générique) |

## 2. Direction retenue

**Conserver l'identité** (vert profond + or, Playfair Display, registre éditorial
diaspora) et **systématiser** : les défauts relevés ne venaient pas de la
direction artistique mais de l'absence de jetons. Trois courbes, quatre rayons,
deux verts, un or, une crème — et rien en dehors.

## 3. Jetons (source unique : `src/index.css`)

### Typographie
| Jeton | Valeur | Usage |
| --- | --- | --- |
| `text-micro` | 11 px | **micro-labels en majuscules espacées uniquement** |
| `text-caption` / `text-xs` | 13 px | légendes, métadonnées |
| `text-sm` | 15 px | interface dense |
| `text-body` | 15 px | corps de texte par défaut |
| `text-base` | 16 px | corps confortable |
| `text-lead` | 19 px | chapô |
| `text-lg` / `text-xl` | 19 / 22 px | sous-titres |
| `text-2xl` / `text-3xl` | 26 / 32 px | titres de carte |
| `text-h3` | clamp(20 → 24 px) | titre de bloc |
| `text-h2` | clamp(26 → 40 px) | **titre de section** |
| `text-h1` | clamp(30 → 72 px) | **titre de page** (un seul `h1`) |
| `text-display` | clamp(40 → 84 px) | accroche d'ouverture |
| `text-4xl` … `text-7xl` | clamp(34 → 92 px) | échelle de secours |

**Règle 1 — aucune phrase sous 13 px.** Le texte SVG du plan cadastral est hors
règle (unités vectorielles d'un dessin zoomable) et exclu par l'audit.

**Règle 2 — registre des libellés.** Tout texte en **majuscules avec
interlettrage** (`uppercase tracking-*`) est une étiquette : `text-micro`
(**11 px**), jamais 13 px. Le 13 px est réservé au texte de phrase. Exception
assumée : les **contrôles** (`button`, `a`, intitulés de champ) gardent 13 px —
une action doit rester lisible avant d'être élégante. Corollaire mesuré : les
libellés capitales à 13 px faisaient paraître tout le site plus grand sur mobile
sans rien hiérarchiser, puisqu'elles parlaient aussi fort que le texte courant.

**Règle 3 — le petit écran ne suit pas une échelle à part.** Les paliers sont
identiques partout ; seuls les `clamp()` font varier les titres. Une entrée de
menu mobile se dimensionne comme un corps confortable (16 px), pas comme un
sous-titre : c'est du texte qu'on lit au pouce, pas du titrage.

**Police de labeur : Plus Jakarta Sans** (remplace Inter) ; titrage Playfair
Display ; chiffres techniques JetBrains Mono. Chargées depuis `index.html` avec
`preconnect` + `display=swap` (plus de `@import` CSS bloquant).

### Couleur
- **Or unique, trois rôles** : `secondary-fixed` / `gold` `#FED65B` (accent sur
  fond sombre), `gold-ink` `#8A6A00` (**texte or sur fond clair**, ≥ 4,5:1),
  `gold-line` `#8C7A53` (filets).
- **Deux verts** : `primary` `#00261a`, `primary-container` `#0f3d2e`.
- **Une crème** : `background` / `surface` `#FAF9F5`.
- **Trois niveaux de texte** : `ink-1` `#1a1a19`, `ink-2` `#3a423d`,
  `ink-3` `#5f6a64` — tous ≥ 4,5:1 sur la crème.
- **Sur fond sombre** : quatre niveaux de blanc seulement — **`/60`, `/70`,
  `/85`, `/90`**. Le plancher `/60` est calculé pour passer 4,5:1 même sur le
  vert `#0f3d2e`.
- **Vert WhatsApp assombri à `#0f7a3d`** : le `#25D366` de la marque ne donne
  que 1,98:1 avec du texte blanc. La teinte retenue passe AA (5,4:1).
- **Gris Tailwind redéfinis** en hairlines chaudes (`gray-100` → `gray-700`),
  ce qui corrige les 94 bordures grises sans toucher aux composants.
- `rose` / `emerald` / `amber-50|100|800|900` restent autorisés pour les statuts
  (Vendu / Disponible / Réservé) : ce sont des couleurs sémantiques, pas de marque.

### Forme et profondeur
- **4 rayons** : `rounded-full` (pilulier), `rounded-card` (20 px),
  `rounded-inner` (14 px), `rounded-micro` (8 px).
- **3 élévations** : `shadow-elev-1`, `shadow-elev-2`, `shadow-elev-3`, plus
  `shadow-inset-highlight` (liseré interne des surfaces claires).
- **Cartes en double coque** (`Card`) : coque `p-1.5` + noyau `rounded-inner`.
  Une carte ne repose jamais à plat sur le fond.

### Rythme
- `py-section` sur l'enveloppe de section : **96 px mobile → 128 px desktop**
  (`--section-y`). Aucune section ne réécrit son `py-*`.
- Marge latérale mobile `px-5`, desktop `md:px-12`.

### Marges de sécurité iOS (encoche, barre d'accueil)
Le `viewport` porte `viewport-fit=cover` : la page déborde volontairement sous
l'encoche et la barre d'accueil, ce qui permet à la navbar sombre et aux feuilles
modales de remplir tout l'écran au lieu d'être ceinturées d'un liseré clair.
Contrepartie : **chaque zone collée à un bord réserve elle-même sa marge**, via
quatre jetons (`--safe-top`, `--safe-right`, `--safe-bottom`, `--safe-left`,
initialisés depuis `env(safe-area-inset-*)`).

Sans `cover`, iOS réduit déjà la zone tout seul et ces `env()` valent **0** :
le site paraît correct mais ne remplit jamais les bords. Avec `cover`, l'oubli
d'une marge masque du contenu — d'où la règle :

| Zone | Classe | Où |
| --- | --- | --- |
| Barre de navigation | `safe-t safe-x` | enveloppe **interne** (le fond sombre, lui, reste plein format) |
| Menu mobile | `safe-x safe-b` | calque ; la hauteur interne déduit `--safe-bottom` |
| Feuilles modales | `sheet-safe` | la coque `ModalShell`, pas les modales (bas réservé sous 640 px seulement) |
| Bouton WhatsApp flottant | `fab-safe` | `max(1,25 rem, env(...))` — la marge s'ajoute au retrait |
| Toast du plan cadastral | `toast-safe` | sous la navbar réelle, décalé de la marge de droite |
| Pied de page | `safe-b safe-x` | le fond sombre descend jusqu'au bord |
| Contenu courant | `body { padding-left/right }` | protège du bord en paysage |

`--nav-h` est **mesuré** par un `ResizeObserver` sur la navbar : la barre grandit
quand la marge de sécurité apparaît (rotation, plein écran), et tout ce qui
dépend d'elle (`scroll-padding-top`, menu mobile, toast) suit sans calcul en dur.

### Mouvement
- **2 courbes** : `ease-spring` `cubic-bezier(0.32,0.72,0,1)` et
  `ease-out-expo` `cubic-bezier(0.16,1,0.3,1)`.
- **Durées** : 200 / 400 / 700 ms.
- Seules `transform` et `opacity` sont animées. `backdrop-blur` réservé au
  chrome fixe (navbar, overlays) — jamais sur un conteneur qui défile.
- Apparition au scroll : `initScrollReveal()` (`src/lib/reveal.ts`), un seul
  `IntersectionObserver` + un `MutationObserver` qui reprend les blocs rendus
  par Puck. Jamais d'écouteur `scroll`. L'état masqué n'est appliqué qu'une fois
  `html.reveal-ready` posé : sans JavaScript, tout reste visible.

### Empilement
`--z-promo: 40`, `--z-menu: 45`, `--z-nav: 50`, `--z-modal: 100`,
`--z-progress: 110`, `--z-toast: 120`. Aucun `z-[9999]`.

Le menu mobile est **sous** la navbar et non au-dessus : la barre porte la croix
de fermeture, un calque plus haut la recouvrirait et le menu deviendrait
impossible à refermer au doigt — le tap atterrit sur le calque, pas sur le
bouton. Corollaire pour toute vérification : un `.click()` programmatique
contourne le test de collision, donc il valide un bouton recouvert. Une cible
« cliquable » se prouve par `elementFromPoint`, jamais par `.click()`.

### Cibles tactiles
Plancher **44×44 px** (Apple HIG) pour tout contrôle interactif. Deux outils :
`min-h-[44px]` quand le dessin peut grandir, `.tap-44` (pseudo-élément) quand la
cible doit s'étendre sans grossir le glyphe — icônes, pilules de filtre.

## 4. Primitives (`src/ui/`)

| Composant | Rôle |
| --- | --- |
| `Button` | 5 variantes, 2 tailles ≥ 44 px, icône de fuite dans sa propre pastille |
| `Card` / `Panel` | architecture double coque |
| `Section` | rythme vertical + largeur de lecture |
| `Eyebrow` / `SectionHeading` | micro-badge doré + bloc de titre normalisé |
| `Badge` | statuts Disponible / Réservé / Vendu / Promo / neutre / sur fond sombre |
| `Field` / `TextArea` / `Select` | hauteur 48 px, `<label>` lié, erreurs annoncées (`role="alert"`) |

## 5. Corrections structurelles

- **Navbar** : hauteur mesurée publiée dans `--nav-h` ; le menu mobile se cale
  sur cette variable (`top-0` + `pt-[var(--nav-h)]`) au lieu d'un `top-[56px]`
  codé en dur. Nom complet tronqué sur mobile → navbar à 67 px au lieu de 81 px
  (plus de retour à la ligne).
- **Menu mobile** : plein écran, entrées échelonnées (`.menu-stagger`), morphing
  hamburger → croix, fermeture au clavier (Échap), défilement de la page
  verrouillé, fermeture automatique au passage en largeur bureau.
- **Bandeau promo** : plus collant, refermable (mémorisé pour la session, sans
  toucher au réglage du gérant). Il ne consomme plus 26 % de l'écran en continu.
- **`vh` → `dvh`** sur les hauteurs plein écran et les modales : fini le saut de
  viewport sur iOS Safari.
- **Plan cadastral** : étiquettes vectorielles relevées (6,5-9 → 9-11,5 unités
  SVG) ; filtres et commandes de zoom à 44 px ; fil du fil d'Ariane recontrasté.
- **Contraste** : `--color-outline` `#737b76` → `#5f6a64`, `--color-on-surface-variant`
  `#414944` → `#3a423d`, opacités de blanc normalisées, or de texte passé à
  `gold-ink`, vert WhatsApp assombri.
- **Hiérarchie** : un seul `h1` par page ; `SectionHeading` impose `h2`.

## 6. Filet de vérification

`npm run audit:mobile` construit le site et régénère `public/mobile-audit.html`
(version autonome). Le groupe **« Design »** échoue si :

1. un texte d'interface rend à **moins de 11 px** (SVG du plan exclu) ;
2. une **cible tactile** descend sous 44 px (hors `tap-44`) ;
3. deux éléments de **chrome fixe/collant** se chevauchent ;
4. un texte passe sous **4,5:1** (3:1 en grand texte) — calcul WCAG réel, fonds
   translucides composés, textes sur photo/dégradé écartés au lieu d'être accusés ;
5. la page porte **autre qu'un seul `h1`**.

Sont signalés sans bloquer : rayons hors jetons, palettes de texte observées.

### Juger un état, jamais une durée

Deux contrôles de l'audit ont d'abord été écrits avec une attente fixe
(`await wait(700)`) avant de constater la fermeture d'une modale. C'est un piège :
les navigateurs portent le plancher de minutage à ~1 s dès que la fenêtre n'est
pas au premier plan, si bien que l'animation de sortie (220 ms) se terminait
après la mesure. L'audit déclarait « croix inopérante » alors que le bouton
fonctionnait — un faux positif qui a coûté une session de diagnostic. **Toute
attente dans l'audit doit sonder** (`waitUntil`) **et non dormir.**

### Contrôles ajoutés ensuite

| Groupe | Ce qu'il refuse |
| --- | --- |
| Modales — fermeture | une croix que le doigt n'atteint pas (`elementFromPoint`) ou qui ne démonte pas la modale |
| Menu mobile | menu qui ne s'ouvre pas, croix recouverte par le calque, tap sur zone sombre sans effet, menu resté ouvert |
| Libellés capitales | majuscules + interlettrage au-delà de 11 px (les `sm:` volontaires sont exemptés) |
| Chrome fixe | deux éléments collants/fiches qui se recouvrent, ou qu'un calque recouvre |
| Marges iOS | contenu masqué par un `env(safe-area-inset-*)` simulé (portrait, paysage, insets nuls) |

**État au 2026-09-12 : 74 contrôles, 0 échec, 0 avertissement** (accueil et plan
cadastral, 375 px, FR).

## 7. Visite 3D (`src/components/VirtualTourModal.tsx`)

La vue 3D n'utilise aucune bibliothèque : c'est un **moteur de projection
logiciel**, rendu en SVG. Ce choix reste tenable à condition d'assumer les trois
responsabilités qu'un moteur graphique tient normalement.

### Le repère

La caméra tourne autour du lot (lacet `yaw`, assiette `pitch`, zoom). `—Y` est le
zénith, `+Y` descend vers le sol, `+Z` s'enfonce dans l'écran. La projection est
perspective : `f = (350 · zoom) / (350 + z₂)`.

### Ce qui faisait « faux »

Trois défauts, tous corrigés :

1. **Ordre de dessin figé.** Les faces étaient peintes dans l'ordre du code : le
dallage passait par-dessus la villa dès que l'angle changeait. Corrigé par un
**tri du peintre** à deux clés — la couche d'abord (sol → dallage → bâti → toiture),
la profondeur ensuite, du plus lointain au plus proche.
2. **Aucun éclairage.** Toutes les faces d'un même matériau recevaient la même
opacité, donc aucun volume. Corrigé par une **loi de Lambert** : normale de face
orientée vers l'extérieur grâce au centroïde du solide (sans quoi deux faces
 opposées s'éclairent identiquement), produit scalaire avec un vecteur soleil
propre à chaque heure, plus une **exposition** par heure — c'est elle qui évite
le contresens d'un toit blanc à midi *et* à minuit.
3. **Soleil incohérent.** L'ombre portée suivait des offsets écrits à la main,
sans rapport avec la lumière. Les deux descendent maintenant du **même vecteur**
`LIGHT`, l'ombre étant prise à l'opposé.

S'y ajoutent une **ligne d'horizon** et une brume de distance : sans elles le
damier flottait dans le vide, sans échelle.

### Ancrage au sol (ombre douce et occlusion ambiante)

Troisième défaut, plus insidieux : le bâti **ne touchait pas le sol**. Il était
posé *sur* l'image, pas sur le terrain, et rien ne disait d'où venait la lumière.
Deux mécanismes distincts s'en chargent maintenant.

**L'ombre portée** ne se choisit pas, elle se déduit : un objet de hauteur `h`
projette une ombre de longueur `h × (composante horizontale ÷ verticale)` du
soleil — donc très courte à midi, très longue au coucher. Les offsets écrits à la
main donnaient l'inverse. Sa silhouette est l'**enveloppe convexe** du contour
balayé (chaîne monotone sur 8 points) : un quadrilatère simplement translaté
laissait des coins creux, et l'ombre ne collait pas au bâti. Trois passes de
longueurs `1,25 / 1 / 0,78` empilent une pénombre là où une seule découpe donnait
un bord net.

**L'occlusion ambiante** assombrit la jonction bâti/dallage, là où la lumière du
ciel n'arrive pas : un dégradé **radial** en `userSpaceOnUse`, centré sous
l'emprise, qui atteint zéro *avant* le bord de son quadrilatère porteur — le
porteur ne se voit donc jamais. C'est elle qui « assoit » le volume.

Le dallage reçoit le même traitement à son échelle : un liseré sombre débordant
vers l'extérieur, et une ellipse de contact sous chaque arbre. Toutes ces valeurs
sont indexées sur la hauteur du soleil : franches à midi, effacées la nuit.

**Le choix du coût est explicite** : aucune de ces approximations n'utilise de
filtre. Un `feGaussianBlur` se ré-rasteriserait à chaque image de la rotation
automatique — le flou est obtenu par empilement de formes, qui se paie en
éléments et pas en repaints.

### Manipulation

Le modèle n'était pas manipulable — seules la rotation automatique et des
curseurs l'animaient, ce qui vide une « visite 3D » de son sens. Sont désormais
branchés : **glissé au doigt/souris** (orbite, la scène suit le geste),
**pincement** (zoom), **molette** (écoutée nativement et non en passif, sinon le
`preventDefault` est sans effet et la page défile pendant le zoom), et les
**flèches du clavier** sur un conteneur focalisable. Le geste suspend la rotation
automatique.

### Honnêteté de l'instrumentation

Le bandeau affichait `FPS: 60.0_STABLE` — un chiffre inventé. Il expose
maintenant les valeurs réelles : `YAW`, `PITCH`, `ZOOM`.

## 8. Conventions pour la suite

1. Ne jamais écrire `text-[13px]`, `rounded-[22px]`, `shadow-[…]` ni `#8C7A53` :
   tout passe par un jeton de `src/index.css`.
2. Un nouveau bloc de section utilise `Section` + `SectionHeading` et `Card`,
   jamais un `py-*` ni un rayon ad hoc.
3. Un nouveau bloc éditable dans Puck suit la même règle : ses props peuvent
   porter un `accentColor`, pas une échelle typographique.
4. Toute évolution visuelle se valide par `npm run audit:mobile` avant commit.
5. Dans l'audit, ne jamais mesurer une animation par une attente fixe : sonder
   l'état final (`waitUntil`).
6. Un rendu de scène trie ses faces, oriente ses normales et module l'opacité par
   l'éclairement — peindre dans l'ordre du code se voit à la première rotation.
7. Un objet posé sur un autre doit porter son **ombre portée** et une **occlusion
   de contact**, toutes deux dérivées du vecteur soleil et non d'offsets choisis.
   L'empilement de leurs passes est **fixe** (couches fractionnaires) : trié par
   profondeur seule, il s'inverse quand la caméra passe de l'autre côté.
