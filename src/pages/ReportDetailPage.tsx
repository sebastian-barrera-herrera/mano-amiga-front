import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Alert } from '../components/Alert';
import { Button, ButtonLink, ExternalButtonLink } from '../components/Button';
import { KindBadge, ResolvedBadge, StatusBadge } from '../components/Badge';
import { CopyButton } from '../components/CopyButton';
import { Spinner } from '../components/Feedback';
import {
  ArrowLeftIcon,
  MailIcon,
  PawIcon,
  PersonSearchIcon,
  PhoneIcon,
  ShareIcon,
  WhatsAppIcon,
} from '../components/Icons';
import { api, ApiError } from '../lib/api';
import { formatDateTime, formatRelative, KIND_LABEL, toPhoneLink } from '../lib/format';
import { optimizedImage } from '../lib/image';
import { variantFor } from '../lib/reportForms';
import type { Report } from '../types';

interface LocationState {
  justPublished?: boolean;
  justUpdated?: boolean;
}

export default function ReportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const state = (useLocation().state ?? {}) as LocationState;

  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [working, setWorking] = useState(false);

  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();
    setLoading(true);
    api
      .getReport(id, controller.signal)
      .then(setReport)
      .catch((requestError: unknown) => {
        if (requestError instanceof DOMException && requestError.name === 'AbortError') return;
        setError(
          requestError instanceof ApiError ? requestError.message : 'No pudimos cargar el reporte.',
        );
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [id]);

  if (loading) return <Spinner label="Cargando reporte…" />;

  if (error || !report) {
    return (
      <div className="space-y-4">
        <Alert tone="error">{error ?? 'No encontramos este reporte.'}</Alert>
        <ButtonLink to="/reportes" variant="secondary">
          Ver todos los reportes
        </ButtonLink>
      </div>
    );
  }

  const title = report.name?.trim() || `${KIND_LABEL[report.kind]} sin identificar`;
  const photo = optimizedImage(report.photoUrl, 1000);
  const Placeholder = report.kind === 'person' ? PersonSearchIcon : PawIcon;
  const phoneLink = report.contactPhone ? toPhoneLink(report.contactPhone) : null;

  const details: Array<[string, string | null]> = [
    ['Tipo', KIND_LABEL[report.kind]],
    report.kind === 'person'
      ? ['Edad aproximada', report.approxAge !== null ? `${report.approxAge} años` : null]
      : ['Especie', report.species],
    report.kind === 'pet' ? ['Color', report.color] : ['Ropa', report.clothing],
    ['Ciudad', report.city],
    ['Barrio', report.neighborhood],
    [
      report.status === 'missing' ? 'Última ubicación conocida' : 'Lugar donde fue encontrada',
      report.locationDetail,
    ],
    [
      report.status === 'missing' ? 'Fecha de la desaparición' : 'Fecha del hallazgo',
      report.eventAt ? formatDateTime(report.eventAt) : null,
    ],
    ['Estado de salud', report.healthStatus],
  ];

  async function handleShare() {
    const url = window.location.href;
    const text = `${title} · ${report?.city} — ManoAmiga`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'ManoAmiga', text, url });
        return;
      } catch {
        /* el usuario canceló: no es un error */
      }
    }
    await navigator.clipboard?.writeText(url).catch(() => undefined);
  }

  async function handleResolve() {
    if (!report) return;
    setActionError(null);
    setWorking(true);
    try {
      setReport(await api.updateReport(report.id, { resolved: !report.resolvedAt }));
    } catch (requestError) {
      setActionError(
        requestError instanceof ApiError ? requestError.message : 'No pudimos actualizar el reporte.',
      );
    } finally {
      setWorking(false);
    }
  }

  async function handleDelete() {
    if (!report) return;
    if (!window.confirm('¿Eliminar este reporte? Esta acción no se puede deshacer.')) return;
    setActionError(null);
    setWorking(true);
    try {
      await api.deleteReport(report.id);
      navigate('/mis-publicaciones', { replace: true });
    } catch (requestError) {
      setActionError(
        requestError instanceof ApiError ? requestError.message : 'No pudimos eliminar el reporte.',
      );
      setWorking(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex min-h-[44px] items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
      >
        <ArrowLeftIcon className="h-5 w-5" />
        Volver
      </button>

      {state.justPublished && (
        <Alert tone="success">
          <strong className="font-semibold">Reporte publicado.</strong> Comparte este enlace por
          WhatsApp o redes sociales para que llegue a más personas.
        </Alert>
      )}
      {state.justUpdated && <Alert tone="success">Cambios guardados.</Alert>}

      <article className="card overflow-hidden">
        <div className="relative overflow-hidden bg-slate-100">
          {photo ? (
            <>
              {/* Foto completa sobre su propia versión difuminada: aquí es donde
                  hay que poder mirarla bien, sea vertical, cuadrada o panorámica. */}
              <img
                src={photo}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 h-full w-full scale-110 object-cover blur-xl"
              />
              <img
                src={photo}
                alt={`Foto de ${title}`}
                className="relative mx-auto max-h-[28rem] w-auto max-w-full object-contain"
              />
            </>
          ) : (
            <div className="flex h-52 items-center justify-center">
              <Placeholder className="h-16 w-16 text-slate-300" />
            </div>
          )}
        </div>

        <div className="space-y-5 p-5 sm:p-6">
          <div>
            <div className="mb-3 flex flex-wrap gap-2">
              <StatusBadge status={report.status} />
              <KindBadge kind={report.kind} />
              {report.resolvedAt && <ResolvedBadge />}
            </div>
            <h1 className="text-2xl font-extrabold leading-tight text-slate-900 sm:text-3xl">
              {title}
            </h1>
            <p className="mt-1.5 text-sm text-slate-500">
              Publicado {formatRelative(report.createdAt)} · {formatDateTime(report.createdAt)}
            </p>
          </div>

          {report.description && (
            <div>
              <h2 className="mb-1.5 text-sm font-bold uppercase tracking-wide text-slate-500">
                Descripción
              </h2>
              <p className="whitespace-pre-line leading-relaxed text-slate-700">
                {report.description}
              </p>
            </div>
          )}

          <dl className="grid gap-x-6 gap-y-3 border-t border-slate-100 pt-5 sm:grid-cols-2">
            {details
              .filter(([, value]) => Boolean(value))
              .map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {label}
                  </dt>
                  <dd className="mt-0.5 text-slate-800">{value}</dd>
                </div>
              ))}
          </dl>
        </div>
      </article>

      <section className="card p-5 sm:p-6" aria-labelledby="contacto">
        <h2 id="contacto" className="text-lg font-bold text-slate-900">
          Contacto
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Publicado por <strong className="font-semibold text-slate-800">{report.contactName}</strong>
        </p>

        <div className="mt-4 space-y-4">
          {report.contactPhone && (
            <div>
              <p className="flex items-center gap-2 text-slate-800">
                <PhoneIcon className="h-5 w-5 text-slate-400" />
                <span className="font-medium">{report.contactPhone}</span>
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <ExternalButtonLink href={`tel:${phoneLink}`} variant="primary">
                  <PhoneIcon className="h-4 w-4" />
                  Llamar
                </ExternalButtonLink>
                <ExternalButtonLink
                  href={`https://wa.me/${phoneLink?.replace('+', '')}`}
                  variant="gold"
                >
                  <WhatsAppIcon className="h-4 w-4" />
                  WhatsApp
                </ExternalButtonLink>
                <CopyButton value={report.contactPhone} label="Copiar teléfono" />
              </div>
            </div>
          )}

          {report.contactEmail && (
            <div>
              <p className="flex items-center gap-2 text-slate-800">
                <MailIcon className="h-5 w-5 text-slate-400" />
                <span className="break-all font-medium">{report.contactEmail}</span>
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <ExternalButtonLink href={`mailto:${report.contactEmail}`} variant="secondary">
                  <MailIcon className="h-4 w-4" />
                  Escribir correo
                </ExternalButtonLink>
                <CopyButton value={report.contactEmail} label="Copiar correo" />
              </div>
            </div>
          )}

          <div className="border-t border-slate-100 pt-4">
            <Button variant="ghost" onClick={() => void handleShare()}>
              <ShareIcon className="h-4 w-4" />
              Compartir este reporte
            </Button>
          </div>
        </div>
      </section>

      {report.isMine && (
        <section className="card p-5 sm:p-6" aria-labelledby="administrar">
          <h2 id="administrar" className="text-lg font-bold text-slate-900">
            Administrar mi publicación
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Si ya se resolvió, ciérralo para que no siga apareciendo en las búsquedas.
          </p>
          {actionError && (
            <Alert tone="error" className="mt-3">
              {actionError}
            </Alert>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="gold" loading={working} onClick={() => void handleResolve()}>
              {report.resolvedAt ? 'Reabrir el caso' : 'Marcar como resuelto'}
            </Button>
            <ButtonLink
              to={`/reportes/${report.id}/editar`}
              variant="secondary"
              state={{ variant: variantFor(report.kind, report.status) }}
            >
              Editar
            </ButtonLink>
            <Button variant="danger" loading={working} onClick={() => void handleDelete()}>
              Eliminar
            </Button>
          </div>
        </section>
      )}

      <p className="text-center text-xs text-slate-500">
        ¿Este reporte tiene información falsa o indebida? Escríbenos y lo revisamos.{' '}
        <Link to="/muro" className="font-semibold text-brand-800 underline">
          También puedes avisar en el muro
        </Link>
        .
      </p>
    </div>
  );
}
