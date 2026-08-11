const MAX_SIDE = 1280;
const QUALITY = 0.78;

/**
 * Reduce la foto en el navegador antes de subirla. Con conexiones móviles
 * saturadas la diferencia entre 4 MB y 200 KB decide si el reporte se publica.
 * Si algo falla, se devuelve el archivo original.
 */
export async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith('image/') || file.type === 'image/gif') return file;

  try {
    const bitmap = await loadBitmap(file);
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) return file;
    context.drawImage(bitmap, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', QUALITY),
    );
    if (!blob || blob.size >= file.size) return file;

    return new File([blob], replaceExtension(file.name), { type: 'image/jpeg' });
  } catch {
    return file;
  }
}

async function loadBitmap(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if ('createImageBitmap' in window) {
    try {
      return await createImageBitmap(file);
    } catch {
      /* algunos navegadores fallan con ciertos JPEG: se usa <img> */
    }
  }

  const url = URL.createObjectURL(file);
  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('No se pudo leer la imagen'));
      image.src = url;
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

function replaceExtension(name: string): string {
  return `${name.replace(/\.[^.]+$/, '')}.jpg`;
}

/**
 * Pide a Cloudinary una versión optimizada y del tamaño justo, sin coste extra:
 * las transformaciones viajan en la propia URL.
 */
export function optimizedImage(url: string | null, width: number): string | null {
  if (!url) return null;
  return url.replace('/upload/', `/upload/f_auto,q_auto,c_limit,w_${width}/`);
}
