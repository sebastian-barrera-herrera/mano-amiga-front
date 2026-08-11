import type { ReactNode } from 'react';
import { AlertIcon, CheckIcon } from './Icons';

type Tone = 'error' | 'success' | 'info';

const TONES: Record<Tone, { box: string; icon: string }> = {
  error: { box: 'border-rojo-200 bg-rojo-50 text-rojo-800', icon: 'text-rojo-600' },
  success: { box: 'border-gold-300 bg-gold-50 text-gold-800', icon: 'text-gold-500' },
  info: { box: 'border-brand-200 bg-brand-50 text-brand-900', icon: 'text-brand-800' },
};

interface AlertProps {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}

export function Alert({ tone = 'info', children, className = '' }: AlertProps) {
  const styles = TONES[tone];
  const Glyph = tone === 'success' ? CheckIcon : AlertIcon;

  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${styles.box} ${className}`}
    >
      <Glyph className={`mt-0.5 h-5 w-5 shrink-0 ${styles.icon}`} />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
