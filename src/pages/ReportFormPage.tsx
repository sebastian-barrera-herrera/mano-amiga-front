import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Alert } from '../components/Alert';
import { Button } from '../components/Button';
import { Select, TextArea, TextInput } from '../components/Field';
import { Spinner } from '../components/Feedback';
import { ArrowLeftIcon } from '../components/Icons';
import { PhotoUpload } from '../components/PhotoUpload';
import { useAuth } from '../context/AuthContext';
import { api, ApiError } from '../lib/api';
import { toDateTimeLocal } from '../lib/format';
import { getFormConfig, variantFor, type FieldDef, type ReportFormConfig } from '../lib/reportForms';
import { contactStorage } from '../lib/storage';
import type { UploadedPhoto } from '../lib/uploads';
import type { Report, ReportInput } from '../types';

type Values = Record<string, string>;

export default function ReportFormPage() {
  const { variant, id } = useParams<{ variant?: string; id?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditing = Boolean(id);

  const [config, setConfig] = useState<ReportFormConfig | null>(() => getFormConfig(variant));
  const [values, setValues] = useState<Values>({});
  const [photo, setPhoto] = useState<UploadedPhoto | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(isEditing);
  const [uploadsEnabled, setUploadsEnabled] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    api
      .uploadStatus(controller.signal)
      .then(({ enabled }) => setUploadsEnabled(enabled))
      .catch(() => setUploadsEnabled(false));
    return () => controller.abort();
  }, []);

  // Creación: se precargan los datos de contacto guardados en el dispositivo.
  useEffect(() => {
    if (isEditing) return;
    const nextConfig = getFormConfig(variant);
    setConfig(nextConfig);
    const saved = contactStorage.read();
    setValues({
      contactName: saved.contactName ?? user?.name ?? '',
      contactEmail: saved.contactEmail ?? user?.email ?? '',
      contactPhone: saved.contactPhone ?? '',
      city: saved.city ?? '',
    });
    setPhoto(null);
    setErrors({});
  }, [variant, isEditing, user]);

  // Edición: se cargan los valores actuales del reporte.
  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();
    setLoading(true);
    api
      .getReport(id, controller.signal)
      .then((report) => {
        setConfig(getFormConfig(variantFor(report.kind, report.status)));
        setValues(reportToValues(report));
        setPhoto(report.photoUrl ? { url: report.photoUrl, publicId: '' } : null);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setSubmitError(error instanceof ApiError ? error.message : 'No pudimos cargar el reporte.');
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [id]);

  const fields = useMemo(
    () => config?.sections.flatMap((section) => section.fields) ?? [],
    [config],
  );

  if (!config && !loading) {
    return (
      <Alert tone="error">
        Ese formulario no existe.{' '}
        <Link to="/" className="font-semibold underline">
          Volver al inicio
        </Link>
        .
      </Alert>
    );
  }

  if (loading || !config) return <Spinner label="Cargando formulario…" />;

  function setValue(name: string, value: string) {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => {
      if (!current[name]) return current;
      const { [name]: _removed, ...rest } = current;
      return rest;
    });
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!config) return;

    const validation = validate(fields, values);
    setErrors(validation);
    if (Object.keys(validation).length > 0) {
      setSubmitError('Revisa los campos marcados en rojo.');
      // Tras el repintado, se lleva el foco al primer campo con error.
      window.setTimeout(
        () => document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(),
        0,
      );
      return;
    }

    setSubmitError(null);
    setSubmitting(true);
    try {
      const payload = buildPayload(config, values, photo);
      const report =
        isEditing && id
          ? await api.updateReport(id, {
              ...payload,
              // En edición se envía `null` explícito para poder quitar la foto.
              photoUrl: photo?.url ?? null,
              photoPublicId: photo?.publicId || null,
            })
          : await api.createReport(payload);

      contactStorage.save({
        contactName: payload.contactName,
        contactEmail: payload.contactEmail,
        contactPhone: payload.contactPhone,
        city: payload.city,
      });

      navigate(`/reportes/${report.id}`, {
        replace: true,
        state: { justPublished: !isEditing, justUpdated: isEditing },
      });
    } catch (error) {
      setSubmitError(
        error instanceof ApiError ? error.message : 'No pudimos guardar el reporte. Intenta de nuevo.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  const accentButton = config.accent === 'gold' ? 'gold' : 'primary';

  return (
    <div className="mx-auto max-w-2xl">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-4 inline-flex min-h-[44px] items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
      >
        <ArrowLeftIcon className="h-5 w-5" />
        Volver
      </button>

      <header className="mb-6">
        <h1 className="text-2xl font-extrabold leading-tight text-slate-900 sm:text-3xl">
          {isEditing ? 'Editar reporte' : config.title}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{config.subtitle}</p>
      </header>

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        {config.sections.map((section) => (
          <fieldset key={section.legend} className="card px-4 py-5 sm:px-6">
            <legend className="mb-4 text-base font-bold text-slate-900">{section.legend}</legend>
            <div className="space-y-4">
              {section.fields.map((field) => (
                <FormField
                  key={field.name}
                  field={field}
                  value={values[field.name] ?? ''}
                  error={errors[field.name]}
                  onChange={(value) => setValue(field.name, value)}
                />
              ))}
            </div>
          </fieldset>
        ))}

        <fieldset className="card px-4 py-5 sm:px-6">
          <legend className="mb-4 text-base font-bold text-slate-900">Foto</legend>
          <PhotoUpload
            value={photo}
            onChange={setPhoto}
            enabled={uploadsEnabled}
            help={config.photoHelp}
          />
        </fieldset>

        {submitError && <Alert tone="error">{submitError}</Alert>}

        <div className="sticky bottom-20 z-10 md:bottom-4">
          <Button type="submit" variant={accentButton} size="lg" fullWidth loading={submitting}>
            {submitting ? 'Guardando…' : isEditing ? 'Guardar cambios' : config.submitLabel}
          </Button>
        </div>

        <p className="pb-2 text-center text-xs leading-relaxed text-slate-500">
          Al publicar, tu nombre y datos de contacto quedan visibles para quien vea el reporte.
          Comparte sólo la información que sea necesaria para ayudar.
        </p>
      </form>
    </div>
  );
}

interface FormFieldProps {
  field: FieldDef;
  value: string;
  error?: string;
  onChange: (value: string) => void;
}

function FormField({ field, value, error, onChange }: FormFieldProps) {
  const common = {
    id: field.name,
    label: field.label,
    required: field.required,
    help: field.help,
    error,
    value,
    onChange: (event: { target: { value: string } }) => onChange(event.target.value),
  };

  if (field.type === 'textarea') {
    return <TextArea {...common} placeholder={field.placeholder} maxLength={field.maxLength} />;
  }

  if (field.type === 'select') {
    return <Select {...common} options={field.options ?? []} placeholder={field.placeholder} />;
  }

  const inputType = {
    text: 'text',
    number: 'number',
    email: 'email',
    tel: 'tel',
    datetime: 'datetime-local',
  }[field.type];

  return (
    <TextInput
      {...common}
      type={inputType}
      placeholder={field.placeholder}
      autoComplete={field.autoComplete}
      inputMode={field.type === 'number' ? 'numeric' : undefined}
      max={field.type === 'datetime' ? toDateTimeLocal(new Date().toISOString()) : undefined}
      maxLength={field.maxLength}
    />
  );
}

function validate(fields: FieldDef[], values: Values): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const field of fields) {
    const value = (values[field.name] ?? '').trim();
    if (field.required && !value) {
      errors[field.name] = 'Este campo es obligatorio.';
      continue;
    }
    if (!value) continue;

    if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      errors[field.name] = 'Escribe un correo válido.';
    }
    if (field.type === 'number') {
      const parsed = Number(value);
      if (!Number.isInteger(parsed) || parsed < 0 || parsed > 120) {
        errors[field.name] = 'Escribe una edad entre 0 y 120.';
      }
    }
    if (field.type === 'tel' && value.replace(/\D/g, '').length < 7) {
      errors[field.name] = 'Escribe un teléfono válido.';
    }
  }

  const hasContact = Boolean(values.contactEmail?.trim() || values.contactPhone?.trim());
  if (!hasContact) {
    errors.contactPhone = 'Indica al menos un correo o un teléfono.';
  }

  return errors;
}

function buildPayload(
  config: ReportFormConfig,
  values: Values,
  photo: UploadedPhoto | null,
): ReportInput {
  const text = (name: string): string | undefined => values[name]?.trim() || undefined;
  const age = values.approxAge?.trim();

  return {
    kind: config.kind,
    status: config.status,
    name: text('name'),
    city: values.city.trim(),
    neighborhood: text('neighborhood'),
    locationDetail: text('locationDetail'),
    eventAt: values.eventAt ? new Date(values.eventAt).toISOString() : undefined,
    description: text('description'),
    approxAge: age ? Number(age) : undefined,
    clothing: text('clothing'),
    healthStatus: text('healthStatus'),
    species: text('species'),
    color: text('color'),
    photoUrl: photo?.url,
    photoPublicId: photo?.publicId || undefined,
    contactName: values.contactName.trim(),
    contactEmail: text('contactEmail'),
    contactPhone: text('contactPhone'),
  };
}

function reportToValues(report: Report): Values {
  return {
    name: report.name ?? '',
    city: report.city,
    neighborhood: report.neighborhood ?? '',
    locationDetail: report.locationDetail ?? '',
    eventAt: toDateTimeLocal(report.eventAt),
    description: report.description ?? '',
    approxAge: report.approxAge?.toString() ?? '',
    clothing: report.clothing ?? '',
    healthStatus: report.healthStatus ?? '',
    species: report.species ?? '',
    color: report.color ?? '',
    contactName: report.contactName,
    contactEmail: report.contactEmail ?? '',
    contactPhone: report.contactPhone ?? '',
  };
}
