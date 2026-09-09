import React from 'react';
import { motion } from 'motion/react';
import { X, Download, ExternalLink, FileText } from 'lucide-react';
import { SiteSettings, Language } from '../types';

/**
 * Official brochure viewer — renders the real PDF (public/pdf/Dun-Tni-Brochure-Premium.pdf)
 * inside a premium modal shell. The browser's native PDF viewer handles paging,
 * zoom and print; explicit Download / Open actions cover mobile browsers that
 * don't render inline PDFs.
 */

// URL pilotable depuis l'Espace Gérant (onglet Contenu → Plaquette PDF),
// avec repli sur la plaquette locale du dépôt.
const BROCHURE_URL_FALLBACK = '/pdf/Dun-Tni-Brochure-Premium.pdf';

interface BrochureModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SiteSettings;
  currentLanguage: Language;
}

const EASE: [number, number, number, number] = [0.32, 0.72, 0, 1];

export default function BrochureModal({
  isOpen,
  onClose,
  settings,
  currentLanguage,
}: BrochureModalProps) {
  if (!isOpen) return null;

  const brochureUrl = settings.brochureUrl || BROCHURE_URL_FALLBACK;
  const brochureName = brochureUrl.split('/').pop()?.split('?')[0] || 'Plaquette-Dun-Tni.pdf';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: EASE }}
        className="bg-[#FAF9F5] text-primary rounded-2xl max-w-4xl w-full shadow-2xl border border-secondary-fixed/30 overflow-hidden my-4 flex flex-col max-h-[92vh]"
      >
        {/* Header toolbar */}
        <div className="bg-[#00261a] text-white px-5 py-3.5 flex justify-between items-center border-b border-white/10 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-secondary-fixed text-primary flex items-center justify-center font-bold shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-serif font-bold text-sm sm:text-base text-white">
                  Plaquette Officielle • Dun Tni Sébikhotane
                </span>
                <span className="bg-secondary-fixed/20 text-secondary-fixed text-[10px] font-mono px-2 py-0.5 rounded-full border border-secondary-fixed/30">
                  RÉF. LOT/2026
                </span>
              </div>
              <p className="text-[11px] text-white/70">
                Document officiel Sénégal Immobilier Consulting — PDF
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <a
              href={brochureUrl}
              download={brochureName}
              className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs transition-colors cursor-pointer border border-white/15"
              title="Télécharger la plaquette PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Télécharger</span>
            </a>
            <a
              href={brochureUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs transition-colors cursor-pointer border border-white/15"
              title="Ouvrir dans un nouvel onglet"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Nouvel onglet</span>
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/15 text-white/80 hover:text-white transition-colors cursor-pointer"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Real PDF viewer — native browser engine (paging, zoom, print inclus) */}
        <div className="flex-grow bg-[#525659] relative min-h-0">
          <iframe
            src={`${brochureUrl}#view=FitH`}
            title="Plaquette Officielle Dun Tni Sébikhotane (PDF)"
            className="absolute inset-0 w-full h-full border-0"
          />
        </div>

        {/* Footer actions — always-visible fallbacks (mobile / no inline PDF) */}
        <div className="bg-white px-5 py-3 border-t border-gray-300 flex flex-wrap justify-between items-center gap-2 text-xs shrink-0">
          <span className="text-gray-500 font-mono text-[11px]">
            Dun Tni • Sébikhotane — Réf. LOT/2026
          </span>
          <div className="flex space-x-2">
            <a
              href={brochureUrl}
              download={brochureName}
              className="px-3.5 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-100 text-gray-700 font-medium transition-colors cursor-pointer inline-flex items-center space-x-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Télécharger</span>
            </a>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors cursor-pointer"
            >
              Fermer
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
