# Plaquette PDF — source et génération

Le PDF servi par le site (`public/pdf/Dun-Tni-Brochure-Premium.pdf`) et les
aperçus du lecteur intégré (`public/pdf/plaquette/page-N.jpg`) sont
**régénérés depuis cette source**, et non plus exportés à la main.

```bash
npm run brochure           # régénère le PDF (Chrome headless, impression A4)
npm run brochure:previews  # régénère les 7 aperçus JPEG du lecteur intégré
```

## Fichiers

| Fichier | Rôle |
|---|---|
| `plaquette.html` | la maquette complète (7 `.page` = 7 pages A4) |
| `render.cjs` | pilote Chrome headless, imprime en A4 avec les fonds |
| `assets/*.png` | les 4 photos du document |
| `fonts/Lora*.ttf`, `fonts/Poppins-*.ttf` | polices embarquées (voir plus bas) |

`plaquette.html` référence le logo par `../../public/logo/logo-lockup.png` :
la marque n'existe qu'une seule fois dans le dépôt, et se met donc à jour
partout d'un coup (site, cartes de partage, plaquette).

## Polices — pourquoi elles sont embarquées

Le document est composé en **Lora** (titres), **Poppins** (texte) et une
police à chasse fixe. Aucune de ces polices n'est garantie sur une machine :
sans Lora, le navigateur compose les titres en Georgia et **les paragraphes ne
se replient plus aux mêmes mots**. Lora et Poppins sont donc embarquées en
`@font-face`.

Poppins n'est déclarée qu'en **400 et 700**, volontairement : c'est ce que
voyait le rendu d'origine, où les graisses 500 et 600 retombaient sur Regular
et Bold. Déclarer Medium ou SemiBold changerait les sous-titres de la page 5.

La chasse fixe tombe sur **Menlo** (macOS), dont les largeurs de caractères
sont identiques à celles de DejaVu Sans Mono, la police du rendu d'origine :
la mise en page est préservée.

## Ce qui n'est pas garanti

Chrome imprime à sa façon : les versions successives de Skia et des polices
diffèrent de moins de 1 % en largeur. Résultat, sur une régénération, la
quasi-totalité des lignes sont identiques au caractère et à la position près,
mais **trois ou quatre paragraphes se replient une ligne plus tôt ou plus
tard**. C'est sans effet sur la lecture ; si un décalage précis devait être
corrigé, la source (ce fichier) est le bon endroit pour le faire.

## Origine des photos

Les quatre photos ont été extraites des images embarquées du PDF précédent
(elles n'étaient pas versionnées) :

| Fichier | Page d'origine |
|---|---|
| `aeroport-terminal.png` | couverture |
| `aeroport-vue-aerienne.png` | page 4 |
| `terrain-baobabs.png` | pages 2 et 7 |
| `plan-54-parcelles.png` | page 6 |

Remplacer une photo = déposer le nouveau fichier sous le même nom, puis
relancer les deux commandes ci-dessus.
