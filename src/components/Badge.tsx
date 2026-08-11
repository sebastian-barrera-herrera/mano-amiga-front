import type { ReactNode } from 'react';
import { KIND_LABEL, STATUS_LABEL } from '../lib/format';
import type { ReportKind, ReportStatus } from '../types';

type Tone = 'brand' | 'gold' | 'rojo' | 'slate';

const TONES: Record<Tone, string> = {
  brand: 'bg-brand-50 text-brand-800 ring-brand-200',
  gold: 'bg-gold-100 text-gold-800 ring-gold-300',
  rojo: 'bg-rojo-50 text-rojo-700 ring-rojo-200',
  slate: 'bg-slate-100 text-slate-700 ring-slate-200',
};

export function Badge({ tone = 'slate', children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${TONES[tone]}`}
    >
      {children}
    </span>
  );
}

/**
 * Rojo para quien sigue desaparecido y amarillo para los hallazgos. Además de
 * ser dos colores de la bandera, se distinguen mejor que rojo y verde para
 * quienes no perciben bien esos tonos.
 */
export function StatusBadge({ status }: { status: ReportStatus }) {
  return <Badge tone={status === 'missing' ? 'rojo' : 'gold'}>{STATUS_LABEL[status]}</Badge>;
}

export function KindBadge({ kind }: { kind: ReportKind }) {
  return <Badge tone="slate">{KIND_LABEL[kind]}</Badge>;
}

export function ResolvedBadge() {
  return <Badge tone="brand">Caso cerrado</Badge>;
}
