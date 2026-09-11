import { GripVertical } from 'lucide-react';
import { blockShortLabel, DRAWER_BLOCK_META } from './drawerCards';

/**
 * Overrides UI du panneau de props et des overlays de sélection du canevas.
 *
 * Tout est ÉDITEUR UNIQUEMENT (importé par `AdminEditorPage.tsx`, chunk lazy).
 *
 * - `EditorFieldLabel` : remplace `fieldLabel` — labels de champs premium,
 *   cohérents avec les cartes de la bibliothèque (pastille dorée, typo
 *   soignée, groupe « Contenu » en titre de section).
 * - `EditorComponentOverlay` : remplace `componentOverlay` — cadre de
 *   sélection doré + badge flottant avec le nom du bloc, dans l'esprit
 *   Framer/Webflow. Rendu dans un portal absolu au-dessus du bloc.
 */

interface FieldLabelProps {
  children?: React.ReactNode;
  icon?: React.ReactNode;
  label: string;
  el?: 'label' | 'div';
  readOnly?: boolean;
  className?: string;
}

export function EditorFieldLabel({
  children,
  icon,
  label,
  el = 'label',
  readOnly,
  className,
}: FieldLabelProps) {
  const El = el;
  // Le champ objet « content » est rendu avec `el: "div"` + une icône : on le
  // traite comme un groupe de section (titre avec bordure), les autres champs
  // comme des labels simples avec pastille.
  const isGroup = el === 'div';

  return (
    <El className={className}>
      <div className={`puck-field-label${isGroup ? ' is-group' : ''}`}>
        {isGroup ? (
          <>
            <GripVertical size={13} strokeWidth={1.5} className="puck-field-label-grip" />
            <span className="puck-field-label-text">{label}</span>
          </>
        ) : (
          <>
            <span className="puck-field-label-dot" aria-hidden="true" />
            <span className="puck-field-label-text">{label}</span>
          </>
        )}
        {icon && !isGroup ? <span className="puck-field-label-icon">{icon}</span> : null}
        {readOnly ? <span className="puck-field-label-readonly">Lecture seule</span> : null}
      </div>
      {children}
    </El>
  );
}

interface ComponentOverlayProps {
  children: React.ReactNode;
  componentId: string;
  componentType: string;
  hover: boolean;
  isSelected: boolean;
}

export function EditorComponentOverlay({
  children,
  componentType,
  hover,
  isSelected,
}: ComponentOverlayProps) {
  const meta = DRAWER_BLOCK_META[componentType];
  const showBadge = hover || isSelected;

  return (
    <div className="puck-overlay-root">
      {/* Badge du nom du bloc, flottant au-dessus du cadre */}
      <span
        className={`puck-overlay-badge${showBadge ? ' is-visible' : ''}${
          isSelected ? ' is-selected' : ''
        }`}
        aria-hidden="true"
      >
        {meta?.icon ? <meta.icon size={11} strokeWidth={2} className="puck-overlay-badge-icon" /> : null}
        {blockShortLabel(componentType)}
      </span>
      {/* Cadre de sélection fourni par Puck */}
      {children}
    </div>
  );
}