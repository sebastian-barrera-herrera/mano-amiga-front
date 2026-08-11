import { api } from './api';
import { compressImage } from './image';

export interface UploadedPhoto {
  url: string;
  publicId: string;
}

const MAX_BYTES = 10 * 1024 * 1024;

/**
 * Sube la foto directamente a Cloudinary con una firma emitida por el backend.
 * Se usa XMLHttpRequest porque `fetch` no informa del progreso de subida.
 */
export async function uploadPhoto(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<UploadedPhoto> {
  if (file.size > MAX_BYTES) {
    throw new Error('La foto es demasiado grande (máximo 10 MB).');
  }

  const compressed = await compressImage(file);
  const signature = await api.uploadSignature();

  const form = new FormData();
  form.append('file', compressed);
  form.append('api_key', signature.apiKey);
  form.append('timestamp', String(signature.timestamp));
  form.append('folder', signature.folder);
  form.append('signature', signature.signature);

  return new Promise<UploadedPhoto>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', signature.uploadUrl);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      try {
        const payload = JSON.parse(xhr.responseText) as {
          secure_url?: string;
          public_id?: string;
          error?: { message?: string };
        };
        if (xhr.status >= 200 && xhr.status < 300 && payload.secure_url && payload.public_id) {
          resolve({ url: payload.secure_url, publicId: payload.public_id });
        } else {
          reject(new Error(payload.error?.message ?? 'No pudimos subir la foto.'));
        }
      } catch {
        reject(new Error('No pudimos subir la foto.'));
      }
    };

    xhr.onerror = () => reject(new Error('Se interrumpió la subida de la foto.'));
    xhr.send(form);
  });
}
