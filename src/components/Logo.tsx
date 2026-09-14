/**
 * Marque du site — `public/logo/logo-lockup.png`.
 *
 * Détourée du logo fourni par le gérant
 * (`public/logo/03-logo-senegal-immo-consulting.jpeg`) : le fond noir du JPEG
 * est rendu transparent et les marges sont rognées, sinon la marque poserait un
 * rectangle noir sur les surfaces vertes du site. Cette transformation est
 * scriptée (`scripts/make-brand-assets.swift`) — le jour où le logo change, il
 * faut relancer ce script, puis les visuels qui l'intègrent (cartes de partage,
 * plaquette, fiches) : le fichier n'est pas retouché à la main.
 *
 * La composition est reprise **telle quelle**, sans rien recomposer : ses trois
 * éléments comptent autant l'un que l'autre et ne doivent jamais être
 * dissociés — l'emblème doré, le nom « SÉNÉGAL / INVESTMENT CONSULTING », et le
 * filet tricolore vert/or/rouge qui les souligne. Le fichier `01-…jpeg` du lot
 * précédent n'a pas servi : il était amputé de ce filet ; `02-…jpeg` est
 * l'ancien logo (mot-symbole « IMMO CONSULTING »), conservé comme archive.
 *
 * Les textes sont blancs et le filet très fin : la marque est donc réservée aux
 * fonds sombres (navbar, pied de page) et ne descend pas sous `h-10` (40 px).
 * En dessous, « INVESTMENT CONSULTING » tourne à la trame grise et le filet
 * s'efface. Repères à `h-12` (48 px, ratio 1,59) : 76 px de large, « SÉNÉGAL »
 * ~11 px de haut, sous-titre ~4 px, filet ~0,5 px.
 *
 * Les favicons (`public/favicon.ico`, `public/favicon.png`,
 * `public/apple-touch-icon.png`) sont cette même composition posée sur le vert
 * de marque (#00261a), produite par le même script.
 */
export const BRAND_LOGO = '/logo/logo-lockup.png';

interface LogoProps {
  /** Classes de dimensionnement ; garder `w-auto` pour préserver le ratio. */
  className?: string;
  /**
   * Nom accessible de la marque. Vide (défaut) = image purement décorative,
   * quand le nom est déjà écrit en toutes lettres à côté.
   */
  label?: string;
}

export default function Logo({ className = 'h-10 w-auto', label = '' }: LogoProps) {
  return (
    <img
      src={BRAND_LOGO}
      alt={label}
      aria-hidden={label ? undefined : true}
      draggable={false}
      decoding="async"
      /* `object-contain` : si la colonne se comprime (écran 320 px), l'image
         rétrécit sans jamais s'écraser ni se déformer. */
      className={`object-contain select-none ${className}`}
    />
  );
}
