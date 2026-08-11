import { api, API_BASE_URL, tokenStorage } from './api';
import { compressImage } from './image';
import type { UploadMode } from '../types';

export interface UploadedPhoto {
  url: string;
  publicId: string;
}

const MAX_BYTES = 4 * 1024 * 1024;

/**
 * Sube la foto donde diga la API: al CDN de Cloudinary si está configurado, o a
 * la propia base de datos si no. Se usa XMLHttpRequest porque `fetch` no informa
 * del progreso de subida, y en una red móvil saturada esa barra importa.
 */
export async function uploadPhoto(
  file: File,
  mode: UploadMode,
  onProgress?: (percent: number) => void,
): Promise<UploadedPhoto> {
  const compressed = await compressImage(file);
  if (compressed.size > MAX_BYTES) {
    throw new Error('La foto es demasiado grande. Intenta con una imagen más pequeña.');
  }

  return mode === 'cloudinary'
    ? uploadToCloudinary(compressed, onProgress)
    : uploadToDatabase(compressed, onProgress);
}

async function uploadToCloudinary(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<UploadedPhoto> {
  const signature = await api.uploadSignature();

  const form = new FormData();
  form.append('file', file);
  form.append('api_key', signature.apiKey);
  form.append('timestamp', String(signature.timestamp));
  form.append('folder', signature.folder);
  form.append('signature', signature.signature);

  const payload = await send<{ secure_url?: string; public_id?: string; error?: { message?: string } }>(
    signature.uploadUrl,
    form,
    undefined,
    onProgress,
  );

  if (!payload.secure_url || !payload.public_id) {
    throw new Error(payload.error?.message ?? 'No pudimos subir la foto.');
  }
  return { url: payload.secure_url, publicId: payload.public_id };
}

async function uploadToDatabase(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<UploadedPhoto> {
  const payload = await send<UploadedPhoto & { message?: string }>(
    `${API_BASE_URL}/photos`,
    file,
    file.type || 'image/jpeg',
    onProgress,
  );

  if (!payload.url || !payload.publicId) {
    throw new Error(payload.message ?? 'No pudimos subir la foto.');
  }
  return { url: payload.url, publicId: payload.publicId };
}

function send<T>(
  url: string,
  body: FormData | File,
  contentType: string | undefined,
  onProgress?: (percent: number) => void,
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    if (contentType) xhr.setRequestHeader('Content-Type', contentType);

    const token = tokenStorage.get();
    // Sólo se envía la sesión a nuestra API, nunca a un tercero.
    if (token && url.startsWith(API_BASE_URL)) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    }

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      try {
        const payload = JSON.parse(xhr.responseText) as T & { message?: string };
        if (xhr.status >= 200 && xhr.status < 300) resolve(payload);
        else reject(new Error(payload.message ?? 'No pudimos subir la foto.'));
      } catch {
        reject(new Error('No pudimos subir la foto.'));
      }
    };

    xhr.onerror = () => reject(new Error('Se interrumpió la subida de la foto.'));
    xhr.send(body);
  });
}
