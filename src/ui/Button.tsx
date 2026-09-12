import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

/**
 * Bouton du système de design.
 *
 * Règles tenues ici, une fois pour tout le site :
 * - toutes les tailles font **au moins 44px de haut** (cible tactile) ;
 * - les transitions passent par `ease-spring` (jamais `ease-in-out`) ;
 * - l'icône de fuite est **enchâssée dans sa propre pastille circulaire**
 *   (« bouton dans le bouton ») et se décale en diagonale au survol ;
 * - l'appui se traduit par `active:scale-[0.98]`, jamais par un changement sec.
 */
type Variant = 'primary' | 'secondary' | 'ghost' | 'whatsapp' | 'onDark';
type Size = 'md' | 'lg';

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-secondary-container text-on-secondary-fixed hover:bg-secondary-fixed-dim shadow-elev-1',
  secondary:
    'bg-white text-primary ring-1 ring-line hover:ring-gold-line/60 shadow-elev-1',
  ghost: 'bg-transparent text-primary hover:bg-primary/5',
  whatsapp: 'bg-whatsapp text-white hover:bg-[#128c4a] shadow-elev-1',
  onDark: 'bg-white/10 text-white ring-1 ring-white/20 hover:bg-white/15 backdrop-blur-sm',
};

const SIZES: Record<Size, string> = {
  md: 'min-h-[44px] px-5 gap-2 text-caption',
  lg: 'min-h-[52px] px-7 gap-2.5 text-sm',
};

const PILL_TONES: Record<Variant, string> = {
  primary: 'bg-[#241a00]/10 text-on-secondary-fixed',
  secondary: 'bg-primary/8 text-primary',
  ghost: 'bg-primary/8 text-primary',
  whatsapp: 'bg-white/20 text-white',
  onDark: 'bg-white/15 text-white',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  /** Icône de fuite (flèche, ↗) : rendue dans sa propre pastille. */
  trailing?: ReactNode;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', trailing, fullWidth, className = '', children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      className={`group inline-flex items-center justify-center rounded-full font-sans font-bold uppercase tracking-wider transition-all duration-400 ease-spring active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer ${
        VARIANTS[variant]
      } ${SIZES[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...rest}
    >
      <span>{children}</span>
      {trailing ? (
        <span
          className={`-mr-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-transform duration-400 ease-spring group-hover:translate-x-1 group-hover:-translate-y-px group-hover:scale-105 ${
            PILL_TONES[variant]
          }`}
        >
          {trailing}
        </span>
      ) : null}
    </button>
  );
});
