import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Briefcase,
  Building2,
  Video,
  Table2,
  MapPin,
  Package,
  Sparkles,
  MessageSquareQuote,
  HelpCircle,
  Newspaper,
  ChevronDown,
  Eye,
  Play,
  Star,
  Plus,
  Check,
  Languages,
  FolderOpen,
  Type,
  Hash,
  User,
  Tag,
  Image,
  Images,
  ListChecks,
  CalendarDays,
  FileText,
  Copy,
  Trash2,
  ArrowUp,
  ArrowDown,
  Smartphone,
  Tablet,
  Monitor,
  Clock3,
  XCircle,
  Loader2,
  Undo2,
  X,
} from 'lucide-react';
import MediaUpload from './MediaUpload';
import {
  SiteSettings,
  SiteContent,
  FAQItem,
  BlogArticle,
  ComplementaryPack,
  ConnectivityItem,
  ServiceItem,
  Testimonial,
  PaymentTier,
  VideoContent,
} from '../types';
import { DEFAULT_SITE_CONTENT } from '../data';
import { SECTION_ICONS, SectionIcon } from '../sections/icons';

const EASE = [0.32, 0.72, 0, 1] as const;

/** Clés de collection éditables dans le contenu du site. */
type ItemKey = keyof SiteContent;

const inputCls =
  'w-full px-3.5 py-2.5 rounded-inner bg-(--admin-input) ring-1 ring-(--admin-ring) text-sm text-(--admin-text) ' +
  'placeholder:text-(--admin-muted-2) focus:outline-none focus:ring-2 focus:ring-(--admin-accent)/60 ' +
  'transition-all duration-400 ease-spring';

const labelCls = 'block font-mono text-micro uppercase tracking-[0.2em] text-(--admin-muted)';

/* ------------------------------------------------------------------ *
 * Validation de longueur : compteur n/max (muted → ambre → rouge)
 * ------------------------------------------------------------------ */
function CharCount({ value, max }: { value: string | number; max?: number }) {
  if (!max) return null;
  const n = String(value ?? '').length;
  const pct = n / max;
  const cls = n > max ? 'text-[#fb7185]' : pct >= 0.85 ? 'text-[#fbbf24]' : 'text-(--admin-muted-2)';
  return (
    <span className={`font-mono text-micro tabular-nums shrink-0 ${cls}`} aria-live="polite">
      {n}/{max}
    </span>
  );
}

/* ------------------------------------------------------------------ *
 * Champ unique avec compteur, chemin vérifié et champs requis
 * ------------------------------------------------------------------ */
function Field({
  label,
  value,
  onChange,
  placeholder,
  type,
  max,
  hint,
  pathCheck,
  required,
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  max?: number;
  hint?: string;
  pathCheck?: boolean;
  required?: boolean;
}) {
  const s = String(value ?? '');
  const isPathInvalid = !!pathCheck && s.length > 0 && !/^(\/|https?:\/\/|data:)/.test(s);
  const isMissing = !!required && s.trim().length === 0;
  const bad = isPathInvalid || isMissing;
  return (
    <div className="min-w-0">
      <div className="flex items-baseline justify-between gap-2 mb-1.5">
        <label className={labelCls}>
          {label}
          {required && <span className="text-[#fb7185] ml-0.5">*</span>}
        </label>
        <CharCount value={value} max={max} />
      </div>
      <input
        type={type ?? 'text'}
        value={value ?? ''}
        maxLength={max}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputCls} ${bad ? 'ring-2 ring-[#fb7185]/60' : ''}`}
      />
      {bad ? (
        <p className="mt-1 text-micro text-[#fb7185] font-mono">
          {isMissing ? 'Champ requis — affiché sur le site' : 'Doit commencer par / ou http(s)://'}
        </p>
      ) : hint ? (
        <p className="mt-1 text-micro text-(--admin-muted-2) font-mono truncate">{hint}</p>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Paire FR/EN avec compteurs individuels
 * ------------------------------------------------------------------ */
function LangPair({
  label,
  fr,
  en,
  onFR,
  onEN,
  textarea,
  rows,
  max,
  hint,
  required,
}: {
  label: string;
  fr: string;
  en: string;
  onFR: (v: string) => void;
  onEN: (v: string) => void;
  textarea?: boolean;
  rows?: number;
  max?: number;
  hint?: string;
  required?: boolean;
}) {
  const base = textarea ? 'resize-none' : '';
  const frMissing = !!required && fr.trim().length === 0;
  const enMissing = !!required && en.trim().length === 0;
  const inputClsBad = `${inputCls} ${frMissing ? 'ring-2 ring-[#fb7185]/60' : ''}`;
  const inputClsBadEn = `${inputCls} ${enMissing ? 'ring-2 ring-[#fb7185]/60' : ''}`;
  return (
    <div className="space-y-2 min-w-0">
      <label className={labelCls}>
        {label}
        {required && <span className="text-[#fb7185] ml-0.5">*</span>}
      </label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        <div className="min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-micro font-mono uppercase tracking-widest text-(--admin-muted-2)">FR</span>
            <CharCount value={fr} max={max} />
          </div>
          {textarea ? (
            <textarea
              rows={rows ?? 2}
              value={fr}
              maxLength={max}
              onChange={(e) => onFR(e.target.value)}
              className={`${inputCls} ${base} ${frMissing ? 'ring-2 ring-[#fb7185]/60' : ''}`}
            />
          ) : (
            <input value={fr} maxLength={max} onChange={(e) => onFR(e.target.value)} className={inputClsBad} />
          )}
          {frMissing && <p className="mt-1 text-micro text-[#fb7185] font-mono">Champ requis — affiché sur le site</p>}
        </div>
        <div className="min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-micro font-mono uppercase tracking-widest text-(--admin-muted-2)">EN</span>
            <CharCount value={en} max={max} />
          </div>
          {textarea ? (
            <textarea
              rows={rows ?? 2}
              value={en}
              maxLength={max}
              onChange={(e) => onEN(e.target.value)}
              className={`${inputCls} ${base} ${enMissing ? 'ring-2 ring-[#fb7185]/60' : ''}`}
            />
          ) : (
            <input value={en} maxLength={max} onChange={(e) => onEN(e.target.value)} className={inputClsBadEn} />
          )}
          {enMissing && <p className="mt-1 text-micro text-[#fb7185] font-mono">Champ requis — affiché sur le site</p>}
        </div>
      </div>
      {hint && <p className="text-micro text-(--admin-muted-2) font-mono">{hint}</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Section repliable (en-tête + contenu)
 * ------------------------------------------------------------------ */
function Section({
  icon,
  title,
  sub,
  actions,
  children,
  defaultOpen,
}: {
  icon: React.ReactNode;
  title: string;
  sub: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  return (
    <div className="rounded-card p-1.5 bg-(--admin-shell) ring-1 ring-(--admin-ring)">
      <div className="rounded-inner bg-(--admin-card) shadow-[var(--admin-inset)] overflow-hidden">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="w-full flex items-center justify-between gap-3 px-5 py-4 cursor-pointer group"
        >
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-9 h-9 shrink-0 rounded-inner bg-(--admin-shell-strong) ring-1 ring-(--admin-ring) flex items-center justify-center text-(--admin-accent)">
              {icon}
            </span>
            <div className="text-left min-w-0">
              <p className="font-serif text-sm font-bold text-(--admin-text)">{title}</p>
              <p className="text-caption text-(--admin-muted) truncate">{sub}</p>
            </div>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-(--admin-muted) shrink-0 transition-transform duration-400 ease-spring ${open ? 'rotate-180' : ''}`}
            strokeWidth={1.5}
          />
        </button>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.4, ease: EASE }}
            className="px-5 pb-5 pt-1 border-t border-(--admin-hairline)"
          >
            <div className="space-y-5">
              {actions && <div>{actions}</div>}
              {children}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Groupe de champs structuré (en-tête mono + séparateur)
 * ------------------------------------------------------------------ */
function FormGroup({ icon, label, children }: { icon?: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-inner bg-(--admin-shell-soft) ring-1 ring-(--admin-ring-soft) p-3.5 space-y-3">
      <div className="flex items-center gap-2 pb-2 border-b border-(--admin-hairline)">
        {icon && <span className="text-(--admin-muted) shrink-0">{icon}</span>}
        <span className="font-mono text-micro uppercase tracking-[0.22em] text-(--admin-muted)">{label}</span>
      </div>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Bascule FR/EN de l'aperçu
 * ------------------------------------------------------------------ */
function LangToggle({ lang, onChange }: { lang: 'FR' | 'EN'; onChange: (l: 'FR' | 'EN') => void }) {
  return (
    <div className="flex items-center gap-1.5">
      <Languages className="w-3.5 h-3.5 text-(--admin-muted)" strokeWidth={1.5} />
      {(['FR', 'EN'] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => onChange(l)}
          className={`px-2 py-0.5 rounded-full text-micro font-mono font-bold uppercase tracking-wider transition-all duration-400 ease-spring cursor-pointer ${
            lang === l
              ? 'bg-(--admin-accent) text-(--admin-accent-text)'
              : 'bg-(--admin-shell-strong) text-(--admin-muted) hover:text-(--admin-text)'
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Sélecteur de viewport pour les aperçus (mobile / tablette / desktop)
 * ------------------------------------------------------------------ */
type Viewport = 'mobile' | 'tablet' | 'desktop';

const VP_WIDTH: Record<Viewport, string | number> = { mobile: 375, tablet: 768, desktop: '100%' };
const VP_LABEL: Record<Viewport, string> = { mobile: '375 px', tablet: '768 px', desktop: '100 %' };

function ViewportToggle({ vp, onChange }: { vp: Viewport; onChange: (v: Viewport) => void }) {
  const items: { id: Viewport; icon: React.ReactNode }[] = [
    { id: 'mobile', icon: <Smartphone className="w-3 h-3" strokeWidth={1.5} /> },
    { id: 'tablet', icon: <Tablet className="w-3 h-3" strokeWidth={1.5} /> },
    { id: 'desktop', icon: <Monitor className="w-3 h-3" strokeWidth={1.5} /> },
  ];
  return (
    <div className="flex items-center gap-0.5 rounded-full bg-(--admin-shell-strong) p-0.5 ring-1 ring-(--admin-ring-soft)">
      {items.map((it) => (
        <button
          key={it.id}
          type="button"
          title={`Aperçu ${it.id} (${VP_LABEL[it.id]})`}
          aria-label={`Aperçu ${it.id} (${VP_LABEL[it.id]})`}
          onClick={() => onChange(it.id)}
          className={`w-6 h-5 rounded-full flex items-center justify-center transition-all duration-400 ease-spring cursor-pointer ${
            vp === it.id
              ? 'bg-(--admin-accent) text-(--admin-accent-text)'
              : 'text-(--admin-muted) hover:text-(--admin-text)'
          }`}
        >
          {it.icon}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Bouton d'action compact (réordonner / dupliquer / supprimer)
 * ------------------------------------------------------------------ */
function IconBtn({
  label,
  onClick,
  danger,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={`w-7 h-7 shrink-0 rounded-micro flex items-center justify-center ring-1 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-all duration-400 ease-spring cursor-pointer ${
        danger
          ? 'bg-[#fb7185]/10 text-[#fb7185] ring-[#fb7185]/30 hover:bg-[#fb7185]/20'
          : 'bg-(--admin-shell-strong) text-(--admin-muted) ring-(--admin-ring) hover:text-(--admin-text)'
      }`}
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ *
 * ItemCard : titre + état « Non sauvegardé » + actions (réordonner /
 * dupliquer / supprimer) + aperçu responsive + champs groupés
 * ------------------------------------------------------------------ */
function ItemCard({
  title,
  dirty,
  onDuplicate,
  onDelete,
  onMoveUp,
  onMoveDown,
  children,
  renderPreview,
}: {
  title: string;
  dirty?: boolean;
  onDuplicate?: () => void;
  onDelete?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  children: React.ReactNode;
  key?: React.Key;
  renderPreview?: (lang: 'FR' | 'EN') => React.ReactNode;
}) {
  const [show, setShow] = useState(false);
  const [lang, setLang] = useState<'FR' | 'EN'>('FR');
  const [vp, setVp] = useState<Viewport>('desktop');
  const [confirmDel, setConfirmDel] = useState(false);

  // Réinitialise la confirmation de suppression si l'utilisateur ne clique pas
  useEffect(() => {
    if (!confirmDel) return;
    const t = setTimeout(() => setConfirmDel(false), 3500);
    return () => clearTimeout(t);
  }, [confirmDel]);

  const hasActions = !!(onDuplicate || onDelete || onMoveUp || onMoveDown);

  return (
    <div className="rounded-card bg-(--admin-shell-soft) ring-1 ring-(--admin-ring-soft) p-4 space-y-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 min-w-0">
          <p className="font-mono text-caption uppercase tracking-[0.2em] text-(--admin-accent)/80 truncate">{title}</p>
          {dirty && (
            <span className="shrink-0 flex items-center gap-1.5 rounded-full bg-(--admin-accent)/10 ring-1 ring-(--admin-accent)/30 px-2 py-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-(--admin-accent) shadow-[0_0_8px_rgba(254,214,91,0.9)] animate-pulse" />
              <span className="font-mono text-micro uppercase tracking-[0.18em] text-(--admin-accent)">
                Non sauvegardé
              </span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {hasActions && (
            <div className="flex items-center gap-1 pr-1.5 border-r border-(--admin-hairline)">
              <IconBtn label="Monter" onClick={onMoveUp ?? (() => {})} disabled={!onMoveUp}>
                <ArrowUp className="w-3.5 h-3.5" strokeWidth={1.5} />
              </IconBtn>
              <IconBtn label="Descendre" onClick={onMoveDown ?? (() => {})} disabled={!onMoveDown}>
                <ArrowDown className="w-3.5 h-3.5" strokeWidth={1.5} />
              </IconBtn>
              <IconBtn label="Dupliquer" onClick={onDuplicate ?? (() => {})} disabled={!onDuplicate}>
                <Copy className="w-3.5 h-3.5" strokeWidth={1.5} />
              </IconBtn>
              {onDelete && (
                <IconBtn
                  label={confirmDel ? 'Cliquer pour confirmer la suppression' : 'Supprimer'}
                  danger={confirmDel}
                  onClick={() => {
                    if (confirmDel) {
                      setConfirmDel(false);
                      onDelete();
                    } else {
                      setConfirmDel(true);
                    }
                  }}
                >
                  <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                </IconBtn>
              )}
            </div>
          )}
          {renderPreview && (
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-micro font-mono uppercase tracking-widest font-bold transition-all duration-400 ease-spring cursor-pointer ${
                show
                  ? 'bg-(--admin-accent)/15 text-(--admin-accent) ring-1 ring-(--admin-accent)/30'
                  : 'bg-(--admin-shell-strong) text-(--admin-muted) hover:text-(--admin-text) ring-1 ring-(--admin-ring)'
              }`}
            >
              <Eye className="w-3 h-3" strokeWidth={1.5} />
              {show ? 'Masquer' : 'Aperçu'}
            </button>
          )}
        </div>
      </div>

      {renderPreview && show && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.4, ease: EASE }}
          className="overflow-hidden"
        >
          <div className="rounded-inner bg-(--admin-shell-strong)/50 ring-1 ring-(--admin-ring-soft) p-2.5 space-y-2">
            <div className="flex items-center justify-between gap-2 px-1 flex-wrap">
              <span className="font-mono text-micro uppercase tracking-[0.25em] text-(--admin-muted)">
                Aperçu site — {VP_LABEL[vp]}
              </span>
              <div className="flex items-center gap-2">
                <ViewportToggle vp={vp} onChange={setVp} />
                <LangToggle lang={lang} onChange={setLang} />
              </div>
            </div>
            <div className="rounded-micro bg-[#FAF9F5] ring-1 ring-(--admin-ring)/50 p-3 max-h-96 overflow-y-auto">
              <div className="mx-auto w-full" style={{ maxWidth: VP_WIDTH[vp] }}>
                {renderPreview(lang)}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Aperçus en direct — reproductions fidèles du rendu du site
 * ------------------------------------------------------------------ */
function AvatarMini({ src, name }: { src: string; name: string }) {
  const [err, setErr] = useState(false);
  return (
    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden shrink-0 ring-1 ring-secondary/30">
      {src && !err ? (
        <img src={src} alt={name} className="w-full h-full object-cover" onError={() => setErr(true)} />
      ) : (
        <span className="font-serif text-caption font-bold text-primary">{name.charAt(0) || '·'}</span>
      )}
    </div>
  );
}

function PreviewVideo({ v, lang }: { v: VideoContent; lang: 'FR' | 'EN' }) {
  return (
    <div className="rounded-inner bg-[#0B0B0C] ring-1 ring-[#FED65B]/25 p-1.5 shadow-[0_20px_50px_-30px_rgba(0,0,0,0.9)]">
      <div className="relative aspect-video rounded-micro bg-gradient-to-br from-[#1c1c1e] to-[#101012] flex items-center justify-center overflow-hidden">
        <Play className="w-8 h-8 text-[#FED65B]" strokeWidth={1} />
        <span className="absolute top-2 left-2 rounded-full px-2 py-0.5 text-micro uppercase tracking-[0.2em] font-medium bg-white/5 text-[#FED65B] ring-1 ring-[#FED65B]/35">
          {v.badgeLeft[lang] || 'VIDÉO'}
        </span>
        <span className="absolute bottom-2 right-2 text-micro font-mono text-white/60 truncate max-w-[70%]">
          {v.src || 'Aucun fichier'}
        </span>
      </div>
      <div className="px-2 pt-2 pb-1 space-y-1">
        <p className="font-serif text-caption font-bold text-white leading-snug">{v.title[lang] || 'Titre de la vidéo'}</p>
        <p className="text-micro text-white/70 font-light leading-relaxed line-clamp-2">
          {v.desc[lang] || 'Description…'}
        </p>
      </div>
    </div>
  );
}

function PreviewTier({ t }: { t: PaymentTier }) {
  return (
    <div className="rounded-inner bg-gradient-to-br from-[#00261a] to-[#003826] p-3">
      <table className="w-full text-left text-caption font-mono text-white/90">
        <thead>
          <tr className="border-b border-white/15 text-micro uppercase text-secondary-fixed">
            <th className="pb-1 pr-2">Acompte</th>
            <th className="pb-1 pr-2">Reste</th>
            <th className="pb-1 pr-2">Mensualité</th>
            <th className="pb-1">Durée</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          <tr className="bg-white/10 font-bold text-secondary-fixed">
            <td className="py-1 pr-2">{t.deposit.toLocaleString('fr-FR')} €</td>
            <td className="py-1 pr-2">{t.remaining.toLocaleString('fr-FR')} €</td>
            <td className="py-1 pr-2">{t.monthly} €</td>
            <td className="py-1">{t.duration} mois</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function PreviewConnectivity({ c, lang }: { c: ConnectivityItem; lang: 'FR' | 'EN' }) {
  return (
    <div className="bg-white p-3 rounded-inner shadow-elev-1 border border-gray-300 border-l-4 border-l-secondary">
      <div className="flex justify-between items-center gap-2 mb-1.5">
        <span className="font-serif font-bold text-caption text-primary truncate">{c.title[lang] || 'Titre'}</span>
        <span className="font-mono font-bold text-micro text-secondary bg-secondary/10 px-1.5 py-0.5 rounded-micro shrink-0">
          {c.time}
        </span>
      </div>
      <p className="text-micro text-on-surface-variant font-light leading-relaxed line-clamp-2">
        {c.description[lang] || 'Description…'}
      </p>
    </div>
  );
}

function PreviewPack({ p, lang }: { p: ComplementaryPack; lang: 'FR' | 'EN' }) {
  const features = p.features[lang] ?? [];
  return (
    <div
      className={`bg-white rounded-inner p-3 border transition-all ${
        p.badge?.[lang] ? 'border-2 border-secondary ring-1 ring-secondary/30' : 'border-gray-300'
      }`}
    >
      <div className="flex justify-between items-start gap-2">
        <span className="font-serif font-bold text-caption text-primary leading-snug">
          {p.title[lang] || 'Titre du pack'}
        </span>
        {p.badge?.[lang] && (
          <span className="text-micro font-mono font-bold bg-secondary/15 text-secondary px-1.5 py-0.5 rounded-full shrink-0">
            {p.badge[lang]}
          </span>
        )}
      </div>
      <p className="font-mono text-micro text-secondary font-semibold mt-0.5">{p.subtitle[lang]}</p>
      <p className="text-micro text-on-surface-variant font-light leading-relaxed mt-1 line-clamp-2">
        {p.description[lang] || 'Description…'}
      </p>
      <ul className="mt-2 pt-2 border-t border-gray-200 space-y-1">
        {features.slice(0, 3).map((f, i) => (
          <li key={i} className="flex items-start gap-1.5 text-micro leading-snug text-on-surface">
            <Check className="w-2.5 h-2.5 text-secondary shrink-0 mt-0.5" strokeWidth={2.5} />
            <span>{f}</span>
          </li>
        ))}
        {features.length > 3 && (
          <li className="text-micro text-outline font-mono">+ {features.length - 3} autres inclus…</li>
        )}
      </ul>
    </div>
  );
}

function PreviewService({ s, lang }: { s: ServiceItem; lang: 'FR' | 'EN' }) {
  return (
    <div className="bg-white p-3 rounded-inner border border-gray-300 shadow-elev-1 space-y-2">
      <span className="w-8 h-8 rounded-micro bg-primary/5 ring-1 ring-secondary/30 flex items-center justify-center">
        <SectionIcon name={s.icon} className="w-4 h-4 text-secondary" />
      </span>
      <p className="font-serif font-bold text-caption text-primary leading-snug">
        {s.title[lang] || 'Titre du service'}
      </p>
      <p className="text-micro text-on-surface-variant font-light leading-relaxed line-clamp-3">
        {s.description[lang] || 'Description…'}
      </p>
    </div>
  );
}

function PreviewTestimonial({ t, lang }: { t: Testimonial; lang: 'FR' | 'EN' }) {
  return (
    <div className="bg-white p-3.5 rounded-inner border border-gray-300 shadow-elev-1 flex flex-col justify-between space-y-3">
      <div className="space-y-2">
        <div className="flex gap-0.5">
          {[...Array(t.rating ?? 5)].map((_, i) => (
            <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
          ))}
        </div>
        <blockquote className="text-micro italic leading-relaxed text-primary/90 font-light line-clamp-3">
          « {t.quote[lang] || 'Citation…'} »
        </blockquote>
      </div>
      <div className="pt-2.5 mt-1 border-t border-gray-200 flex items-center gap-2">
        <AvatarMini src={t.avatar} name={t.name} />
        <div className="min-w-0">
          <p className="font-serif font-bold text-micro text-primary truncate">{t.name || 'Nom'}</p>
          <p className="text-micro text-secondary font-medium truncate">{t.role[lang]}</p>
          <p className="text-micro text-outline font-mono truncate">{t.relationship[lang]}</p>
        </div>
      </div>
    </div>
  );
}

function PreviewFaq({ f, lang }: { f: FAQItem; lang: 'FR' | 'EN' }) {
  return (
    <div className="bg-white border border-gray-300 rounded-inner p-3 shadow-elev-1">
      <div className="flex justify-between items-start gap-2">
        <p className="font-serif text-caption font-bold text-primary leading-snug">{f.question[lang] || 'Question…'}</p>
        <span className="shrink-0 p-0.5 rounded-full bg-surface-container-low text-secondary">
          <Plus className="w-3 h-3" />
        </span>
      </div>
      <p className="pt-2 mt-2 text-micro text-on-surface-variant leading-relaxed border-t border-gray-200 line-clamp-3 text-justify">
        {f.answer[lang] || 'Réponse…'}
      </p>
    </div>
  );
}

function PreviewBlog({ b, lang }: { b: BlogArticle; lang: 'FR' | 'EN' }) {
  const [imgErr, setImgErr] = useState(false);
  return (
    <div className="bg-white border border-gray-300 rounded-inner overflow-hidden shadow-elev-1 flex flex-col">
      <div className="h-16 relative bg-gradient-to-br from-[#0f3d2e] to-[#00261a] flex items-center justify-center overflow-hidden">
        {b.image && !imgErr ? (
          <img src={b.image} alt={b.title[lang]} className="w-full h-full object-cover" onError={() => setImgErr(true)} />
        ) : (
          <span className="font-serif text-micro text-white/70 italic">{b.category[lang] || 'Catégorie'}</span>
        )}
        <span className="absolute top-1.5 left-1.5 bg-primary text-white text-micro font-mono uppercase font-bold px-1.5 py-0.5 rounded-micro">
          {b.category[lang] || 'Article'}
        </span>
      </div>
      <div className="p-2.5 space-y-1 flex-1 flex flex-col justify-between">
        <div className="space-y-1">
          <span className="text-micro font-mono text-outline">
            {b.date} • {b.readTime}
          </span>
          <p className="font-serif text-caption font-bold text-primary leading-snug line-clamp-2">
            {b.title[lang] || 'Titre de l’article'}
          </p>
          <p className="text-micro text-on-surface-variant font-light line-clamp-2 leading-relaxed">
            {b.summary[lang] || 'Résumé…'}
          </p>
        </div>
        <p className="pt-1.5 mt-1 border-t border-outline-variant/20 flex items-center justify-between text-micro font-bold text-secondary">
          <span>Lire le guide</span>
          <Plus className="w-3 h-3" />
        </p>
      </div>
    </div>
  );
}

function PreviewIdentity({ settings }: { settings: SiteSettings }) {
  return (
    <div className="space-y-1.5">
      {/* Navbar miniature */}
      <div className="flex items-center justify-between bg-white border border-gray-300 rounded-micro px-2.5 py-1.5 shadow-elev-1">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="w-4 h-4 shrink-0 rounded-full bg-primary text-white flex items-center justify-center font-serif text-micro font-bold">
            S
          </span>
          <span className="font-serif text-caption font-bold text-primary truncate">
            {settings.companyName || 'Nom de l’entreprise'}
          </span>
        </div>
        <span className="font-mono text-micro text-outline truncate ml-2">{settings.projectName || ''}</span>
      </div>
      {/* Bandeau promo miniature */}
      <div
        className={`rounded-micro px-2.5 py-2 border transition-all ${
          settings.promoActive
            ? 'bg-secondary-container/20 border-secondary/40'
            : 'bg-gray-100 border-gray-300 opacity-60'
        }`}
      >
        <p className="text-micro font-mono font-bold uppercase tracking-wider text-secondary">
          ⭐ {settings.promoTitle || 'Promotion de lancement'}{' '}
          {settings.promoActive ? '' : '— désactivée'}
        </p>
        <p className="text-micro text-on-surface-variant line-clamp-1">{settings.promoDesc}</p>
        <p className="text-micro font-mono text-outline mt-0.5">
          {settings.promoPlotsRemaining} places restantes
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Bandeau d'actions de section : réordonner tout / ajouter un élément
 * ------------------------------------------------------------------ */
function ActionsBar({
  count,
  onAdd,
  addLabel,
  onMoveAllUp,
  onMoveAllDown,
}: {
  count: number;
  onAdd: () => void;
  addLabel: string;
  onMoveAllUp: () => void;
  onMoveAllDown: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 flex-wrap">
      {count === 0 ? (
        <p className="font-mono text-caption uppercase tracking-[0.2em] text-(--admin-muted) italic">
          Aucun élément — ajoutez-en un ci-contre
        </p>
      ) : (
        <p className="font-mono text-caption uppercase tracking-[0.2em] text-(--admin-muted)">
          {count} élément{count > 1 ? 's' : ''} — réordonnez avec ↑ ↓ dans chaque carte
        </p>
      )}
      <div className="flex items-center gap-1.5">
        <IconBtn label="Tout monter d'un cran" onClick={onMoveAllUp} disabled={count === 0}>
          <ArrowUp className="w-3.5 h-3.5" strokeWidth={1.5} />
        </IconBtn>
        <IconBtn label="Tout descendre d'un cran" onClick={onMoveAllDown} disabled={count === 0}>
          <ArrowDown className="w-3.5 h-3.5" strokeWidth={1.5} />
        </IconBtn>
        <button
          type="button"
          onClick={onAdd}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-caption font-mono uppercase tracking-widest font-bold bg-(--admin-accent) text-(--admin-accent-text) shadow-[0_6px_20px_rgba(254,214,91,0.2)] hover:shadow-[0_6px_28px_rgba(254,214,91,0.3)] active:scale-[0.97] transition-all duration-400 ease-spring cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" strokeWidth={2} />
          {addLabel}
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Indicateur de dernière synchronisation cloud
 * ------------------------------------------------------------------ */
function SyncStamp({ lastSyncedAt }: { lastSyncedAt: number | null }) {
  const [, force] = useState(0);
  useEffect(() => {
    const t = setInterval(() => force((n) => n + 1), 30000);
    return () => clearInterval(t);
  }, []);
  const label = !lastSyncedAt
    ? 'Aucune synchronisation encore effectuée'
    : `Dernière synchro cloud : ${new Date(lastSyncedAt).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })}`;
  return (
    <span
      title={label}
      className="inline-flex items-center gap-1.5 font-mono text-micro uppercase tracking-[0.18em] text-(--admin-muted-2)"
    >
      <Clock3 className="w-3 h-3 shrink-0" strokeWidth={1.5} />
      {label}
    </span>
  );
}

/* ------------------------------------------------------------------ *
 * Onglet Contenu du site
 * ------------------------------------------------------------------ */
export default function AdminContentTab({
  settings,
  onChange,
  savedContent,
  lastSyncedAt,
  isSyncing,
}: {
  settings: SiteSettings;
  onChange: (patch: Partial<SiteSettings>) => void;
  /** Dernier état persisté (cloud ou défaut) — sert de référence « propre ». */
  savedContent?: SiteContent | null;
  /** Horodatage (ms) de la dernière persistance réussie. */
  lastSyncedAt?: number | null;
  /** Vrai pendant l'écriture cloud (0 → 900 ms après la dernière frappe). */
  isSyncing?: boolean;
}) {
  // Contenu effectif = défauts + surcharges du cloud (section par section)
  const content: SiteContent = { ...DEFAULT_SITE_CONTENT, ...(settings.content ?? {}) };

  const setContent = (next: SiteContent) => onChange({ content: next });

  // Mise à jour d'un champ scalaire dans un item d'un tableau du content
  const setField = (key: keyof SiteContent, idx: number, field: string, value: string | number) => {
    const arr = (content[key] as unknown as Record<string, unknown>[]) ?? [];
    const next = arr.map((it, i) => (i === idx ? { ...it, [field]: value } : it));
    setContent({ ...content, [key]: next });
  };

  // Mise à jour d'un sous-champ FR/EN ({ FR, EN })
  const setLang = (key: keyof SiteContent, idx: number, field: string, lang: 'FR' | 'EN', value: string) => {
    const arr = (content[key] as unknown as Record<string, unknown>[]) ?? [];
    const next = arr.map((it, i) => {
      if (i !== idx) return it;
      const sub = (it[field] as { FR: string; EN: string }) ?? { FR: '', EN: '' };
      return { ...it, [field]: { ...sub, [lang]: value } };
    });
    setContent({ ...content, [key]: next });
  };

  // Mise à jour d'un tableau de chaînes FR/EN (ex. features) — une ligne par entrée
  const setLines = (key: keyof SiteContent, idx: number, field: string, lang: 'FR' | 'EN', value: string) => {
    const arr = (content[key] as unknown as Record<string, unknown>[]) ?? [];
    const next = arr.map((it, i) => {
      if (i !== idx) return it;
      const sub = (it[field] as { FR: string[]; EN: string[] }) ?? { FR: [], EN: [] };
      return { ...it, [field]: { ...sub, [lang]: value.split('\n').map((s) => s.trim()).filter(Boolean) } };
    });
    setContent({ ...content, [key]: next });
  };

  // --- Opérations génériques sur les collections ---------------------------

  // Annulation (Undo) : instantané de la collection avant suppression ou
  // duplication. Le toast est actif 5 s ; « Annuler » restaure l'état d'avant
  // l'opération (l'auto-save se charge ensuite de persister la restauration).
  const [undo, setUndo] = useState<{ key: ItemKey; action: 'deleted' | 'duplicated'; snapshot: unknown[]; id: number } | null>(null);
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const armUndo = (key: ItemKey, action: 'deleted' | 'duplicated', arrBefore: unknown[]) => {
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    setUndo({ key, action, snapshot: structuredClone(arrBefore), id: Date.now() });
    undoTimerRef.current = setTimeout(() => setUndo(null), 5000);
  };

  useEffect(() => {
    return () => {
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    };
  }, []);

  const performUndo = () => {
    if (!undo) return;
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    setContent({ ...content, [undo.key]: undo.snapshot });
    setUndo(null);
  };

  const addItem = (key: ItemKey, factory: () => Record<string, unknown>) =>
    setContent({ ...content, [key]: [...(content[key] as unknown[]), factory()] });

  const duplicateItem = (key: ItemKey, idx: number) => {
    const arr = [...(content[key] as unknown[])] as Record<string, unknown>[];
    const src = arr[idx];
    if (!src) return;
    const arrBefore = [...arr];
    const clone: Record<string, unknown> = { ...structuredClone(src) };
    // Nouvel identifiant unique pour éviter les doublons de clé côté site
    if (typeof clone.id === 'string') {
      const base = `${clone.id}`.replace(/-copy(-\d+)?$/, '');
      const existing = new Set(arr.map((it) => String((it as Record<string, unknown>).id ?? '')));
      let n = 2;
      let candidate = `${base}-copy`;
      while (existing.has(candidate)) candidate = `${base}-copy-${n++}`;
      clone.id = candidate;
    } else if (typeof clone.id === 'number') {
      const maxId = arr.reduce((m, it) => Math.max(m, Number((it as Record<string, unknown>).id ?? 0)), 0);
      clone.id = maxId + 1;
    }
    arr.splice(idx + 1, 0, clone);
    setContent({ ...content, [key]: arr });
    armUndo(key, 'duplicated', arrBefore);
  };

  const removeItem = (key: ItemKey, idx: number) => {
    const arrBefore = [...(content[key] as unknown[])];
    if (!arrBefore[idx]) return;
    setContent({ ...content, [key]: arrBefore.filter((_, i) => i !== idx) });
    armUndo(key, 'deleted', arrBefore);
  };

  const moveItem = (key: ItemKey, idx: number, dir: -1 | 1) => {
    const arr = [...(content[key] as unknown[])];
    const target = idx + dir;
    if (target < 0 || target >= arr.length) return;
    [arr[idx], arr[target]] = [arr[target], arr[idx]];
    setContent({ ...content, [key]: arr });
  };

  const moveAll = (key: ItemKey, dir: -1 | 1) => {
    const arr = [...(content[key] as unknown[])];
    if (arr.length < 2) return;
    if (dir === -1) arr.unshift(arr.pop() as unknown);
    else arr.push(arr.shift() as unknown);
    setContent({ ...content, [key]: arr });
  };

  // Réordonner une carte : seulement si l'item a un voisin dans la bonne direction
  const reorderProps = (key: ItemKey, idx: number, len: number) => ({
    onMoveUp: idx > 0 ? () => moveItem(key, idx, -1) : undefined,
    onMoveDown: idx < len - 1 ? () => moveItem(key, idx, 1) : undefined,
    onDuplicate: () => duplicateItem(key, idx),
    onDelete: () => removeItem(key, idx),
  });

  // --- État « Non sauvegardé » (référence = dernier état persisté) ----------
  const saved = savedContent ?? DEFAULT_SITE_CONTENT;
  const dirty = (key: ItemKey, idx: number) => {
    const cur = (content[key] as unknown[])[idx];
    const ref = (saved[key] as unknown[] | undefined)?.[idx];
    return JSON.stringify(cur ?? null) !== JSON.stringify(ref ?? null);
  };
  const sectionDirty = (key: ItemKey) => {
    const cur = content[key] as unknown[];
    const ref = saved[key] as unknown[] | undefined;
    return JSON.stringify(cur ?? null) !== JSON.stringify(ref ?? null);
  };

  const videos: VideoContent[] = content.videos;
  const tiers: PaymentTier[] = content.paymentTiers;
  const connectivity: ConnectivityItem[] = content.connectivity;
  const packs: ComplementaryPack[] = content.packs;
  const services: ServiceItem[] = content.services;
  const testimonials: Testimonial[] = content.testimonials;
  const faq: FAQItem[] = content.faq;
  const blog: BlogArticle[] = content.blogArticles;

  return (
    <div className="space-y-6">
      {/* Indicateur de synchronisation (horodatage + état global) */}
      <div className="flex items-center justify-between gap-3 flex-wrap px-1">
        <SyncStamp lastSyncedAt={lastSyncedAt ?? null} />
        {isSyncing && (
          <span className="inline-flex items-center gap-1.5 font-mono text-micro uppercase tracking-[0.18em] text-(--admin-sky)">
            <Loader2 className="w-3 h-3 animate-spin shrink-0" strokeWidth={1.5} />
            Synchronisation cloud…
          </span>
        )}
      </div>

      {/* Identité & offre — aperçu permanent en colonne */}
      <Section
        icon={<Building2 className="w-4 h-4" strokeWidth={1.5} />}
        title="Identité & offre"
        sub="Nom affiché sur le site, projet, places promo restantes"
        defaultOpen
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
          <div className="space-y-4">
            <FormGroup icon={<Building2 className="w-3.5 h-3.5" strokeWidth={1.5} />} label="Identité">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field
                  label="Nom de l'entreprise"
                  value={settings.companyName}
                  onChange={(v) => onChange({ companyName: v })}
                  max={60}
                  required
                />
                <Field
                  label="Nom du projet"
                  value={settings.projectName ?? ''}
                  onChange={(v) => onChange({ projectName: v })}
                  max={80}
                  hint="Sous-titre affiché près du logo"
                />
              </div>
            </FormGroup>
            <FormGroup icon={<Tag className="w-3.5 h-3.5" strokeWidth={1.5} />} label="Offre de lancement">
              <Field
                label="Places promo restantes"
                type="number"
                value={settings.promoPlotsRemaining}
                onChange={(v) => onChange({ promoPlotsRemaining: Number(v) || 0 })}
                max={3}
                hint="Compteur « sur 10 parcelles en promotion »"
              />
            </FormGroup>
            <FormGroup icon={<FileText className="w-3.5 h-3.5" strokeWidth={1.5} />} label="Plaquette officielle (PDF)">
              <div className="min-w-0 space-y-2">
                <Field
                  label="URL du PDF"
                  value={settings.brochureUrl ?? ''}
                  onChange={(v) => onChange({ brochureUrl: v })}
                  placeholder="/pdf/Dun-Tni-Brochure-Premium.pdf"
                  max={240}
                  pathCheck
                  hint="PDF affiché dans la modale Plaquette (footer, héro)"
                />
                <MediaUpload
                  folder="pdf"
                  label="Plaquette"
                  currentUrl={settings.brochureUrl}
                  onUrl={(url) => onChange({ brochureUrl: url })}
                />
              </div>
            </FormGroup>
          </div>
          <div className="space-y-2">
            <span className="font-mono text-micro uppercase tracking-[0.2em] text-(--admin-muted)">
              Aperçu en direct
            </span>
            <div className="rounded-inner bg-(--admin-shell-soft) ring-1 ring-(--admin-ring-soft) p-3">
              <div className="rounded-micro bg-[#FAF9F5] ring-1 ring-(--admin-ring)/50 p-3">
                <PreviewIdentity settings={settings} />
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Images du site — hero + vue aérienne (téléversées vers le bucket) */}
      <Section
        icon={<Images className="w-4 h-4" strokeWidth={1.5} />}
        title="Images du site"
        sub="Bannière principale (hero) et vue aérienne de la section Vision"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
          <FormGroup icon={<Image className="w-3.5 h-3.5" strokeWidth={1.5} />} label="Bannière principale (hero)">
            <div className="min-w-0 space-y-2">
              <Field
                label="URL de l'image hero"
                value={settings.heroImage ?? ''}
                onChange={(v) => onChange({ heroImage: v })}
                max={240}
                pathCheck
                hint="Fond du premier écran de la page d'accueil"
              />
              <MediaUpload
                folder="images"
                label="Image hero"
                currentUrl={settings.heroImage}
                onUrl={(url) => onChange({ heroImage: url })}
              />
            </div>
          </FormGroup>
          <FormGroup icon={<MapPin className="w-3.5 h-3.5" strokeWidth={1.5} />} label="Vue aérienne (section Vision)">
            <div className="min-w-0 space-y-2">
              <Field
                label="URL de la vue aérienne"
                value={settings.aerialImage ?? ''}
                onChange={(v) => onChange({ aerialImage: v })}
                max={240}
                pathCheck
                hint="Orthophoto drone des 54 parcelles"
              />
              <MediaUpload
                folder="images"
                label="Vue aérienne"
                currentUrl={settings.aerialImage}
                onUrl={(url) => onChange({ aerialImage: url })}
              />
            </div>
          </FormGroup>
        </div>
      </Section>

      {/* Vidéos */}
      <Section
        icon={<Video className="w-4 h-4" strokeWidth={1.5} />}
        title={`Vidéos (${videos.length})`}
        sub="URLs mp4, posters, badges et textes FR/EN"
      >
        <ActionsBar
          count={videos.length}
          addLabel="Ajouter une vidéo"
          onAdd={() =>
            addItem('videos', () => ({
              src: '',
              poster: '',
              badgeLeft: { FR: 'SÉBIKHOTANE', EN: 'SÉBIKHOTANE' },
              title: { FR: 'Nouvelle vidéo', EN: 'New video' },
              desc: { FR: '', EN: '' },
            }))
          }
          onMoveAllUp={() => moveAll('videos', -1)}
          onMoveAllDown={() => moveAll('videos', 1)}
        />
        {videos.map((v, i) => (
          <ItemCard
            key={i}
            title={`Vidéo ${i + 1}`}
            dirty={dirty('videos', i)}
            {...reorderProps('videos', i, videos.length)}
            renderPreview={(lang) => <PreviewVideo v={v} lang={lang} />}
          >
            <FormGroup icon={<FolderOpen className="w-3.5 h-3.5" strokeWidth={1.5} />} label="Source média">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="min-w-0 space-y-2">
                  <Field
                    label="Fichier vidéo (chemin /videos/…)"
                    value={v.src}
                    onChange={(val) => setField('videos', i, 'src', val)}
                    placeholder="/videos/video_1.mp4"
                    max={240}
                    pathCheck
                    hint="Chemin public dans /public, URL http(s) ou stockage cloud"
                  />
                  <MediaUpload
                    folder="videos"
                    currentUrl={v.src}
                    onUrl={(url) => setField('videos', i, 'src', url)}
                  />
                </div>
                <div className="min-w-0 space-y-2">
                  <Field
                    label="Image poster (chemin /images/…)"
                    value={v.poster}
                    onChange={(val) => setField('videos', i, 'poster', val)}
                    placeholder="/images/video_1_poster.jpg"
                    max={240}
                    pathCheck
                    hint="Affiche avant la lecture"
                  />
                  <MediaUpload
                    folder="images"
                    label="Poster"
                    currentUrl={v.poster}
                    onUrl={(url) => setField('videos', i, 'poster', url)}
                  />
                </div>
              </div>
            </FormGroup>
            <FormGroup icon={<Type className="w-3.5 h-3.5" strokeWidth={1.5} />} label="Textes FR / EN">
              <LangPair
                label="Badge sur la vidéo"
                fr={v.badgeLeft.FR}
                en={v.badgeLeft.EN}
                onFR={(val) => setLang('videos', i, 'badgeLeft', 'FR', val)}
                onEN={(val) => setLang('videos', i, 'badgeLeft', 'EN', val)}
                max={40}
                hint="ex. SÉBIKHOTANE • VUE DRONE"
              />
              <LangPair
                label="Titre de la carte"
                fr={v.title.FR}
                en={v.title.EN}
                onFR={(val) => setLang('videos', i, 'title', 'FR', val)}
                onEN={(val) => setLang('videos', i, 'title', 'EN', val)}
                max={90}
              />
              <LangPair
                label="Description"
                fr={v.desc.FR}
                en={v.desc.EN}
                textarea
                onFR={(val) => setLang('videos', i, 'desc', 'FR', val)}
                onEN={(val) => setLang('videos', i, 'desc', 'EN', val)}
                max={240}
              />
            </FormGroup>
          </ItemCard>
        ))}
      </Section>

      {/* Échéancier */}
      <Section
        icon={<Table2 className="w-4 h-4" strokeWidth={1.5} />}
        title={`Grille d'échéancier (${tiers.length} paliers)`}
        sub="Acompte, reste à régler, mensualité, durée"
      >
        <ActionsBar
          count={tiers.length}
          addLabel="Ajouter un palier"
          onAdd={() => addItem('paymentTiers', () => ({ deposit: 0, remaining: 0, monthly: 0, duration: 12 }))}
          onMoveAllUp={() => moveAll('paymentTiers', -1)}
          onMoveAllDown={() => moveAll('paymentTiers', 1)}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {tiers.map((t, i) => (
            <ItemCard
              key={i}
              title={`Palier ${i + 1} — apport ${t.deposit.toLocaleString('fr-FR')} €`}
              dirty={dirty('paymentTiers', i)}
              {...reorderProps('paymentTiers', i, tiers.length)}
              renderPreview={() => <PreviewTier t={t} />}
            >
              <FormGroup icon={<Hash className="w-3.5 h-3.5" strokeWidth={1.5} />} label="Montants">
                <div className="grid grid-cols-2 md:grid-cols-2 gap-3">
                  <Field
                    label="Acompte (€)"
                    type="number"
                    value={t.deposit}
                    onChange={(val) => setField('paymentTiers', i, 'deposit', Number(val) || 0)}
                    max={7}
                  />
                  <Field
                    label="Reste à régler (€)"
                    type="number"
                    value={t.remaining}
                    onChange={(val) => setField('paymentTiers', i, 'remaining', Number(val) || 0)}
                    max={7}
                  />
                  <Field
                    label="Mensualité (€)"
                    type="number"
                    value={t.monthly}
                    onChange={(val) => setField('paymentTiers', i, 'monthly', Number(val) || 0)}
                    max={6}
                  />
                  <Field
                    label="Durée (mois)"
                    type="number"
                    value={t.duration}
                    onChange={(val) => setField('paymentTiers', i, 'duration', Number(val) || 0)}
                    max={3}
                  />
                </div>
                {/* Reste, durée et dernier versement sont dérivés à l'affichage
                    (cf. src/lib/payment.ts) : les saisir ici n'a aucun effet, et
                    c'est volontaire — sinon la grille peut annoncer un produit
                    mensualité × durée qui dépasse le reste à régler. */}
                <p className="text-caption text-(--admin-muted-2) mt-2 leading-relaxed">
                  Seuls l'acompte et la mensualité sont utilisés : le reste, la durée et le
                  dernier versement sont recalculés à l'affichage depuis le prix de référence.
                </p>
              </FormGroup>
            </ItemCard>
          ))}
        </div>
      </Section>

      {/* Connectivité */}
      <Section
        icon={<MapPin className="w-4 h-4" strokeWidth={1.5} />}
        title={`Connectivité (${connectivity.length})`}
        sub="AIBD, TER, Diamniadio, Ndayane — temps, titres et descriptions FR/EN"
      >
        <ActionsBar
          count={connectivity.length}
          addLabel="Ajouter un lieu"
          onAdd={() =>
            addItem('connectivity', () => ({
              id: `place-${Date.now()}`,
              icon: 'MapPin',
              time: '',
              timeEn: '',
              title: { FR: '', EN: '' },
              description: { FR: '', EN: '' },
            }))
          }
          onMoveAllUp={() => moveAll('connectivity', -1)}
          onMoveAllDown={() => moveAll('connectivity', 1)}
        />
        {connectivity.map((c, i) => (
          <ItemCard
            key={i}
            title={`Lieu ${i + 1}`}
            dirty={dirty('connectivity', i)}
            {...reorderProps('connectivity', i, connectivity.length)}
            renderPreview={(lang) => <PreviewConnectivity c={c} lang={lang} />}
          >
            <FormGroup icon={<MapPin className="w-3.5 h-3.5" strokeWidth={1.5} />} label="Donnée">
              <Field
                label="Temps / distance"
                value={c.time}
                onChange={(val) => setField('connectivity', i, 'time', val)}
                placeholder="< 20 MIN"
                max={24}
                hint="Affiché dans le badge doré de la carte"
              />
              <Field
                label="Temps / distance — anglais"
                value={c.timeEn || ''}
                onChange={(val) => setField('connectivity', i, 'timeEn', val)}
                placeholder="IMMEDIATE"
                max={24}
                hint="Optionnel — utile seulement si le texte français n'est pas neutre (« IMMÉDIAT »)"
              />
            </FormGroup>
            <FormGroup icon={<Type className="w-3.5 h-3.5" strokeWidth={1.5} />} label="Textes FR / EN">
              <LangPair
                label="Titre"
                fr={c.title.FR}
                en={c.title.EN}
                onFR={(val) => setLang('connectivity', i, 'title', 'FR', val)}
                onEN={(val) => setLang('connectivity', i, 'title', 'EN', val)}
                max={60}
              />
              <LangPair
                label="Description"
                fr={c.description.FR}
                en={c.description.EN}
                textarea
                onFR={(val) => setLang('connectivity', i, 'description', 'FR', val)}
                onEN={(val) => setLang('connectivity', i, 'description', 'EN', val)}
                max={180}
              />
            </FormGroup>
          </ItemCard>
        ))}
      </Section>

      {/* Packs */}
      <Section
        icon={<Package className="w-4 h-4" strokeWidth={1.5} />}
        title={`Packs (${packs.length})`}
        sub="Titres, sous-titres, descriptions, badges et features FR/EN"
      >
        <ActionsBar
          count={packs.length}
          addLabel="Ajouter un pack"
          onAdd={() =>
            addItem('packs', () => ({
              id: `pack-${Date.now()}`,
              title: { FR: 'Nouveau pack', EN: 'New pack' },
              subtitle: { FR: '', EN: '' },
              description: { FR: '', EN: '' },
              icon: 'Home',
              badge: { FR: '', EN: '' },
              features: { FR: [], EN: [] },
            }))
          }
          onMoveAllUp={() => moveAll('packs', -1)}
          onMoveAllDown={() => moveAll('packs', 1)}
        />
        {packs.map((p, i) => (
          <ItemCard
            key={i}
            title={`Pack ${i + 1} — ${p.title.FR}`}
            dirty={dirty('packs', i)}
            {...reorderProps('packs', i, packs.length)}
            renderPreview={(lang) => <PreviewPack p={p} lang={lang} />}
          >
            <FormGroup icon={<Type className="w-3.5 h-3.5" strokeWidth={1.5} />} label="Textes FR / EN">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <LangPair
                  label="Titre"
                  fr={p.title.FR}
                  en={p.title.EN}
                  onFR={(val) => setLang('packs', i, 'title', 'FR', val)}
                  onEN={(val) => setLang('packs', i, 'title', 'EN', val)}
                  max={80}
                />
                <LangPair
                  label="Sous-titre"
                  fr={p.subtitle.FR}
                  en={p.subtitle.EN}
                  onFR={(val) => setLang('packs', i, 'subtitle', 'FR', val)}
                  onEN={(val) => setLang('packs', i, 'subtitle', 'EN', val)}
                  max={120}
                />
              </div>
              <LangPair
                label="Description"
                fr={p.description.FR}
                en={p.description.EN}
                textarea
                onFR={(val) => setLang('packs', i, 'description', 'FR', val)}
                onEN={(val) => setLang('packs', i, 'description', 'EN', val)}
                max={260}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field
                  label="Badge FR (optionnel, ex. « Recommandé »)"
                  value={p.badge?.FR ?? ''}
                  onChange={(val) => setLang('packs', i, 'badge', 'FR', val)}
                  max={40}
                />
                <Field
                  label="Badge EN"
                  value={p.badge?.EN ?? ''}
                  onChange={(val) => setLang('packs', i, 'badge', 'EN', val)}
                  max={40}
                />
              </div>
            </FormGroup>
            <FormGroup icon={<ListChecks className="w-3.5 h-3.5" strokeWidth={1.5} />} label="Inclus — une ligne par élément">
              <LangPair
                label="Features"
                fr={(p.features.FR ?? []).join('\n')}
                en={(p.features.EN ?? []).join('\n')}
                textarea
                rows={4}
                onFR={(val) => setLines('packs', i, 'features', 'FR', val)}
                onEN={(val) => setLines('packs', i, 'features', 'EN', val)}
                max={300}
                hint="Chaque ligne devient une puce ✓ sur la carte du pack"
              />
            </FormGroup>
          </ItemCard>
        ))}
      </Section>

      {/* Services */}
      <Section
        icon={<Briefcase className="w-4 h-4" strokeWidth={1.5} />}
        title={`Services (${services.length})`}
        sub="Les métiers affichés par la section « Nos différents services »"
      >
        <ActionsBar
          count={services.length}
          addLabel="Ajouter un service"
          onAdd={() =>
            addItem('services', () => ({
              id: `service-${Date.now()}`,
              icon: 'House',
              title: { FR: '', EN: '' },
              description: { FR: '', EN: '' },
            }))
          }
          onMoveAllUp={() => moveAll('services', -1)}
          onMoveAllDown={() => moveAll('services', 1)}
        />
        {services.map((s, i) => (
          <ItemCard
            key={s.id ?? i}
            title={`Service ${i + 1} — ${s.title.FR}`}
            dirty={dirty('services', i)}
            {...reorderProps('services', i, services.length)}
            renderPreview={(lang) => <PreviewService s={s} lang={lang} />}
          >
            <FormGroup icon={<Sparkles className="w-3.5 h-3.5" strokeWidth={1.5} />} label="Icône">
              <div className="min-w-0">
                <label className={labelCls} htmlFor={`service-icon-${i}`}>
                  Icône de la carte
                </label>
                <select
                  id={`service-icon-${i}`}
                  value={s.icon}
                  onChange={(e) => setField('services', i, 'icon', e.target.value)}
                  className={`${inputCls} mt-1.5 cursor-pointer`}
                >
                  {Object.keys(SECTION_ICONS).map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-micro text-(--admin-muted-2) font-mono">
                  Nom d’icône du registre partagé (section, éditeur, Espace Gérant)
                </p>
              </div>
            </FormGroup>
            <FormGroup icon={<Type className="w-3.5 h-3.5" strokeWidth={1.5} />} label="Textes FR / EN">
              <LangPair
                label="Titre"
                fr={s.title.FR}
                en={s.title.EN}
                onFR={(val) => setLang('services', i, 'title', 'FR', val)}
                onEN={(val) => setLang('services', i, 'title', 'EN', val)}
                max={60}
              />
              <LangPair
                label="Description"
                fr={s.description.FR}
                en={s.description.EN}
                textarea
                rows={3}
                onFR={(val) => setLang('services', i, 'description', 'FR', val)}
                onEN={(val) => setLang('services', i, 'description', 'EN', val)}
                max={260}
              />
            </FormGroup>
          </ItemCard>
        ))}
      </Section>

      {/* Témoignages */}
      <Section
        icon={<MessageSquareQuote className="w-4 h-4" strokeWidth={1.5} />}
        title={`Témoignages (${testimonials.length})`}
        sub="Noms, rôles, citations et relations FR/EN"
      >
        <ActionsBar
          count={testimonials.length}
          addLabel="Ajouter un témoignage"
          onAdd={() =>
            addItem('testimonials', () => ({
              id: Date.now(),
              name: '',
              role: { FR: '', EN: '' },
              location: '',
              rating: 5,
              quote: { FR: '', EN: '' },
              avatar: '',
              duration: '',
              relationship: { FR: '', EN: '' },
            }))
          }
          onMoveAllUp={() => moveAll('testimonials', -1)}
          onMoveAllDown={() => moveAll('testimonials', 1)}
        />
        {testimonials.map((t, i) => (
          <ItemCard
            key={i}
            title={`Témoignage ${i + 1} — ${t.name}`}
            dirty={dirty('testimonials', i)}
            {...reorderProps('testimonials', i, testimonials.length)}
            renderPreview={(lang) => <PreviewTestimonial t={t} lang={lang} />}
          >
            <FormGroup icon={<User className="w-3.5 h-3.5" strokeWidth={1.5} />} label="Identité">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Field
                  label="Nom"
                  value={t.name}
                  onChange={(val) => setField('testimonials', i, 'name', val)}
                  max={60}
                  required
                />
                <Field
                  label="Localisation"
                  value={t.location}
                  onChange={(val) => setField('testimonials', i, 'location', val)}
                  max={60}
                  hint="ex. Paris, France"
                />
                <Field
                  label="Durée (badge vidéo)"
                  value={t.duration}
                  onChange={(val) => setField('testimonials', i, 'duration', val)}
                  max={20}
                  hint="ex. 01:23"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start">
                <Field
                  label="Avatar (URL d'image)"
                  value={t.avatar}
                  onChange={(val) => setField('testimonials', i, 'avatar', val)}
                  max={240}
                  pathCheck
                  hint="Photo du client, hébergée ici ou en cloud"
                />
                <MediaUpload
                  folder="images"
                  label="Avatar"
                  currentUrl={t.avatar}
                  onUrl={(url) => setField('testimonials', i, 'avatar', url)}
                />
              </div>
            </FormGroup>
            <FormGroup icon={<Type className="w-3.5 h-3.5" strokeWidth={1.5} />} label="Textes FR / EN">
              <LangPair
                label="Rôle"
                fr={t.role.FR}
                en={t.role.EN}
                onFR={(val) => setLang('testimonials', i, 'role', 'FR', val)}
                onEN={(val) => setLang('testimonials', i, 'role', 'EN', val)}
                max={80}
              />
              <LangPair
                label="Citation"
                fr={t.quote.FR}
                en={t.quote.EN}
                textarea
                rows={3}
                onFR={(val) => setLang('testimonials', i, 'quote', 'FR', val)}
                onEN={(val) => setLang('testimonials', i, 'quote', 'EN', val)}
                max={400}
              />
              <LangPair
                label="Relation (ex. « Acquéreur Parcelle #04 »)"
                fr={t.relationship.FR}
                en={t.relationship.EN}
                onFR={(val) => setLang('testimonials', i, 'relationship', 'FR', val)}
                onEN={(val) => setLang('testimonials', i, 'relationship', 'EN', val)}
                max={100}
              />
            </FormGroup>
          </ItemCard>
        ))}
      </Section>

      {/* FAQ */}
      <Section
        icon={<HelpCircle className="w-4 h-4" strokeWidth={1.5} />}
        title={`FAQ (${faq.length})`}
        sub="Questions et réponses FR/EN"
      >
        <ActionsBar
          count={faq.length}
          addLabel="Ajouter une question"
          onAdd={() =>
            addItem('faq', () => ({
              id: `faq-${Date.now()}`,
              question: { FR: '', EN: '' },
              answer: { FR: '', EN: '' },
            }))
          }
          onMoveAllUp={() => moveAll('faq', -1)}
          onMoveAllDown={() => moveAll('faq', 1)}
        />
        {faq.map((f, i) => (
          <ItemCard
            key={i}
            title={`Question ${i + 1}`}
            dirty={dirty('faq', i)}
            {...reorderProps('faq', i, faq.length)}
            renderPreview={(lang) => <PreviewFaq f={f} lang={lang} />}
          >
            <FormGroup icon={<Type className="w-3.5 h-3.5" strokeWidth={1.5} />} label="Question FR / EN">
              <LangPair
                label="Question"
                fr={f.question.FR}
                en={f.question.EN}
                onFR={(val) => setLang('faq', i, 'question', 'FR', val)}
                onEN={(val) => setLang('faq', i, 'question', 'EN', val)}
                max={160}
                required
              />
            </FormGroup>
            <FormGroup icon={<MessageSquareQuote className="w-3.5 h-3.5" strokeWidth={1.5} />} label="Réponse FR / EN">
              <LangPair
                label="Réponse"
                fr={f.answer.FR}
                en={f.answer.EN}
                textarea
                rows={3}
                onFR={(val) => setLang('faq', i, 'answer', 'FR', val)}
                onEN={(val) => setLang('faq', i, 'answer', 'EN', val)}
                max={700}
              />
            </FormGroup>
          </ItemCard>
        ))}
      </Section>

      {/* Blog */}
      <Section
        icon={<Newspaper className="w-4 h-4" strokeWidth={1.5} />}
        title={`Blog (${blog.length})`}
        sub="Articles complets FR/EN — titres, résumés, contenus"
      >
        <ActionsBar
          count={blog.length}
          addLabel="Ajouter un article"
          onAdd={() =>
            addItem('blogArticles', () => ({
              id: `article-${Date.now()}`,
              title: { FR: '', EN: '' },
              summary: { FR: '', EN: '' },
              content: { FR: '', EN: '' },
              category: { FR: '', EN: '' },
              date: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
              readTime: '',
              image: '',
            }))
          }
          onMoveAllUp={() => moveAll('blogArticles', -1)}
          onMoveAllDown={() => moveAll('blogArticles', 1)}
        />
        {blog.map((b, i) => (
          <ItemCard
            key={i}
            title={`Article ${i + 1} — ${b.title.FR}`}
            dirty={dirty('blogArticles', i)}
            {...reorderProps('blogArticles', i, blog.length)}
            renderPreview={(lang) => <PreviewBlog b={b} lang={lang} />}
          >
            <FormGroup icon={<CalendarDays className="w-3.5 h-3.5" strokeWidth={1.5} />} label="Méta de l'article">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-start">
                <Field
                  label="Date"
                  value={b.date}
                  onChange={(val) => setField('blogArticles', i, 'date', val)}
                  max={30}
                  hint="ex. 12 mars 2026"
                />
                <Field
                  label="Temps de lecture"
                  value={b.readTime}
                  onChange={(val) => setField('blogArticles', i, 'readTime', val)}
                  max={30}
                  hint="ex. 4 min de lecture"
                />
                <div className="min-w-0 space-y-2">
                  <Field
                    label="Image (URL)"
                    value={b.image}
                    onChange={(val) => setField('blogArticles', i, 'image', val)}
                    max={240}
                    pathCheck
                    hint="Image d'illustration de l'article"
                  />
                  <MediaUpload
                    folder="images"
                    label="Image article"
                    currentUrl={b.image}
                    onUrl={(url) => setField('blogArticles', i, 'image', url)}
                  />
                </div>
              </div>
            </FormGroup>
            <FormGroup icon={<Type className="w-3.5 h-3.5" strokeWidth={1.5} />} label="Textes FR / EN">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <LangPair
                  label="Titre"
                  fr={b.title.FR}
                  en={b.title.EN}
                  onFR={(val) => setLang('blogArticles', i, 'title', 'FR', val)}
                  onEN={(val) => setLang('blogArticles', i, 'title', 'EN', val)}
                  max={120}
                />
                <LangPair
                  label="Catégorie"
                  fr={b.category.FR}
                  en={b.category.EN}
                  onFR={(val) => setLang('blogArticles', i, 'category', 'FR', val)}
                  onEN={(val) => setLang('blogArticles', i, 'category', 'EN', val)}
                  max={60}
                />
              </div>
              <LangPair
                label="Résumé"
                fr={b.summary.FR}
                en={b.summary.EN}
                textarea
                onFR={(val) => setLang('blogArticles', i, 'summary', 'FR', val)}
                onEN={(val) => setLang('blogArticles', i, 'summary', 'EN', val)}
                max={300}
              />
              <LangPair
                label="Contenu complet"
                fr={b.content.FR}
                en={b.content.EN}
                textarea
                rows={6}
                onFR={(val) => setLang('blogArticles', i, 'content', 'FR', val)}
                onEN={(val) => setLang('blogArticles', i, 'content', 'EN', val)}
                max={5000}
              />
            </FormGroup>
          </ItemCard>
        ))}
      </Section>

      {/* Toast « Annuler » après suppression / duplication (5 s) */}
      <AnimatePresence>
        {undo && (
          <motion.div
            key={undo.id}
            initial={{ opacity: 0, y: 24, scale: 0.96, x: '-50%' }}
            animate={{ opacity: 1, y: 0, scale: 1, x: '-50%' }}
            exit={{ opacity: 0, y: 12, scale: 0.98, x: '-50%' }}
            transition={{ duration: 0.35, ease: EASE }}
            className="fixed bottom-20 sm:bottom-6 left-1/2 z-40 w-max max-w-[calc(100vw-2rem)]"
          >
            <div className="relative overflow-hidden flex items-center gap-2 pl-4 pr-2 py-2 rounded-full bg-(--admin-card) ring-1 ring-(--admin-accent)/30 shadow-[0_16px_50px_rgba(0,0,0,0.5)]">
              <span className="font-mono text-caption uppercase tracking-[0.18em] text-(--admin-text) whitespace-nowrap">
                {undo.action === 'deleted' ? 'Élément supprimé' : 'Élément dupliqué'}
              </span>
              <button
                type="button"
                onClick={performUndo}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-(--admin-accent) text-(--admin-accent-text) text-caption font-mono font-bold uppercase tracking-widest active:scale-95 transition-transform duration-400 ease-spring cursor-pointer"
              >
                <Undo2 className="w-3.5 h-3.5" strokeWidth={2} />
                Annuler
              </button>
              <button
                type="button"
                onClick={() => {
                  if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
                  setUndo(null);
                }}
                aria-label="Fermer"
                className="w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-(--admin-muted) hover:text-(--admin-text) transition-colors duration-400 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" strokeWidth={1.5} />
              </button>
              {/* Barre de compte à rebours (5 s) */}
              <motion.span
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                transition={{ duration: 5, ease: 'linear' }}
                className="absolute bottom-0 left-0 h-0.5 w-full origin-left bg-(--admin-accent)/50"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}