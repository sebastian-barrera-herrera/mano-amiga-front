import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Alert } from '../components/Alert';
import { ButtonLink } from '../components/Button';
import { EmptyState, SkeletonCards } from '../components/Feedback';
import { FilterChip } from '../components/FilterChip';
import { SearchIcon } from '../components/Icons';
import { Pagination } from '../components/Pagination';
import { ReportCard } from '../components/ReportCard';
import { api, ApiError } from '../lib/api';
import type { Paginated, Report } from '../types';

interface FilterOption {
  label: string;
  kind?: string;
  status?: string;
}

const FILTERS: FilterOption[] = [
  { label: 'Todos' },
  { label: 'Personas', kind: 'person' },
  { label: 'Mascotas', kind: 'pet' },
  { label: 'Desaparecidos', status: 'missing' },
  { label: 'Encontrados', status: 'found' },
];

export default function ReportsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState<Paginated<Report> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const q = searchParams.get('q') ?? '';
  const kind = searchParams.get('kind') ?? '';
  const status = searchParams.get('status') ?? '';
  const resolution = (searchParams.get('resolution') as 'open' | 'all') ?? 'open';
  const page = Number(searchParams.get('page')) || 1;

  const [searchTerm, setSearchTerm] = useState(q);

  // Con llaves, para no devolver por accidente el resultado de setSearchTerm
  // como función de limpieza del efecto.
  useEffect(() => {
    setSearchTerm(q);
  }, [q]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    api
      .listReports({ q, kind, status, resolution, page, limit: 12 }, controller.signal)
      .then(setData)
      .catch((requestError: unknown) => {
        if (requestError instanceof DOMException && requestError.name === 'AbortError') return;
        setError(
          requestError instanceof ApiError
            ? requestError.message
            : 'No pudimos cargar los reportes.',
        );
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [q, kind, status, resolution, page]);

  /** Cada cambio de filtro vuelve a la página 1 y queda en la URL (compartible). */
  function updateParams(changes: Record<string, string | undefined>) {
    const next = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    if (!('page' in changes)) next.delete('page');
    setSearchParams(next, { replace: true });
  }

  const isActiveFilter = (filter: FilterOption) =>
    (filter.kind ?? '') === kind && (filter.status ?? '') === status;

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">Reportes</h1>
        <p className="mt-1.5 text-sm text-slate-600">
          Busca por nombre o ciudad y usa los filtros para acotar los resultados.
        </p>
      </header>

      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          updateParams({ q: searchTerm.trim() || undefined });
        }}
        className="flex gap-2"
      >
        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Nombre, ciudad o barrio…"
            aria-label="Buscar reportes"
            className="field-control pl-11"
          />
        </div>
        <button
          type="submit"
          className="min-h-[44px] shrink-0 rounded-xl bg-brand-800 px-5 text-sm font-semibold text-white hover:bg-brand-900"
        >
          Buscar
        </button>
      </form>

      <div className="-mx-4 overflow-x-auto px-4">
        <div className="flex gap-2 pb-1">
          {FILTERS.map((filter) => (
            <FilterChip
              key={filter.label}
              label={filter.label}
              active={isActiveFilter(filter)}
              onClick={() => updateParams({ kind: filter.kind, status: filter.status })}
            />
          ))}
        </div>
      </div>

      <label className="flex items-center gap-2.5 text-sm text-slate-600">
        <input
          type="checkbox"
          checked={resolution === 'all'}
          onChange={(event) => updateParams({ resolution: event.target.checked ? 'all' : undefined })}
          className="h-5 w-5 rounded border-slate-300 text-brand-800 focus:ring-brand-300"
        />
        Incluir casos ya cerrados
      </label>

      {error && <Alert tone="error">{error}</Alert>}

      {loading && <SkeletonCards />}

      {!loading && data && data.items.length === 0 && (
        <EmptyState
          icon={<SearchIcon className="h-7 w-7" />}
          title="No encontramos reportes"
          description={
            q || kind || status
              ? 'Prueba con menos filtros o revisa la ortografía del nombre o la ciudad.'
              : 'Aún no hay publicaciones. Puedes ser la primera persona en reportar.'
          }
          action={
            <ButtonLink to="/" variant="secondary" size="lg" className="mt-2">
              Crear un reporte
            </ButtonLink>
          }
        />
      )}

      {!loading && data && data.items.length > 0 && (
        <>
          <p className="text-sm text-slate-500" aria-live="polite">
            {data.total} {data.total === 1 ? 'reporte' : 'reportes'}
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.items.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
          <Pagination
            page={data.page}
            totalPages={data.totalPages}
            onChange={(nextPage) => updateParams({ page: String(nextPage) })}
          />
        </>
      )}
    </div>
  );
}
