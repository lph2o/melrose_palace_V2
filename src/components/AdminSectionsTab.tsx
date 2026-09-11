import { motion } from 'motion/react';
import { Eye, EyeOff, ExternalLink, RotateCcw } from 'lucide-react';
import { SiteSettings } from '../types';
import { SITE_SECTIONS, hiddenSectionTypes } from '../site/sectionsCatalog';

const EASE = [0.32, 0.72, 0, 1] as const;

interface AdminSectionsTabProps {
  settings: SiteSettings;
  /**
   * Patch remonté au formulaire de l'Espace Gérant : la sauvegarde est
   * automatique (débounce 900 ms → Supabase → diffusion temps réel sur le site).
   */
  onChange: (patch: Partial<SiteSettings>) => void;
  /** Ouvre l'éditeur visuel `/admin/editor` — bouton masqué si absent. */
  onOpenEditor?: () => void;
}

/** Interrupteur afficher/masquer d'une section. */
function VisibilitySwitch({
  visible,
  label,
  onToggle,
}: {
  visible: boolean;
  label: string;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={visible}
      title={visible ? `Masquer « ${label} » sur le site` : `Afficher « ${label} » sur le site`}
      aria-label={visible ? `Masquer ${label}` : `Afficher ${label}`}
      onClick={onToggle}
      className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full ring-1 transition-colors duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] cursor-pointer ${
        visible
          ? 'bg-(--admin-accent)/25 ring-(--admin-accent)/45 hover:bg-(--admin-accent)/35'
          : 'bg-(--admin-shell-strong) ring-(--admin-ring) hover:bg-(--admin-ring)'
      }`}
    >
      <span
        className={`absolute left-1 w-5 h-5 rounded-full transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          visible
            ? 'translate-x-5 bg-(--admin-accent) shadow-[0_0_12px_rgba(254,214,91,0.45)]'
            : 'translate-x-0 bg-(--admin-muted)'
        }`}
      />
    </button>
  );
}

/**
 * Onglet « Sections » — visibilité des sections de la page d'accueil.
 *
 * Masquer une section est **non destructif** : la composition Puck publiée et
 * les textes restent en base, seul l'affichage public est filtré
 * (`src/components/HomePage.tsx`). Réactiver un interrupteur réaffiche la
 * section exactement dans l'état où elle était.
 *
 * Effet de bord volontaire : les liens de navigation et CTA qui pointent vers
 * l'ancre d'une section masquée disparaissent (`src/components/Navbar.tsx`),
 * pour ne pas laisser de bouton inerte.
 */
export default function AdminSectionsTab({ settings, onChange, onOpenEditor }: AdminSectionsTabProps) {
  const hidden = hiddenSectionTypes(settings);
  const isHidden = (type: string) => hidden.includes(type);
  const visibleCount = SITE_SECTIONS.length - hidden.length;

  const toggle = (type: string) =>
    onChange({
      hiddenSections: isHidden(type) ? hidden.filter((t) => t !== type) : [...hidden, type],
    });

  const showAll = () => onChange({ hiddenSections: [] });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3 pb-2 border-b border-(--admin-hairline)">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-(--admin-accent)/70">
            Sections du site
          </p>
          <p className="text-[11px] text-(--admin-muted) mt-1">
            Affichez ou masquez chaque section de la page d'accueil. Les sections
            masquées ne sont pas supprimées : leur contenu reste éditable dans
            l'éditeur visuel et réapparaît tel quel à la réactivation.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="px-3 py-1.5 rounded-full bg-(--admin-shell) ring-1 ring-(--admin-ring) font-mono text-[10px] uppercase tracking-[0.2em] text-(--admin-muted)">
            {hidden.length === 0
              ? `${visibleCount} affichées`
              : `${visibleCount} / ${SITE_SECTIONS.length} affichées`}
          </span>
          {hidden.length > 0 && (
            <button
              type="button"
              onClick={showAll}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-(--admin-shell) ring-1 ring-(--admin-ring) font-mono text-[10px] uppercase tracking-widest text-(--admin-text-2) hover:text-(--admin-accent) hover:ring-(--admin-accent)/40 active:scale-[0.98] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" strokeWidth={1.5} />
              Tout afficher
            </button>
          )}
          {onOpenEditor && (
            <button
              type="button"
              onClick={onOpenEditor}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-(--admin-shell) ring-1 ring-(--admin-ring) font-mono text-[10px] uppercase tracking-widest text-(--admin-text-2) hover:text-(--admin-accent) hover:ring-(--admin-accent)/40 active:scale-[0.98] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] cursor-pointer"
            >
              <ExternalLink className="w-3 h-3" strokeWidth={1.5} />
              Éditeur visuel
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SITE_SECTIONS.map((section, index) => {
          const visible = !isHidden(section.type);
          const Icon = section.icon;
          return (
            <motion.div
              key={section.type}
              initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }}
              whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.5, delay: Math.min(index * 0.03, 0.24), ease: EASE }}
              className={`p-1.5 rounded-[1.75rem] ring-1 transition-colors duration-500 ${
                visible
                  ? 'bg-(--admin-shell) ring-(--admin-ring) hover:bg-(--admin-shell-strong)'
                  : 'bg-(--admin-shell)/40 ring-(--admin-ring)/60'
              }`}
            >
              <div
                className={`flex h-full items-start gap-3.5 rounded-[calc(1.75rem-0.375rem)] p-4 transition-colors duration-500 ${
                  visible ? 'bg-(--admin-card)' : 'bg-(--admin-card)/50'
                }`}
              >
                <div
                  className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center ring-1 transition-colors duration-500 ${
                    visible
                      ? 'bg-(--admin-accent)/12 ring-(--admin-accent)/25 text-(--admin-accent)'
                      : 'bg-(--admin-shell-strong) ring-(--admin-ring) text-(--admin-muted)'
                  }`}
                >
                  <Icon className="w-4.5 h-4.5" strokeWidth={1.5} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p
                      className={`font-serif text-base font-bold leading-tight truncate transition-colors duration-500 ${
                        visible ? 'text-(--admin-text)' : 'text-(--admin-muted)'
                      }`}
                    >
                      {section.label}
                    </p>
                    {!visible && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-(--admin-shell-strong) ring-1 ring-(--admin-ring) font-mono text-[9px] uppercase tracking-[0.2em] text-(--admin-muted)">
                        <EyeOff className="w-2.5 h-2.5" strokeWidth={1.5} />
                        Masquée
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-(--admin-muted) mt-1 leading-relaxed">{section.desc}</p>
                  {section.anchor && (
                    <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-(--admin-muted-2) mt-2">
                      lien #{section.anchor}
                    </p>
                  )}
                </div>

                <div className="flex flex-col items-end gap-2 pl-1">
                  <VisibilitySwitch
                    visible={visible}
                    label={section.label}
                    onToggle={() => toggle(section.type)}
                  />
                  <span className="inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.2em] text-(--admin-muted-2)">
                    {visible ? (
                      <>
                        <Eye className="w-3 h-3" strokeWidth={1.5} /> Affichée
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3 h-3" strokeWidth={1.5} /> Masquée
                      </>
                    )}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="p-4 rounded-2xl bg-(--admin-shell) ring-1 ring-(--admin-ring)">
        <p className="text-[11px] text-(--admin-muted) leading-relaxed">
          <span className="text-(--admin-text-2) font-semibold">Bon à savoir :</span> masquer
          s'applique aux deux langues et à tous les appareils. Un lien de navigation ou un bouton
          qui pointe vers une section masquée est retiré automatiquement (ex. masquer « Contact »
          retire le bouton de prise de rendez-vous de l'en-tête). La section reste dans la
          composition publiée : elle réapparaît intacte dès que vous la réactivez, sans
          republication dans l'éditeur visuel.
        </p>
      </div>
    </div>
  );
}
