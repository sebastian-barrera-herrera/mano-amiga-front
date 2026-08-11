import type {
  AuthResult,
  CommunityMessage,
  CommunityMessageInput,
  Paginated,
  Report,
  ReportInput,
  ReportStats,
  UploadSignature,
  UploadStatus,
  User,
} from '../types';

export const API_BASE_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '');
const BASE_URL = API_BASE_URL;
const TOKEN_KEY = 'manoamiga.token';

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly errors?: string[],
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const tokenStorage = {
  get: (): string | null => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set: (token: string): void => {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {
      /* modo privado sin almacenamiento: la sesión dura lo que la pestaña */
    }
  },
  clear: (): void => {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* nada que limpiar */
    }
  },
};

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  signal?: AbortSignal;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const token = tokenStorage.get();
  const headers: Record<string, string> = {};
  if (options.body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method: options.method ?? 'GET',
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      signal: options.signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new ApiError('No hay conexión con el servidor. Revisa tu internet.', 0);
  }

  if (response.status === 204) return undefined as T;

  const isJson = response.headers.get('content-type')?.includes('application/json') ?? false;
  const payload = isJson ? await response.json().catch(() => null) : null;

  if (!response.ok) {
    const message =
      (payload as { message?: string } | null)?.message ??
      'No pudimos completar la acción. Intenta de nuevo.';
    throw new ApiError(message, response.status, (payload as { errors?: string[] } | null)?.errors);
  }

  // Una respuesta correcta que no sea JSON significa que no estamos hablando
  // con la API: lo típico es que VITE_API_URL falte y la petición acabe en la
  // regla de SPA del hosting, que devuelve index.html con estado 200. Sin este
  // control, la app se quedaría con datos nulos y sin ningún aviso.
  if (!isJson) {
    throw new ApiError(
      `La dirección ${BASE_URL} no está respondiendo como API. Revisa la variable VITE_API_URL.`,
      response.status,
    );
  }

  return payload as T;
}

type QueryParams = Record<string, string | number | undefined>;

function toQuery(params: QueryParams): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `?${query}` : '';
}

export interface ReportFilters extends QueryParams {
  page?: number;
  limit?: number;
  q?: string;
  kind?: string;
  status?: string;
  city?: string;
  resolution?: 'open' | 'resolved' | 'all';
}

export interface MessageFilters extends QueryParams {
  page?: number;
  limit?: number;
  city?: string;
  category?: string;
  q?: string;
}

export const api = {
  // ── Reportes ──────────────────────────────────────────────────────────────
  listReports: (filters: ReportFilters, signal?: AbortSignal) =>
    request<Paginated<Report>>(`/reports${toQuery(filters)}`, { signal }),

  getReport: (id: string, signal?: AbortSignal) => request<Report>(`/reports/${id}`, { signal }),

  getStats: (signal?: AbortSignal) => request<ReportStats>('/reports/stats', { signal }),

  listMyReports: (page = 1, signal?: AbortSignal) =>
    request<Paginated<Report>>(`/reports/mine${toQuery({ page, limit: 50 })}`, { signal }),

  createReport: (input: ReportInput) => request<Report>('/reports', { method: 'POST', body: input }),

  updateReport: (
    id: string,
    input: Omit<Partial<ReportInput>, 'photoUrl' | 'photoPublicId'> & {
      resolved?: boolean;
      // `null` borra el valor; `undefined` lo deja como está.
      photoUrl?: string | null;
      photoPublicId?: string | null;
    },
  ) => request<Report>(`/reports/${id}`, { method: 'PATCH', body: input }),

  deleteReport: (id: string) => request<{ deleted: true }>(`/reports/${id}`, { method: 'DELETE' }),

  // ── Muro comunitario ──────────────────────────────────────────────────────
  listMessages: (filters: MessageFilters, signal?: AbortSignal) =>
    request<Paginated<CommunityMessage>>(`/community${toQuery(filters)}`, { signal }),

  listMessageCities: (signal?: AbortSignal) => request<string[]>('/community/cities', { signal }),

  createMessage: (input: CommunityMessageInput) =>
    request<CommunityMessage>('/community', { method: 'POST', body: input }),

  deleteMessage: (id: string) => request<{ deleted: true }>(`/community/${id}`, { method: 'DELETE' }),

  // ── Cuenta ────────────────────────────────────────────────────────────────
  authProviders: (signal?: AbortSignal) =>
    request<{ google: boolean; email: boolean }>('/auth/providers', { signal }),

  register: (body: { email: string; password: string; name?: string }) =>
    request<AuthResult>('/auth/register', { method: 'POST', body }),

  login: (body: { email: string; password: string }) =>
    request<AuthResult>('/auth/login', { method: 'POST', body }),

  loginWithGoogle: (credential: string) =>
    request<AuthResult>('/auth/google', { method: 'POST', body: { credential } }),

  me: (signal?: AbortSignal) => request<User>('/auth/me', { signal }),

  // ── Fotos ─────────────────────────────────────────────────────────────────
  uploadStatus: (signal?: AbortSignal) => request<UploadStatus>('/uploads/status', { signal }),

  uploadSignature: () => request<UploadSignature>('/uploads/signature'),
};
