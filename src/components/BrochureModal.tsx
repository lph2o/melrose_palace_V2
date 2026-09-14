import { useEffect, useMemo, useState } from 'react';
import {
  X,
  Download,
  ExternalLink,
  FileText,
  ChevronLeft,
  ChevronRight,
  Images,
  File as FileIcon,
} from 'lucide-react';
import { SiteSettings, Language } from '../types';
import { ModalShell, useModalClose } from '../ui';
import { SITE_MEDIA_BASE_URL } from '../data';

/**
 * Lecteur de la plaquette officielle Dun Tni.
 *
 * Deux modes, parce qu'un `<iframe>` PDF n'est pas fiable partout (sur iOS et
 * dans de nombreux WebView, il n'affiche rien) :
 *
 *  - **Pages** (par défaut) : les 7 pages de la plaquette sont pré-rendues en
 *    images (`public/pdf/plaquette/page-N.jpg`, générées depuis le PDF) et
 *    affichées dans un lecteur paginé. Ça s'affiche sur tous les téléphones,
 *    sans plugin PDF ni librairie externe.
 *  - **PDF** : le PDF d'origine dans le viewer natif du navigateur, pour la
 *    sélection de texte, le zoom et l'impression sur ordinateur.
 *
 * Le téléchargement du PDF reste accessible dans les deux modes.
 *
 * Si le gérant remplace la plaquette par un autre PDF (Espace Gérant →
 * Plaquette), les images ne correspondent plus : on retombe automatiquement sur
 * le mode PDF.
 */

// URL pilotable depuis l'Espace Gérant (onglet Contenu → Plaquette PDF),
// avec repli sur la plaquette hébergée dans le bucket « site-media ».
const BROCHURE_URL_FALLBACK = `${SITE_MEDIA_BASE_URL}/pdf/Dun-Tni-Brochure-Premium.pdf`;

/** Nom du fichier dont les pages ont été pré-rendues en images. */
const RENDERED_BROCHURE_FILE = 'Dun-Tni-Brochure-Premium.pdf';
const RENDERED_PAGE_COUNT = 7;
const PAGE_IMAGE_PATH = (page: number) => `/pdf/plaquette/page-${page}.jpg`;

interface BrochureModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SiteSettings;
  currentLanguage: Language;
}


export default function BrochureModal({
  isOpen,
  onClose,
  settings,
  currentLanguage,
}: BrochureModalProps) {
  const isFR = currentLanguage === 'FR';
  const [mode, setMode] = useState<'pages' | 'pdf'>('pages');
  const [page, setPage] = useState(1);

  const brochureUrl = settings.brochureUrl || BROCHURE_URL_FALLBACK;
  const brochureName = brochureUrl.split('/').pop()?.split('?')[0] || 'Plaquette-Dun-Tni.pdf';

  // Le lecteur paginé n'est proposé que pour la plaquette effectivement
  // pré-rendue : un PDF remplacé par le gérant ne doit pas afficher les
  // images de l'ancienne plaquette.
  const hasRenderedPages = brochureUrl.includes(RENDERED_BROCHURE_FILE);

  // Réinitialise la lecture à la fermeture (sinon on rouvre sur la dernière page).
  useEffect(() => {
    if (!isOpen) {
      setPage(1);
      setMode('pages');
    }
  }, [isOpen]);

  // Flèches clavier ←/→ pour tourner les pages. Échap est géré par ModalShell.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (!hasRenderedPages) return;
      if (e.key === 'ArrowLeft') setPage((p) => Math.max(1, p - 1));
      if (e.key === 'ArrowRight') setPage((p) => Math.min(RENDERED_PAGE_COUNT, p + 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, hasRenderedPages, onClose]);

  const pages = useMemo(
    () => Array.from({ length: RENDERED_PAGE_COUNT }, (_, i) => i + 1),
    []
  );

  const { close, closeRef } = useModalClose();

  if (!isOpen) return null;

  const activeMode = hasRenderedPages ? mode : 'pdf';

  return (
    <ModalShell
      onClose={onClose}
      closeRef={closeRef}
      label={isFR ? 'Plaquette officielle' : 'Official brochure'}
      wrapperClassName="fixed inset-0 z-[var(--z-modal)] flex items-end justify-center overflow-hidden sm:items-center sm:p-4"
      backdropClassName="bg-black/80 backdrop-blur-md"
      panelClassName="max-w-4xl bg-surface text-primary border border-secondary-fixed/30"
    >
        {/* Header toolbar */}
        <div className="bg-[#00261a] text-white px-5 py-3.5 flex justify-between items-center border-b border-white/10 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-micro bg-secondary-fixed text-primary flex items-center justify-center font-bold shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-serif font-bold text-sm sm:text-base text-white">
                  {isFR
                    ? 'Plaquette Officielle • Dun Tni Sébikhotane'
                    : 'Official Brochure • Dun Tni Sébikhotane'}
                </span>
                <span className="bg-secondary-fixed/20 text-secondary-fixed text-caption font-mono px-2 py-0.5 rounded-full border border-secondary-fixed/30">
                  {isFR ? 'RÉF. LOT/2026' : 'REF. LOT/2026'}
                </span>
              </div>
              <p className="text-caption text-white/70">
                {isFR
                  ? 'Document officiel Senegal Investment Consulting — PDF'
                  : 'Official document — Senegal Investment Consulting — PDF'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <a
              href={brochureUrl}
              download={brochureName}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-micro bg-white/10 hover:bg-white/20 text-white text-xs transition-colors cursor-pointer border border-white/15"
              title={isFR ? 'Télécharger la plaquette PDF' : 'Download the brochure PDF'}
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isFR ? 'Télécharger' : 'Download'}</span>
            </a>
            <a
              href={brochureUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-micro bg-white/10 hover:bg-white/20 text-white text-xs transition-colors cursor-pointer border border-white/15"
              title={isFR ? 'Ouvrir dans un nouvel onglet' : 'Open in a new tab'}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>{isFR ? 'Nouvel onglet' : 'New tab'}</span>
            </a>
            <button
              onClick={close}
              className="p-2.5 tap-44 rounded-micro hover:bg-white/15 text-white/85 hover:text-white transition-colors duration-400 cursor-pointer"
              aria-label={isFR ? 'Fermer' : 'Close'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mode switcher — le PDF natif reste disponible quand il fonctionne */}
        {hasRenderedPages && (
          <div className="bg-white border-b border-gray-200 px-5 py-2 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center bg-gray-100 p-0.5 rounded-inner text-caption font-bold">
              <button
                onClick={() => setMode('pages')}
                className={`px-3 py-1.5 rounded-micro flex items-center space-x-1.5 transition-all cursor-pointer ${
                  activeMode === 'pages' ? 'bg-white text-primary shadow-elev-1' : 'text-outline hover:text-primary'
                }`}
              >
                <Images className="w-3.5 h-3.5" />
                <span>{isFR ? 'Pages' : 'Pages'}</span>
              </button>
              <button
                onClick={() => setMode('pdf')}
                className={`px-3 py-1.5 rounded-micro flex items-center space-x-1.5 transition-all cursor-pointer ${
                  activeMode === 'pdf' ? 'bg-white text-primary shadow-elev-1' : 'text-outline hover:text-primary'
                }`}
              >
                <FileIcon className="w-3.5 h-3.5" />
                <span>PDF</span>
              </button>
            </div>

            {activeMode === 'pages' && (
              <span className="text-caption font-mono text-outline">
                {isFR ? 'Page' : 'Page'} {page} / {RENDERED_PAGE_COUNT}
              </span>
            )}
          </div>
        )}

        {/* Body — hauteur explicite : le conteneur est en flex mais la modale
            n'a pas de hauteur fixe (elle s'adapte au contenu), donc `flex-grow`
            seul ne donnerait aucune hauteur et l'image resterait invisible. */}
        <div className="bg-[#525659] relative h-[46dvh] sm:h-[56dvh] shrink-0 overflow-hidden">
          {activeMode === 'pages' ? (
            <div className="absolute inset-0 flex items-center justify-center p-2 sm:p-4">
              <img
                key={page}
                src={PAGE_IMAGE_PATH(page)}
                alt={
                  isFR
                    ? `Plaquette Dun Tni — page ${page} sur ${RENDERED_PAGE_COUNT}`
                    : `Dun Tni brochure — page ${page} of ${RENDERED_PAGE_COUNT}`
                }
                className="max-h-full max-w-full object-contain shadow-elev-3 bg-white"
                loading="eager"
                decoding="async"
              />

              {/* Navigation */}
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                aria-label={isFR ? 'Page précédente' : 'Previous page'}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/55 hover:bg-black/75 text-white flex items-center justify-center transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-default"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(RENDERED_PAGE_COUNT, p + 1))}
                disabled={page === RENDERED_PAGE_COUNT}
                aria-label={isFR ? 'Page suivante' : 'Next page'}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/55 hover:bg-black/75 text-white flex items-center justify-center transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-default"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <iframe
              src={`${brochureUrl}#view=FitH`}
              title={
                isFR
                  ? 'Plaquette Officielle Dun Tni Sébikhotane (PDF)'
                  : 'Official Dun Tni Sébikhotane brochure (PDF)'
              }
              className="absolute inset-0 w-full h-full border-0"
            />
          )}
        </div>

        {/* Thumbnails (mode Pages) */}
        {activeMode === 'pages' && (
          <div className="bg-white border-t border-gray-200 px-3 py-2 flex items-center gap-2 overflow-x-auto shrink-0">
            {pages.map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`shrink-0 w-9 h-12 rounded-micro border overflow-hidden transition-all cursor-pointer ${
                  p === page
                    ? 'border-primary ring-2 ring-secondary shadow-elev-1'
                    : 'border-gray-200 hover:border-gray-400 opacity-80'
                }`}
                aria-label={isFR ? `Aller à la page ${p}` : `Go to page ${p}`}
              >
                <img
                  src={PAGE_IMAGE_PATH(p)}
                  alt=""
                  className="w-full h-full object-cover object-top"
                  loading="lazy"
                  decoding="async"
                />
              </button>
            ))}
          </div>
        )}

        {/* Footer actions — toujours visibles (mobile / PDF non rendu) */}
        <div className="bg-white px-5 py-3 border-t border-gray-300 flex flex-wrap justify-between items-center gap-2 text-xs shrink-0">
          <span className="text-gray-500 font-mono text-caption">
            Dun Tni • Sébikhotane — {isFR ? 'Réf. LOT/2026' : 'Ref. LOT/2026'}
          </span>
          <div className="flex space-x-2">
            <a
              href={brochureUrl}
              download={brochureName}
              className="px-3.5 py-1.5 rounded-micro border border-gray-300 hover:bg-gray-100 text-gray-700 font-medium transition-colors cursor-pointer inline-flex items-center space-x-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isFR ? 'Télécharger le PDF' : 'Download the PDF'}</span>
            </a>
            <button
              onClick={close}
              className="min-h-[44px] px-4 py-1.5 rounded-full bg-primary text-white font-medium hover:bg-primary/90 transition-colors duration-400 cursor-pointer"
            >
              {isFR ? 'Fermer' : 'Close'}
            </button>
          </div>
        </div>
    </ModalShell>
  );
}
