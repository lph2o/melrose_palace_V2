import type { ReactNode } from 'react';

/**
 * Enveloppe de section : porte le rythme vertical du système
 * (`--section-y` = 96px mobile, 128px desktop) et la largeur de lecture.
 * Aucune section ne doit réécrire son propre `py-*`.
 */
export function Section({
  id,
  children,
  className = '',
  tone = 'default',
  width = 'wide',
  divider = false,
}: {
  id?: string;
  children: ReactNode;
  className?: string;
  tone?: 'default' | 'raised' | 'dark';
  width?: 'wide' | 'tight' | 'bleed';
  divider?: boolean;
}) {
  const tones = {
    default: 'bg-background',
    raised: 'bg-surface-container-low',
    dark: 'bg-primary text-white',
  } as const;
  const widths = {
    wide: 'max-w-7xl mx-auto',
    tight: 'max-w-4xl mx-auto',
    bleed: 'w-full',
  } as const;
  return (
    <section
      id={id}
      className={`py-section px-5 md:px-12 relative scroll-mt-[var(--nav-h)] ${
        tones[tone]
      } ${divider ? 'border-t border-line' : ''} ${className}`}
    >
      <div className={widths[width]}>{children}</div>
    </section>
  );
}

/** Micro-badge doré qui précède un titre : la signature « agence ». */
export function Eyebrow({
  children,
  tone = 'light',
  className = '',
}: {
  children: ReactNode;
  tone?: 'light' | 'dark';
  className?: string;
}) {
  const tones = {
    light: 'bg-secondary-fixed/20 text-gold-ink ring-1 ring-gold-line/25',
    dark: 'bg-white/8 text-secondary-fixed ring-1 ring-secondary-fixed/25',
  } as const;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-micro font-semibold uppercase tracking-[0.2em] ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

/**
 * Bloc de titre de section : eyebrow + H2 + sous-titre.
 * Centralise l'échelle typographique pour qu'aucune section ne réinvente
 * « text-2xl md:text-3xl » à sa façon.
 */
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'center',
  tone = 'light',
  className = '',
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: 'center' | 'left';
  tone?: 'light' | 'dark';
  className?: string;
}) {
  const isDark = tone === 'dark';
  return (
    <header
      className={`reveal flex flex-col gap-4 ${
        align === 'center' ? 'items-center text-center' : 'items-start text-left'
      } ${className}`}
    >
      {eyebrow ? <Eyebrow tone={isDark ? 'dark' : 'light'}>{eyebrow}</Eyebrow> : null}
      <h2
        className={`font-serif text-h2 font-bold tracking-tight ${
          isDark ? 'text-white' : 'text-primary'
        }`}
      >
        {title}
      </h2>
      {subtitle ? (
        <p
          className={`text-lead max-w-2xl ${isDark ? 'text-white/70' : 'text-ink-3'}`}
        >
          {subtitle}
        </p>
      ) : null}
    </header>
  );
}
