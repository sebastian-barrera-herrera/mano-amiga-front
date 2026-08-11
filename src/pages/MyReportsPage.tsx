import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Alert } from '../components/Alert';
import { ButtonLink } from '../components/Button';
import { EmptyState, Spinner } from '../components/Feedback';
import { ListIcon } from '../components/Icons';
import { ReportCard } from '../components/ReportCard';
import { useAuth } from '../context/AuthContext';
import { api, ApiError } from '../lib/api';
import type { Report } from '../types';

export default function MyReportsPage() {
  const { user, loading: authLoading } = useAuth();
  const [reports, setReports] = useState<Report[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const controller = new AbortController();
    api
      .listMyReports(1, controller.signal)
      .then((page) => setReports(page.items))
      .catch((requestError: unknown) => {
        if (requestError instanceof DOMException && requestError.name === 'AbortError') return;
        setError(
          requestError instanceof ApiError
            ? requestError.message
            : 'No pudimos cargar tus publicaciones.',
        );
      });
    return () => controller.abort();
  }, [user]);

  if (authLoading) return <Spinner label="Comprobando tu sesión…" />;
  if (!user) return <Navigate to="/cuenta" replace />;

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">Mis publicaciones</h1>
        <p className="mt-1.5 text-sm text-slate-600">
          Sólo aparecen los reportes que publicaste con la sesión iniciada. Entra en cada uno para
          editarlo, cerrarlo o eliminarlo.
        </p>
      </header>

      {error && <Alert tone="error">{error}</Alert>}
      {!reports && !error && <Spinner label="Cargando tus publicaciones…" />}

      {reports && reports.length === 0 && (
        <EmptyState
          icon={<ListIcon className="h-7 w-7" />}
          title="Todavía no has publicado nada"
          description="Cuando publiques un reporte con la sesión iniciada, aparecerá aquí."
          action={
            <ButtonLink to="/" size="lg" className="mt-2">
              Crear un reporte
            </ButtonLink>
          }
        />
      )}

      {reports && reports.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reports.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
      )}
    </div>
  );
}
