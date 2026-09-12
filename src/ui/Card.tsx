import type { ReactNode } from 'react';

/**
 * Carte « double coque » : le contenu ne repose jamais à plat sur le fond.
 * Une coque extérieure (liseré + halo) contient un noyau qui a sa propre
 * surface et un rayon concentrique plus petit.
 */
export function Card({
  children,
  className = '',
  tone = 'light',
  interactive = false,
  reveal = false,
}: {
  children: ReactNode;
  className?: string;
  tone?: 'light' | 'dark' | 'gold';
  interactive?: boolean;
  reveal?: boolean;
}) {
  const shells = {
    light: 'bg-[#f2efe8] ring-1 ring-line',
    dark: 'bg-white/[0.04] ring-1 ring-white/10',
    gold: 'bg-secondary-fixed/12 ring-1 ring-gold-line/25',
  } as const;
  const cores = {
    light: 'bg-white shadow-inset-highlight',
    dark: 'bg-primary-container/60',
    gold: 'bg-white',
  } as const;
  return (
    <div
      className={`rounded-card p-1.5 transition-all duration-400 ease-spring ${shells[tone]} ${
        interactive
          ? 'hover:-translate-y-0.5 hover:shadow-elev-2 focus-within:shadow-elev-2'
          : 'shadow-elev-1'
      } ${reveal ? 'reveal' : ''} ${className}`}
    >
      <div className={`h-full rounded-inner p-6 ${cores[tone]}`}>{children}</div>
    </div>
  );
}

/** Surface simple sans coque, pour les blocs secondaires. */
export function Panel({
  children,
  className = '',
  tone = 'light',
}: {
  children: ReactNode;
  className?: string;
  tone?: 'light' | 'raised' | 'dark';
}) {
  const tones = {
    light: 'bg-white ring-1 ring-line shadow-elev-1',
    raised: 'bg-surface-container ring-1 ring-line',
    dark: 'bg-white/[0.04] ring-1 ring-white/10 text-white',
  } as const;
  return (
    <div className={`rounded-card ${tones[tone]} ${className}`}>{children}</div>
  );
}
