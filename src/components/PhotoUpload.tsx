import { useRef, useState } from 'react';
import { optimizedImage } from '../lib/image';
import { uploadPhoto, type UploadedPhoto } from '../lib/uploads';
import { Alert } from './Alert';
import { CameraIcon, TrashIcon } from './Icons';

interface PhotoUploadProps {
  value: UploadedPhoto | null;
  onChange: (photo: UploadedPhoto | null) => void;
  enabled: boolean;
  help?: string;
}

export function PhotoUpload({ value, onChange, enabled, help }: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    setProgress(0);
    try {
      onChange(await uploadPhoto(file, setProgress));
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'No pudimos subir la foto.');
    } finally {
      setProgress(null);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  if (!enabled) {
    return (
      <Alert tone="info">
        Las fotos no están disponibles en este momento. Puedes publicar el reporte igual: describe
        con detalle la apariencia en el campo de descripción.
      </Alert>
    );
  }

  return (
    <div>
      <span className="field-label">Foto</span>

      {value ? (
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <img
            src={optimizedImage(value.url, 800) ?? value.url}
            alt="Foto del reporte"
            className="max-h-72 w-full object-cover"
          />
          <div className="flex items-center justify-between gap-3 bg-slate-50 px-4 py-3">
            <span className="text-sm text-brand-800">Foto lista</span>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl px-3 text-sm font-medium text-rojo-700 hover:bg-rojo-50"
            >
              <TrashIcon className="h-4 w-4" />
              Quitar
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={progress !== null}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-slate-600 transition-colors hover:border-brand-400 hover:bg-brand-50 disabled:opacity-60"
        >
          <CameraIcon className="h-8 w-8 text-brand-800" />
          <span className="text-sm font-semibold">
            {progress === null ? 'Tomar o elegir una foto' : `Subiendo… ${progress}%`}
          </span>
          <span className="text-xs text-slate-500">JPG o PNG · se optimiza automáticamente</span>
        </button>
      )}

      {progress !== null && (
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full bg-brand-800 transition-all"
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      )}

      {help && !error && <p className="mt-1.5 text-xs text-slate-500">{help}</p>}
      {error && (
        <p className="mt-2 text-sm font-medium text-rojo-600" role="alert">
          {error}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => void handleFile(event.target.files?.[0])}
      />
    </div>
  );
}
