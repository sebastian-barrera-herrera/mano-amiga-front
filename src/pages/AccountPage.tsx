import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Alert } from '../components/Alert';
import { Button, ButtonLink } from '../components/Button';
import { TextInput } from '../components/Field';
import { GoogleSignIn } from '../components/GoogleSignIn';
import { useAuth } from '../context/AuthContext';
import { api, ApiError } from '../lib/api';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() ?? '';

export default function AccountPage() {
  const { user, signIn, signOut } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({ email: '', password: '', name: '' });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [googleEnabled, setGoogleEnabled] = useState(false);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    const controller = new AbortController();
    // El backend confirma que también tiene configurado el Client ID.
    api
      .authProviders(controller.signal)
      .then(({ google }) => setGoogleEnabled(google))
      .catch(() => setGoogleEnabled(false));
    return () => controller.abort();
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const result =
        mode === 'login'
          ? await api.login({ email: form.email.trim(), password: form.password })
          : await api.register({
              email: form.email.trim(),
              password: form.password,
              name: form.name.trim() || undefined,
            });
      signIn(result);
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : 'No pudimos completar la acción. Intenta de nuevo.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogle(credential: string) {
    setError(null);
    try {
      signIn(await api.loginWithGoogle(credential));
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : 'No pudimos iniciar sesión con Google.',
      );
    }
  }

  if (user) {
    return (
      <div className="mx-auto max-w-md space-y-5">
        <header>
          <h1 className="text-2xl font-extrabold text-slate-900">Mi cuenta</h1>
          <p className="mt-1.5 text-sm text-slate-600">
            Sesión activa como <strong className="font-semibold">{user.email}</strong>
          </p>
        </header>

        <div className="card space-y-3 p-5">
          <ButtonLink to="/mis-publicaciones" size="lg" fullWidth>
            Ver mis publicaciones
          </ButtonLink>
          <Button variant="secondary" size="lg" fullWidth onClick={signOut}>
            Cerrar sesión
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md space-y-5">
      <header>
        <h1 className="text-2xl font-extrabold text-slate-900">
          {mode === 'login' ? 'Iniciar sesión' : 'Crear una cuenta'}
        </h1>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
          Iniciar sesión es <strong className="font-semibold">opcional</strong>. Sólo hace falta si
          quieres editar, cerrar o eliminar tus publicaciones más adelante.
        </p>
      </header>

      <Alert tone="info">
        Puedes reportar y consultar todo sin cuenta.{' '}
        <Link to="/" className="font-semibold underline">
          Ir al inicio
        </Link>
      </Alert>

      <div className="card space-y-5 p-5 sm:p-6">
        {googleEnabled && (
          <>
            <GoogleSignIn
              clientId={GOOGLE_CLIENT_ID}
              onCredential={(credential) => void handleGoogle(credential)}
            />
            <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-slate-400">
              <span className="h-px flex-1 bg-slate-200" />o con tu correo
              <span className="h-px flex-1 bg-slate-200" />
            </div>
          </>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <TextInput
              id="name"
              label="Tu nombre"
              value={form.name}
              autoComplete="name"
              onChange={(event) => setForm({ ...form, name: event.target.value })}
            />
          )}

          <TextInput
            id="email"
            label="Correo"
            type="email"
            required
            value={form.email}
            autoComplete="email"
            placeholder="nombre@correo.com"
            onChange={(event) => setForm({ ...form, email: event.target.value })}
          />

          <TextInput
            id="password"
            label="Contraseña"
            type="password"
            required
            minLength={mode === 'register' ? 8 : undefined}
            value={form.password}
            autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
            help={mode === 'register' ? 'Mínimo 8 caracteres.' : undefined}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
          />

          {error && <Alert tone="error">{error}</Alert>}

          <Button type="submit" size="lg" fullWidth loading={submitting}>
            {mode === 'login' ? 'Entrar' : 'Crear cuenta'}
          </Button>
        </form>

        <p className="text-center text-sm text-slate-600">
          {mode === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}{' '}
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login');
              setError(null);
            }}
            className="font-semibold text-brand-800 underline"
          >
            {mode === 'login' ? 'Regístrate' : 'Inicia sesión'}
          </button>
        </p>
      </div>
    </div>
  );
}
