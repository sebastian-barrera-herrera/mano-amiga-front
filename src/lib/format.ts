import type { MessageCategory, ReportKind, ReportStatus } from '../types';

const dateTimeFormatter = new Intl.DateTimeFormat('es-CO', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

const dateFormatter = new Intl.DateTimeFormat('es-CO', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

export function formatDateTime(iso: string | null): string {
  if (!iso) return 'Sin fecha';
  return dateTimeFormatter.format(new Date(iso));
}

export function formatDate(iso: string | null): string {
  if (!iso) return 'Sin fecha';
  return dateFormatter.format(new Date(iso));
}

/** "hace 5 minutos", "hace 3 días": más útil que una fecha en una emergencia. */
export function formatRelative(iso: string): string {
  const diffSeconds = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (diffSeconds < 60) return 'hace instantes';

  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ['minute', 60],
    ['hour', 3600],
    ['day', 86_400],
    ['month', 2_592_000],
    ['year', 31_536_000],
  ];

  let unit: Intl.RelativeTimeFormatUnit = 'minute';
  let seconds = 60;
  for (const [candidate, candidateSeconds] of units) {
    if (diffSeconds >= candidateSeconds) {
      unit = candidate;
      seconds = candidateSeconds;
    }
  }

  const formatter = new Intl.RelativeTimeFormat('es-CO', { numeric: 'auto' });
  return formatter.format(-Math.floor(diffSeconds / seconds), unit);
}

/** Convierte un ISO a lo que espera `<input type="datetime-local">`. */
export function toDateTimeLocal(iso: string | null): string {
  if (!iso) return '';
  const date = new Date(iso);
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}

export const KIND_LABEL: Record<ReportKind, string> = {
  person: 'Persona',
  pet: 'Mascota',
};

export const STATUS_LABEL: Record<ReportStatus, string> = {
  missing: 'Desaparecida',
  found: 'Encontrada',
};

export const CATEGORY_LABEL: Record<MessageCategory, string> = {
  water: 'Agua',
  food: 'Alimentos',
  shelter: 'Refugio',
  medical: 'Salud',
  volunteers: 'Voluntarios',
  transport: 'Transporte',
  info: 'Información',
};

export const CATEGORY_EMOJI: Record<MessageCategory, string> = {
  water: '💧',
  food: '🍲',
  shelter: '🏠',
  medical: '🩺',
  volunteers: '🙌',
  transport: '🚐',
  info: 'ℹ️',
};

/** Deja sólo dígitos y el prefijo internacional, para enlaces tel: y WhatsApp. */
export function toPhoneLink(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, '');
  return digits.startsWith('+') ? digits : `+57${digits.replace(/^57/, '')}`;
}
