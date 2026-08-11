import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HandHeartIcon,
  ListIcon,
  MegaphoneIcon,
  PawIcon,
  PersonSearchIcon,
} from '../components/Icons';
import { api } from '../lib/api';
import type { ReportStats } from '../types';

const ACTIONS = [
  {
    to: '/reportar/persona-desaparecida',
    title: 'Reportar persona desaparecida',
    description: 'Publica sus datos para que la comunidad ayude a buscarla.',
    icon: PersonSearchIcon,
    tone: 'rojo' as const,
  },
  {
    to: '/reportar/mascota-perdida',
    title: 'Reportar mascota perdida',
    description: 'Comparte su foto y dónde se perdió.',
    icon: PawIcon,
    tone: 'rojo' as const,
  },
  {
    to: '/reportar/persona-encontrada',
    title: 'Reportar persona encontrada',
    description: 'Ayuda a que su familia sepa que está a salvo.',
    icon: HandHeartIcon,
    tone: 'gold' as const,
  },
  {
    to: '/reportar/mascota-encontrada',
    title: 'Reportar mascota encontrada',
    description: 'Publica dónde está para que la reconozcan.',
    icon: PawIcon,
    tone: 'gold' as const,
  },
  {
    to: '/reportes',
    title: 'Ver reportes',
    description: 'Busca por nombre o ciudad entre todas las publicaciones.',
    icon: ListIcon,
    tone: 'brand' as const,
  },
  {
    to: '/muro',
    title: 'Mensajes comunitarios',
    description: 'Agua, refugios, voluntarios y ayuda disponible.',
    icon: MegaphoneIcon,
    tone: 'brand' as const,
  },
];

// Rojo para buscar, amarillo para los hallazgos, azul para consultar.
const TONE_STYLES = {
  rojo: 'bg-rojo-50 text-rojo-700 group-hover:bg-rojo-100',
  gold: 'bg-gold-100 text-gold-700 group-hover:bg-gold-200',
  brand: 'bg-brand-50 text-brand-800 group-hover:bg-brand-100',
};

export default function HomePage() {
  const [stats, setStats] = useState<ReportStats | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    // Las cifras son un extra: si fallan, la página sigue siendo utilizable.
    api.getStats(controller.signal).then(setStats).catch(() => undefined);
    return () => controller.abort();
  }, []);

  return (
    <div className="space-y-8">
      <section className="card overflow-hidden">
        <div className="franja-bandera" role="presentation" />
        <div className="px-5 py-8 sm:px-8 sm:py-10">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-800">
            Ayuda ciudadana · Colombia
          </p>
          <h1 className="mt-2 text-3xl font-extrabold leading-tight text-slate-900 sm:text-4xl">
            Reunamos a las familias que el terremoto separó
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600">
            ManoAmiga es un espacio abierto para reportar personas y mascotas desaparecidas, avisar
            sobre quienes ya fueron encontrados y compartir información útil. No necesitas cuenta ni
            datos personales: publicar toma menos de un minuto.
          </p>

          {stats && stats.total > 0 && (
            <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3 border-t border-slate-100 pt-5 text-sm">
              <div>
                <dt className="text-slate-500">Personas buscadas</dt>
                <dd className="text-xl font-bold text-rojo-700">{stats.personsMissing}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Mascotas buscadas</dt>
                <dd className="text-xl font-bold text-rojo-700">{stats.petsMissing}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Hallazgos publicados</dt>
                <dd className="text-xl font-bold text-gold-700">
                  {stats.personsFound + stats.petsFound}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Casos cerrados</dt>
                <dd className="text-xl font-bold text-brand-800">{stats.resolved}</dd>
              </div>
            </dl>
          )}
        </div>
      </section>

      <section aria-labelledby="acciones">
        <h2 id="acciones" className="mb-4 text-lg font-bold text-slate-900">
          ¿Qué necesitas hacer?
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {ACTIONS.map(({ to, title, description, icon: Icon, tone }) => (
            <Link
              key={to}
              to={to}
              className="card group flex items-center gap-4 px-4 py-5 transition-shadow hover:shadow-lg"
            >
              <span
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl transition-colors ${TONE_STYLES[tone]}`}
              >
                <Icon className="h-7 w-7" />
              </span>
              <span className="min-w-0">
                <span className="block text-base font-bold leading-snug text-slate-900">
                  {title}
                </span>
                <span className="mt-0.5 block text-sm text-slate-600">{description}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-rojo-200 bg-rojo-50 px-5 py-5">
        <h2 className="text-base font-bold text-rojo-900">Números de emergencia en Colombia</h2>
        <ul className="mt-3 grid gap-2 text-sm text-rojo-900 sm:grid-cols-3">
          <li>
            <a href="tel:123" className="font-semibold underline">
              123
            </a>{' '}
            · Emergencias
          </li>
          <li>
            <a href="tel:132" className="font-semibold underline">
              132
            </a>{' '}
            · Cruz Roja
          </li>
          <li>
            <a href="tel:119" className="font-semibold underline">
              119
            </a>{' '}
            · Bomberos
          </li>
        </ul>
        <p className="mt-3 text-xs leading-relaxed text-rojo-800">
          ManoAmiga no reemplaza a las autoridades. Si hay riesgo para la vida de alguien, llama
          primero a la línea de emergencias.
        </p>
      </section>
    </div>
  );
}
