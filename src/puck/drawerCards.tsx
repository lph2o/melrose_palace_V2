import {
  Calculator,
  Compass,
  Contact,
  FileQuestion,
  GripVertical,
  Landmark,
  Layers,
  Map,
  MessageSquareQuote,
  Newspaper,
  Package,
  ShieldCheck,
  Video,
} from 'lucide-react';
import { puckConfig } from './config';

/**
 * Cartes illustrées de la bibliothèque de blocs (override `drawerItem`).
 *
 * Puck rend chaque item de sa bibliothèque via `overrides.drawerItem`, qui
 * reçoit `{ children, name }` :
 *   - `name` = la clé du bloc dans `puckConfig.components` (« Hero »,
 *     « Garanties », …) ;
 *   - `children` = le rendu par défaut (label + poignée de drag).
 *
 * Le drag-and-drop est porté par le conteneur parent de Puck (`dragRef` +
 * listeners dnd-kit), pas par `children` : on peut donc remplacer entièrement
 * le contenu par une carte illustrée sans casser le dépôt de bloc dans le
 * canevas. On garde néanmoins une poignée visuelle (`GripVertical`) pour
 * signaler que l'item est déplaçable.
 *
 * Un bloc inconnu (ajouté à la config sans entrée ici) retombe sur `children`
 * : la bibliothèque ne casse jamais.
 */

interface BlockMeta {
  /** Icône lucide affichée dans la carte. */
  icon: typeof Compass;
  /** Courte description rédactionnelle du bloc. */
  desc: string;
}

export const DRAWER_BLOCK_META: Record<string, BlockMeta> = {
  Hero: { icon: Compass, desc: 'Bannière principale, chiffres clés et CTA' },
  Garanties: { icon: ShieldCheck, desc: 'Points de garantie et engagement' },
  Vision: { icon: Map, desc: 'Vue aérienne, plan cadastral et piliers' },
  Videos: { icon: Video, desc: 'Vidéos du domaine avec téléversement' },
  Localisation: { icon: Layers, desc: 'Localisation stratégique et infrastructures' },
  Simulateur: { icon: Calculator, desc: 'Simulateur de financement interactif' },
  Packs: { icon: Package, desc: 'Packs complémentaires du domaine' },
  Banque: { icon: Landmark, desc: 'Financement bancaire partenaire' },
  Temoignages: { icon: MessageSquareQuote, desc: 'Témoignages des acquéreurs' },
  Articles: { icon: Newspaper, desc: 'Articles et guides du blog' },
  FAQ: { icon: FileQuestion, desc: 'Questions fréquentes' },
  Contact: { icon: Contact, desc: 'Formulaire de contact et coordonnées' },
};

const COMPONENTS = puckConfig.components as Record<string, { label?: string }>;

/** Libellés d'éditeur (config Puck) raccourcis pour la carte. */
const SHORT_LABELS: Record<string, string> = {
  'Hero (bannière principale)': 'Hero',
  'Garanties & sécurisation': 'Garanties',
  'Vision & orthophoto': 'Vision',
  'Vidéos du domaine': 'Vidéos',
  'Localisation stratégique': 'Localisation',
  'Simulateur de financement': 'Simulateur',
  'Packs complémentaires': 'Packs',
  'Financement bancaire': 'Banque',
  'Témoignages': 'Témoignages',
  'Articles & guides': 'Articles',
  'FAQ': 'FAQ',
  'Contact & dossier': 'Contact',
};

/**
 * Résout la clé d'un bloc. Puck passe tantôt la clé (« Hero »), tantôt le
 * label (« Hero (bannière principale) » — aperçu pendant le drag).
 */
export function resolveBlockName(name: string): string {
  if (DRAWER_BLOCK_META[name]) return name;
  const found = Object.entries(COMPONENTS).find(([, c]) => c?.label === name);
  return found?.[0] ?? '';
}

/** Libellé court d'un bloc pour les badges/overlays (clé OU label Puck). */
export function blockShortLabel(name: string): string {
  const key = resolveBlockName(name);
  if (!key) return name;
  const rawLabel = COMPONENTS[key]?.label ?? name;
  return SHORT_LABELS[rawLabel] ?? rawLabel;
}

export function DrawerCard({ children, name }: { children: React.ReactNode; name: string }) {
  const key = resolveBlockName(name);
  const meta = DRAWER_BLOCK_META[key];
  if (!meta) {
    // Bloc non répertorié : on garde le rendu par défaut de Puck.
    return <>{children}</>;
  }

  const title = blockShortLabel(name);
  const Icon = meta.icon;

  return (
    <div className="puck-drawer-card">
      <div className="puck-drawer-card-icon">
        <Icon className="puck-drawer-card-icon-svg" strokeWidth={1.5} />
      </div>
      <div className="puck-drawer-card-body">
        <span className="puck-drawer-card-title">{title}</span>
        <span className="puck-drawer-card-desc">{meta.desc}</span>
      </div>
      <GripVertical className="puck-drawer-card-grip" size={14} strokeWidth={1.5} />
    </div>
  );
}