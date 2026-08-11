import { Suspense, useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner } from './Feedback';
import { HomeIcon, ListIcon, MegaphoneIcon, UserIcon } from './Icons';

const NAV_ITEMS = [
  { to: '/', label: 'Inicio', icon: HomeIcon },
  { to: '/reportes', label: 'Reportes', icon: ListIcon },
  { to: '/muro', label: 'Muro', icon: MegaphoneIcon },
  { to: '/cuenta', label: 'Cuenta', icon: UserIcon },
];

export function AppLayout() {
  const { pathname } = useLocation();
  const { user } = useAuth();

  // Cada navegación empieza arriba: en móvil es lo que se espera.
  // El cuerpo va entre llaves a propósito: con `() => window.scrollTo(0, 0)`,
  // React tomaría el valor devuelto como función de limpieza, y basta con una
  // extensión del navegador que envuelva scrollTo y devuelva algo para que
  // reviente al navegar.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:shadow"
      >
        Saltar al contenido
      </a>

      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="franja-bandera" role="presentation" />
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/icon.svg" alt="" className="h-9 w-9" />
            <span className="text-lg font-extrabold tracking-tight text-slate-900">
              Mano<span className="text-brand-800">Amiga</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Navegación principal">
            {NAV_ITEMS.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
                    isActive ? 'bg-brand-50 text-brand-800' : 'text-slate-600 hover:bg-slate-100'
                  }`
                }
              >
                {label === 'Cuenta' && user ? 'Mi cuenta' : label}
              </NavLink>
            ))}
          </nav>

          <Link
            to="/cuenta"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 md:hidden"
            aria-label={user ? 'Mi cuenta' : 'Iniciar sesión'}
          >
            <UserIcon className="h-5 w-5" />
          </Link>
        </div>
      </header>

      <main id="contenido" className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 pb-28 md:pb-12">
        <Suspense fallback={<Spinner />}>
          <Outlet />
        </Suspense>
      </main>

      <footer className="hidden border-t border-slate-200 bg-white px-4 py-6 md:block">
        <div className="mx-auto max-w-5xl text-center text-sm text-slate-500">
          <p>
            ManoAmiga es una iniciativa ciudadana y gratuita. En una emergencia, llama primero al{' '}
            <a href="tel:123" className="font-semibold text-brand-800 underline">
              123
            </a>
            .
          </p>
        </div>
      </footer>

      <nav
        className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white md:hidden"
        aria-label="Navegación principal"
      >
        <ul className="mx-auto flex max-w-md">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <li key={to} className="flex-1">
              <NavLink
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `flex min-h-[60px] flex-col items-center justify-center gap-1 text-xs font-semibold transition-colors ${
                    isActive ? 'text-brand-800' : 'text-slate-500'
                  }`
                }
              >
                <Icon className="h-6 w-6" />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
