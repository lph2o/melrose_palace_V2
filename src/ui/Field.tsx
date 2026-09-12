import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

/**
 * Champs de formulaire du système.
 *
 * - hauteur minimale 48px (au-dessus des 44px de cible tactile, car un champ
 *   se remplit avec le pouce) ;
 * - le libellé est un vrai `<label>` lié au champ (obligatoire pour les
 *   lecteurs d'écran et pour agrandir la zone cliquable) ;
 * - les messages d'erreur sont annoncés (`role="alert"`), pas seulement colorés.
 */
const BASE =
  'w-full min-h-[48px] rounded-inner px-4 text-body outline-none transition-colors duration-400 ease-spring placeholder:text-ink-3/60';

const TONES = {
  light:
    'bg-white text-primary ring-1 ring-line hover:ring-gold-line/45 focus:ring-2 focus:ring-gold-ink/60',
  dark: 'bg-white/8 text-white ring-1 ring-white/15 hover:ring-white/25 focus:ring-2 focus:ring-secondary-fixed/70 placeholder:text-white/60',
} as const;

function Wrapper({
  id,
  label,
  hint,
  error,
  required,
  children,
  className = '',
  tone,
}: {
  id: string;
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  children: ReactNode;
  className?: string;
  tone: keyof typeof TONES;
}) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label ? (
        <label
          htmlFor={id}
          className={`text-caption font-semibold ${
            tone === 'dark' ? 'text-white/85' : 'text-ink-2'
          }`}
        >
          {label}
          {required ? <span className="text-gold-ink"> *</span> : null}
        </label>
      ) : null}
      {children}
      {error ? (
        <p role="alert" className="text-caption font-medium text-error">
          {error}
        </p>
      ) : hint ? (
        <p className={`text-caption ${tone === 'dark' ? 'text-white/60' : 'text-ink-3'}`}>{hint}</p>
      ) : null}
    </div>
  );
}

export interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  tone?: keyof typeof TONES;
}

export function Field({ id, label, hint, error, tone = 'light', className, ...rest }: FieldProps) {
  return (
    <Wrapper id={id} label={label} hint={hint} error={error} required={rest.required} tone={tone}>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        className={`${BASE} ${TONES[tone]} ${
          error ? 'ring-1 ring-error' : ''
        } ${className ?? ''}`}
        {...rest}
      />
    </Wrapper>
  );
}

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  id: string;
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  tone?: keyof typeof TONES;
}

export function TextArea({
  id,
  label,
  hint,
  error,
  tone = 'light',
  className,
  ...rest
}: TextAreaProps) {
  return (
    <Wrapper id={id} label={label} hint={hint} error={error} required={rest.required} tone={tone}>
      <textarea
        id={id}
        aria-invalid={error ? true : undefined}
        className={`${BASE} py-3 ${TONES[tone]} ${error ? 'ring-1 ring-error' : ''} ${
          className ?? ''
        }`}
        {...rest}
      />
    </Wrapper>
  );
}

export interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  id: string;
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  tone?: keyof typeof TONES;
}

export function Select({
  id,
  label,
  hint,
  error,
  tone = 'light',
  className,
  children,
  ...rest
}: SelectFieldProps) {
  return (
    <Wrapper id={id} label={label} hint={hint} error={error} required={rest.required} tone={tone}>
      <select
        id={id}
        aria-invalid={error ? true : undefined}
        className={`${BASE} pr-10 appearance-none cursor-pointer ${TONES[tone]} ${
          error ? 'ring-1 ring-error' : ''
        } ${className ?? ''}`}
        {...rest}
      >
        {children}
      </select>
    </Wrapper>
  );
}
