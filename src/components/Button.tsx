import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';

type Variant = 'primary' | 'gold' | 'secondary' | 'ghost' | 'danger';
type Size = 'md' | 'lg';

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-brand-800 text-white hover:bg-brand-900 active:bg-brand-900',
  // El amarillo de la bandera necesita texto oscuro para tener contraste.
  gold: 'bg-gold-300 text-brand-900 hover:bg-gold-400 active:bg-gold-500 active:text-white',
  secondary: 'bg-white text-brand-800 border border-brand-200 hover:bg-brand-50',
  ghost: 'bg-transparent text-slate-700 hover:bg-slate-100',
  danger: 'bg-white text-rojo-700 border border-rojo-200 hover:bg-rojo-50',
};

const SIZES: Record<Size, string> = {
  // 44px y 52px de alto: cómodos para pulsar con el pulgar.
  md: 'min-h-[44px] px-4 text-sm',
  lg: 'min-h-[52px] px-5 text-base',
};

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors ' +
  'disabled:cursor-not-allowed disabled:opacity-60';

interface CommonProps {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  className?: string;
  children: ReactNode;
}

function classes({ variant = 'primary', size = 'md', fullWidth, className = '' }: CommonProps) {
  return [BASE, VARIANTS[variant], SIZES[size], fullWidth ? 'w-full' : '', className]
    .filter(Boolean)
    .join(' ');
}

type ButtonProps = CommonProps & ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean };

export function Button({
  variant,
  size,
  fullWidth,
  className,
  children,
  loading,
  disabled,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={classes({ variant, size, fullWidth, className, children })}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading && (
        <span
          className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden="true"
        />
      )}
      {children}
    </button>
  );
}

type ButtonLinkProps = CommonProps & { to: string; state?: unknown };

export function ButtonLink({
  to,
  state,
  variant,
  size,
  fullWidth,
  className,
  children,
}: ButtonLinkProps) {
  return (
    <Link
      to={to}
      state={state}
      className={classes({ variant, size, fullWidth, className, children })}
    >
      {children}
    </Link>
  );
}

type ExternalButtonLinkProps = CommonProps & { href: string };

export function ExternalButtonLink({
  href,
  variant,
  size,
  fullWidth,
  className,
  children,
}: ExternalButtonLinkProps) {
  return (
    <a
      href={href}
      className={classes({ variant, size, fullWidth, className, children })}
      rel="noopener noreferrer"
    >
      {children}
    </a>
  );
}
