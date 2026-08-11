import { useEffect, useState } from 'react';
import { copyToClipboard } from '../lib/clipboard';
import { CheckIcon, CopyIcon } from './Icons';

interface CopyButtonProps {
  value: string;
  label: string;
}

export function CopyButton({ value, label }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  return (
    <button
      type="button"
      onClick={async () => setCopied(await copyToClipboard(value))}
      className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-slate-300 px-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
    >
      {copied ? (
        <CheckIcon className="h-4 w-4 text-brand-800" />
      ) : (
        <CopyIcon className="h-4 w-4 text-slate-500" />
      )}
      <span aria-live="polite">{copied ? '¡Copiado!' : label}</span>
    </button>
  );
}
