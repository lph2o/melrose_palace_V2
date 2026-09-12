import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MutableRefObject,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';

/**
 * Enveloppe commune à toutes les modales du site.
 *
 * Elle centralise ce qu'aucune modale ne doit réimplémenter :
 * - **Portail** : rendu dans `document.body`, donc à l'abri des `transform` et
 *   `overflow` des ancêtres (une carte animée par `.reveal` crée un contexte
 *   d'empilement qui piégerait une modale laissée sur place).
 * - **Feuille glissante sur mobile** : ancrée en bas, coins supérieurs
 *   arrondis, poignée de préhension, fermeture par glissé vers le bas.
 *   Sur écran large : carte centrée classique.
 * - **Accessibilité** : `role="dialog"` + `aria-modal`, piège de focus (Tab),
 *   fermeture par Échap, focus rendu à l'élément d'origine à la fermeture.
 * - **Défilement** : la page derrière est verrouillée, le corps de la modale
 *   défile indépendamment.
 * - **`dvh`** partout : la hauteur reste juste quand la barre d'URL iOS
 *   apparaît ou disparaît.
 */
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Largeur à partir de laquelle la feuille redevient une carte centrée.
 *  Doit rester aligné sur le préfixe Tailwind `sm:` (640px) utilisé ci-dessous. */
const SHEET_BREAKPOINT = 640;

/** Seuil de fermeture au glissé : 28 % de la hauteur, ou un geste vif. */
const DISMISS_RATIO = 0.28;
const DISMISS_VELOCITY = 0.6; // px/ms
/** Durée de l'animation de sortie (doit rester alignée sur `.sheet-leave`). */
const LEAVE_MS = 220;

/**
 * Fermeture animée de la modale courante.
 *
 * À utiliser **à la place** de la prop `onClose` dans tous les boutons de
 * fermeture : le panneau joue sa sortie, puis seulement le parent démonte la
 * modale.
 *
 * Pourquoi une référence et non un contexte : la modale est rendue **au-dessus**
 * de `ModalShell`, qui est son enfant. Un `useContext` appelé dans le corps de la
 * modale lit donc le contexte à sa *propre* position dans l'arbre — c'est-à-dire
 * en dehors du fournisseur — et retombe toujours sur la valeur par défaut. C'est
 * exactement le piège qui rendait chaque bouton « Fermer » inerte alors que
 * Échap, le fond et le glissé (internes à la coque) fonctionnaient.
 *
 * La coque remplit `closeRef` à son montage ; `close` est stable et délègue,
 * donc les gestionnaires existants (`onClick={() => { copier(); close(); }}`)
 * continuent de fonctionner sans modification.
 */
export function useModalClose(): { close: () => void; closeRef: MutableRefObject<() => void> } {
  const closeRef = useRef<() => void>(() => {});
  const close = useCallback(() => closeRef.current(), []);
  return { close, closeRef };
}

export interface ModalShellProps {
  onClose: () => void;
  children: ReactNode;
  /**
   * Reçoit la fermeture animée dès le montage de la coque. Rempli par
   * `useModalClose()` (`closeRef`), qui rend le bouton de fermeture de la
   * modale opérationnel. Sans lui, `close()` ne fait rien.
   */
  closeRef?: MutableRefObject<() => void>;
  /** Id de l'élément qui porte le titre de la modale (`aria-labelledby`). */
  labelledBy?: string;
  /** Repli si la modale n'a pas de titre visible. */
  label?: string;
  /**
   * Classes du panneau : **le fond est à la charge de la modale** (`bg-white`,
   * `bg-surface`, `bg-primary`…), ainsi que la largeur maximale, les bordures
   * et le layout interne. La coque apporte la mise en page, pas la couleur.
   */
  panelClassName?: string;
  /** Remplace les classes d'alignement/remplissage de la couche plein écran. */
  wrapperClassName?: string;
  /** Remplace l'habillage du fond (teinte, flou) — pour les modales immersives. */
  backdropClassName?: string;
  /** Le clic sur le fond ferme la modale (défaut : oui). */
  closeOnBackdrop?: boolean;
  /** Le glissé vers le bas ferme la feuille sur mobile (défaut : oui). */
  dragToDismiss?: boolean;
  /** Libellé de la poignée pour les lecteurs d'écran. */
  handleLabel?: string;
}

export function ModalShell({
  onClose,
  children,
  closeRef,
  labelledBy,
  label,
  panelClassName = '',
  wrapperClassName,
  backdropClassName = 'bg-primary/85 backdrop-blur-sm',
  closeOnBackdrop = true,
  dragToDismiss = true,
  handleLabel,
}: ModalShellProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [closing, setClosing] = useState(false);
  const closingRef = useRef(false);
  const gesture = useRef({ startY: 0, active: false, moved: false, lastY: 0, lastT: 0, velocity: 0 });

  /* --- Fermeture : on joue la sortie, puis on laisse le parent démonter ---
     Le verrou est une `ref`, pas l'état : l'état ne change qu'après le rendu, si
     bien qu'un double appui (croix + Échap, ou tap + glissé) programmerait deux
     appels à `onClose`. Un `setTimeout` posé dans un *updater* ne serait de toute
     façon pas pur — React peut l'invoquer deux fois. */
  const requestClose = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    setClosing(true);
    window.setTimeout(onClose, LEAVE_MS);
  }, [onClose]);

  /* --- La modale reçoit la fermeture animée par référence ---
     La coque étant l'enfant de la modale, elle ne peut pas lui fournir de
     contexte React : elle publie donc la fonction dans la référence qu'on lui
     passe. Après ce montage, `close()` est opérationnel. */
  useEffect(() => {
    if (!closeRef) return;
    closeRef.current = requestClose;
    return () => {
      closeRef.current = () => {};
    };
  }, [closeRef, requestClose]);

  /* --- Échap, piège de focus, verrouillage du défilement --- */
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        requestClose();
        return;
      }
      if (event.key !== 'Tab') return;
      const panel = panelRef.current;
      if (!panel) return;
      const focusables = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null,
      );
      if (focusables.length === 0) {
        event.preventDefault();
        panel.focus();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && (active === first || active === panel)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    // Le focus est posé après le montage : les modales qui montent un lecteur
    // vidéo ou un iframe ont besoin que le DOM soit stable.
    const focusTimer = window.setTimeout(() => {
      const panel = panelRef.current;
      if (!panel) return;
      const target = panel.querySelector<HTMLElement>(FOCUSABLE) ?? panel;
      target.focus({ preventScroll: true });
    }, 60);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
      window.clearTimeout(focusTimer);
      previouslyFocused?.focus?.({ preventScroll: true } as FocusOptions);
    };
  }, [requestClose]);

  /* --- Glissé vers le bas pour fermer (mobile uniquement) --- */
  const onHandlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!dragToDismiss || window.innerWidth >= SHEET_BREAKPOINT) return;
      gesture.current = {
        startY: event.clientY,
        active: true,
        moved: false,
        lastY: event.clientY,
        lastT: performance.now(),
        velocity: 0,
      };
      setDragging(true);
      event.currentTarget.setPointerCapture?.(event.pointerId);
    },
    [dragToDismiss],
  );

  const onHandlePointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const g = gesture.current;
    if (!g.active) return;
    const delta = event.clientY - g.startY;
    if (delta <= 0 && !g.moved) return; // vers le haut : on ne fait rien
    g.moved = true;
    const now = performance.now();
    const dt = Math.max(1, now - g.lastT);
    g.velocity = (event.clientY - g.lastY) / dt;
    g.lastY = event.clientY;
    g.lastT = now;
    setDragY(Math.max(0, delta));
  }, []);

  const onHandlePointerUp = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const g = gesture.current;
      if (!g.active) return;
      g.active = false;
      setDragging(false);
      event.currentTarget.releasePointerCapture?.(event.pointerId);
      const height = panelRef.current?.getBoundingClientRect().height ?? 0;
      if (dragY > height * DISMISS_RATIO || g.velocity > DISMISS_VELOCITY) {
        setDragY(0);
        requestClose();
      } else {
        setDragY(0);
      }
    },
    [dragY, requestClose],
  );

  return createPortal(
    <>
      <div
        data-closing={closing ? '' : undefined}
        className={
          wrapperClassName ??
          'fixed inset-0 z-[var(--z-modal)] flex items-end justify-center overflow-hidden sm:items-center sm:p-4'
        }
      >
        <div
          className={`modal-backdrop absolute inset-0 ${backdropClassName}`}
          onClick={closeOnBackdrop ? requestClose : undefined}
          aria-hidden="true"
        />
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={labelledBy}
          aria-label={labelledBy ? undefined : label}
          tabIndex={-1}
          className={`sheet-safe relative z-10 flex w-full flex-col overflow-hidden rounded-t-card shadow-elev-3 max-h-[92dvh] sm:max-h-[90dvh] sm:rounded-card ${
            closing ? 'sheet-leave' : 'sheet-enter'
          } ${
            dragging ? 'transition-none' : 'transition-transform duration-400 ease-spring'
          } ${panelClassName}`}
          style={dragY ? { transform: `translateY(${dragY}px)` } : undefined}
        >
          {/* Poignée de préhension : mobile uniquement, et seule zone de glissé
              (le reste de la feuille doit rester cliquable et défilable). */}
          {dragToDismiss ? (
            <div
              onPointerDown={onHandlePointerDown}
              onPointerMove={onHandlePointerMove}
              onPointerUp={onHandlePointerUp}
              onPointerCancel={onHandlePointerUp}
              aria-hidden="true"
              className="flex h-7 shrink-0 cursor-grab touch-none items-center justify-center active:cursor-grabbing sm:hidden"
            >
              <span className="h-1 w-10 rounded-full bg-primary/20" />
            </div>
          ) : null}
          {children}
        </div>
      </div>
    </>,
    document.body,
  );
}
