import { Link } from 'react-router-dom';
import { formatRelative, KIND_LABEL } from '../lib/format';
import { optimizedImage } from '../lib/image';
import type { Report } from '../types';
import { KindBadge, ResolvedBadge, StatusBadge } from './Badge';
import { ClockIcon, MapPinIcon, PawIcon, PersonSearchIcon } from './Icons';

export function ReportCard({ report }: { report: Report }) {
  const photo = optimizedImage(report.photoUrl, 600);
  const Placeholder = report.kind === 'person' ? PersonSearchIcon : PawIcon;
  const title = report.name?.trim() || `${KIND_LABEL[report.kind]} sin identificar`;

  return (
    // h-full para que todas las tarjetas de una fila midan lo mismo.
    <article className="card flex h-full flex-col overflow-hidden transition-shadow hover:shadow-lg">
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        {photo ? (
          <>
            {/*
              La foto se muestra completa (object-contain): recortar puede dejar
              fuera la cara de quien se busca, que es justo lo que hay que ver.
              Detrás va la misma imagen ampliada y difuminada para que el hueco
              no quede vacío; es el mismo archivo, así que no se descarga dos
              veces.
            */}
            <img
              src={photo}
              alt=""
              aria-hidden="true"
              loading="lazy"
              className="absolute inset-0 h-full w-full scale-110 object-cover blur-lg"
            />
            <img
              src={photo}
              alt={`Foto de ${title}`}
              loading="lazy"
              decoding="async"
              className="relative h-full w-full object-contain"
            />
          </>
        ) : (
          <div className="flex h-full items-center justify-center">
            <Placeholder className="h-14 w-14 text-slate-300" />
          </div>
        )}
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <StatusBadge status={report.status} />
          {report.resolvedAt && <ResolvedBadge />}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          {/* Dos líneas fijas: así un nombre corto y uno largo ocupan igual. */}
          <h3 className="line-clamp-2 min-h-[2.5rem] text-base font-bold leading-tight text-slate-900">
            {title}
          </h3>
          <div className="mt-2 space-y-1.5 text-sm text-slate-600">
            <p className="flex items-center gap-1.5">
              <MapPinIcon className="h-4 w-4 shrink-0 text-slate-400" />
              <span className="truncate">
                {report.city}
                {report.neighborhood ? ` · ${report.neighborhood}` : ''}
              </span>
            </p>
            <p className="flex items-center gap-1.5">
              <ClockIcon className="h-4 w-4 shrink-0 text-slate-400" />
              <span className="truncate">Publicado {formatRelative(report.createdAt)}</span>
            </p>
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3">
          <KindBadge kind={report.kind} />
          <Link
            to={`/reportes/${report.id}`}
            className="inline-flex min-h-[44px] shrink-0 items-center rounded-xl bg-brand-800 px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-900"
          >
            Ver detalles
          </Link>
        </div>
      </div>
    </article>
  );
}
