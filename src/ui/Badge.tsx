import type { ReactNode } from 'react';

/**
 * Un seul système de pastilles pour tout le site : statuts de parcelle,
 * étiquettes de section, mentions promotionnelles. Remplace les dizaines de
 * `bg-x/15 text-x ring-1 ring-x/30` écrites à la main.
 */
type Tone = 'available' | 'reserved' | 'sold' | 'promo' | 'neutral' | 'onDark';

const TONES: Record<Tone, string> = {
  available: 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-600/20',
  reserved: 'bg-amber-50 text-amber-800 ring-1 ring-amber-600/25',
  sold: 'bg-rose-50 text-rose-800 ring-1 ring-rose-600/20',
  promo: 'bg-secondary-fixed/25 text-gold-ink ring-1 ring-gold-line/35',
  neutral: 'bg-primary/5 text-ink-2 ring-1 ring-line',
  onDark: 'bg-white/10 text-white/85 ring-1 ring-white/15',
};

export function Badge({
  children,
  tone = 'neutral',
  className = '',
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-micro font-bold uppercase tracking-[0.14em] ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
