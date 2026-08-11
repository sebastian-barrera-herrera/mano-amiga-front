import { useEffect, useState, type FormEvent } from 'react';
import { Alert } from '../components/Alert';
import { Button } from '../components/Button';
import { Select, TextArea, TextInput } from '../components/Field';
import { EmptyState, SkeletonCards } from '../components/Feedback';
import { FilterChip } from '../components/FilterChip';
import { MegaphoneIcon, TrashIcon } from '../components/Icons';
import { Pagination } from '../components/Pagination';
import { api, ApiError } from '../lib/api';
import { CATEGORY_EMOJI, CATEGORY_LABEL, formatRelative } from '../lib/format';
import { contactStorage } from '../lib/storage';
import { MESSAGE_CATEGORIES, type CommunityMessage, type MessageCategory, type Paginated } from '../types';

const CATEGORY_OPTIONS = MESSAGE_CATEGORIES.map((category) => CATEGORY_LABEL[category]);
const LABEL_TO_CATEGORY = Object.fromEntries(
  MESSAGE_CATEGORIES.map((category) => [CATEGORY_LABEL[category], category]),
) as Record<string, MessageCategory>;

export default function CommunityPage() {
  const [data, setData] = useState<Paginated<CommunityMessage> | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState<MessageCategory | ''>('');
  const [cityInput, setCityInput] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  // Se espera a que la persona termine de escribir antes de consultar la API.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setCityFilter(cityInput.trim());
      setPage(1);
    }, 400);
    return () => window.clearTimeout(timer);
  }, [cityInput]);

  const [form, setForm] = useState(() => ({
    city: contactStorage.read().city ?? '',
    content: '',
    categoryLabel: CATEGORY_LABEL.info,
    authorName: contactStorage.read().contactName ?? '',
    contact: '',
  }));
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setLoadError(null);
    api
      .listMessages(
        { page, limit: 20, category: categoryFilter || undefined, city: cityFilter || undefined },
        controller.signal,
      )
      .then(setData)
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setLoadError(error instanceof ApiError ? error.message : 'No pudimos cargar los mensajes.');
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [page, categoryFilter, cityFilter, reloadKey]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const errors: Record<string, string> = {};
    if (form.city.trim().length < 2) errors.city = 'Escribe la ciudad.';
    if (form.content.trim().length < 10) errors.content = 'Escribe al menos 10 caracteres.';
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmitError(null);
    setSubmitting(true);
    try {
      await api.createMessage({
        city: form.city.trim(),
        content: form.content.trim(),
        category: LABEL_TO_CATEGORY[form.categoryLabel] ?? 'info',
        authorName: form.authorName.trim() || undefined,
        contact: form.contact.trim() || undefined,
      });
      contactStorage.save({ ...contactStorage.read(), city: form.city.trim() });
      setForm((current) => ({ ...current, content: '', contact: '' }));
      setSubmitted(true);
      setPage(1);
      setReloadKey((key) => key + 1);
    } catch (error) {
      setSubmitError(
        error instanceof ApiError ? error.message : 'No pudimos publicar el mensaje. Intenta de nuevo.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('¿Eliminar este mensaje?')) return;
    try {
      await api.deleteMessage(id);
      setReloadKey((key) => key + 1);
    } catch (error) {
      setLoadError(error instanceof ApiError ? error.message : 'No pudimos eliminar el mensaje.');
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">Mensajes comunitarios</h1>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
          Comparte información que le sirva a otras personas: dónde hay agua potable, refugios
          abiertos, medicamentos, o dónde se necesitan voluntarios.
        </p>
      </header>

      <section className="card p-5 sm:p-6" aria-labelledby="publicar">
        <h2 id="publicar" className="mb-4 text-base font-bold text-slate-900">
          Publicar un mensaje
        </h2>

        {submitted && (
          <Alert tone="success" className="mb-4">
            ¡Gracias! Tu mensaje ya está publicado en el muro.
          </Alert>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <TextArea
            id="content"
            label="Mensaje"
            required
            rows={4}
            maxLength={1000}
            value={form.content}
            error={formErrors.content}
            placeholder="Hay agua potable en el parque de La Fachada, de 7am a 6pm. Llevar recipientes."
            onChange={(event) => setForm({ ...form, content: event.target.value })}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput
              id="city"
              label="Ciudad"
              required
              value={form.city}
              error={formErrors.city}
              placeholder="Armenia"
              autoComplete="address-level2"
              onChange={(event) => setForm({ ...form, city: event.target.value })}
            />
            <Select
              id="category"
              label="Categoría"
              options={CATEGORY_OPTIONS}
              value={form.categoryLabel}
              onChange={(event) => setForm({ ...form, categoryLabel: event.target.value })}
            />
            <TextInput
              id="authorName"
              label="Tu nombre (opcional)"
              value={form.authorName}
              placeholder="Puedes publicar de forma anónima"
              onChange={(event) => setForm({ ...form, authorName: event.target.value })}
            />
            <TextInput
              id="contact"
              label="Contacto (opcional)"
              value={form.contact}
              placeholder="Teléfono o correo"
              onChange={(event) => setForm({ ...form, contact: event.target.value })}
            />
          </div>

          {submitError && <Alert tone="error">{submitError}</Alert>}

          <Button type="submit" size="lg" fullWidth loading={submitting}>
            {submitting ? 'Publicando…' : 'Publicar en el muro'}
          </Button>
        </form>
      </section>

      <section aria-labelledby="muro" className="space-y-4">
        <h2 id="muro" className="text-base font-bold text-slate-900">
          Últimos mensajes
        </h2>

        <div className="-mx-4 overflow-x-auto px-4">
          <div className="flex gap-2 pb-1">
            <FilterChip
              label="Todos"
              active={categoryFilter === ''}
              onClick={() => {
                setCategoryFilter('');
                setPage(1);
              }}
            />
            {MESSAGE_CATEGORIES.map((category) => (
              <FilterChip
                key={category}
                label={`${CATEGORY_EMOJI[category]} ${CATEGORY_LABEL[category]}`}
                active={categoryFilter === category}
                onClick={() => {
                  setCategoryFilter(category);
                  setPage(1);
                }}
              />
            ))}
          </div>
        </div>

        <input
          type="search"
          value={cityInput}
          onChange={(event) => setCityInput(event.target.value)}
          placeholder="Filtrar por ciudad…"
          aria-label="Filtrar mensajes por ciudad"
          className="field-control"
        />

        {loadError && <Alert tone="error">{loadError}</Alert>}
        {loading && <SkeletonCards count={3} />}

        {!loading && data && data.items.length === 0 && (
          <EmptyState
            icon={<MegaphoneIcon className="h-7 w-7" />}
            title="Todavía no hay mensajes"
            description="Sé la primera persona en compartir información útil para tu ciudad."
          />
        )}

        {!loading && data && data.items.length > 0 && (
          <>
            <ul className="space-y-3">
              {data.items.map((message) => (
                <li key={message.id} className="card p-4 sm:p-5">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-800">
                      <span aria-hidden="true">{CATEGORY_EMOJI[message.category]}</span>
                      {CATEGORY_LABEL[message.category]}
                    </span>
                    <span className="font-semibold text-slate-800">{message.city}</span>
                    <span className="text-slate-400">·</span>
                    <span className="text-slate-500">{formatRelative(message.createdAt)}</span>
                  </div>

                  <p className="mt-2.5 whitespace-pre-line leading-relaxed text-slate-800">
                    {message.content}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-500">
                    <span>{message.authorName ? `Por ${message.authorName}` : 'Publicado de forma anónima'}</span>
                    {message.contact && (
                      <span className="font-medium text-slate-700">{message.contact}</span>
                    )}
                  </div>

                  {message.isMine && (
                    <button
                      type="button"
                      onClick={() => void handleDelete(message.id)}
                      className="mt-3 inline-flex min-h-[44px] items-center gap-2 rounded-xl px-3 text-sm font-medium text-rojo-700 hover:bg-rojo-50"
                    >
                      <TrashIcon className="h-4 w-4" />
                      Eliminar
                    </button>
                  )}
                </li>
              ))}
            </ul>
            <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} />
          </>
        )}
      </section>
    </div>
  );
}
