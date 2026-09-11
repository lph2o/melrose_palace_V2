import {
  Anchor,
  BadgeCheck,
  Building,
  CheckCircle,
  Compass,
  Hammer,
  Home,
  Landmark,
  LineChart,
  MapPin,
  Plane,
  ShieldCheck,
  Sparkles,
  Train,
  TrendingUp,
} from 'lucide-react';

/**
 * Icônes sélectionnables depuis l'éditeur Puck.
 *
 * Puck ne sait sérialiser que des props JSON : on stocke donc le *nom* de
 * l'icône dans la donnée persistée, et on le résout ici au rendu. Ajouter une
 * icône = l'importer et l'ajouter à ce registre (elle apparaît alors dans
 * toutes les listes déroulantes qui utilisent ce type de champ).
 */
export const SECTION_ICONS = {
  Anchor,
  BadgeCheck,
  Building,
  CheckCircle,
  Compass,
  Hammer,
  Home,
  Landmark,
  LineChart,
  MapPin,
  Plane,
  ShieldCheck,
  Sparkles,
  Train,
  TrendingUp,
} as const;

export type SectionIconName = keyof typeof SECTION_ICONS;

export function SectionIcon({ name, className }: { name?: string; className?: string }) {
  const Icon = SECTION_ICONS[(name as SectionIconName) ?? 'CheckCircle'] ?? CheckCircle;
  return <Icon className={className} />;
}
