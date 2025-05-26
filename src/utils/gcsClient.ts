import { Storage } from '@google-cloud/storage';
import path from 'path';

// Inicializar Storage solo una vez
const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
  keyFilename: path.join(__dirname, '../../keystorage.json'),
});

const bucket = storage.bucket(process.env.GCP_BUCKET_NAME!);

/**
 * Extrae la ruta relativa dentro del bucket desde una URL pública de GCS
 * @param publicUrl URL pública del archivo en GCS
 * @returns ruta relativa del archivo dentro del bucket
 */
export const getGCSFilePath = (publicUrl: string): string => {
  const url = new URL(publicUrl);
  return url.pathname.replace(`/${bucket.name}/`, '');
};

/**
 * Elimina uno o varios archivos del bucket
 * @param filePaths Array de rutas relativas dentro del bucket a eliminar
 */
export const deleteFiles = async (filePaths: string[]) => {
  const failedDeletes: string[] = [];

  for (const filePath of filePaths) {
    try {
      const file = bucket.file(filePath);
      const [exists] = await file.exists();
      if (exists) {
        await file.delete();
        console.log(`Archivo eliminado en GCS: ${filePath}`);
      } else {
        console.warn(`Archivo no encontrado en GCS: ${filePath}`);
      }
    } catch (error) {
      console.error(`Error al eliminar archivo GCS (${filePath}):`, error);
      failedDeletes.push(filePath);
    }
  }

  if (failedDeletes.length > 0) {
    throw new Error(`No se pudieron eliminar algunos archivos: ${failedDeletes.join(', ')}`);
  }
};

/**
 * Sube un archivo a GCS y devuelve la URL pública
 * @param fileBuffer Buffer del archivo
 * @param destinationPath ruta dentro del bucket donde se almacenará el archivo
 * @param contentType tipo MIME del archivo
 * @returns URL pública del archivo subido
 */
export const uploadFile = async (
  fileBuffer: Buffer,
  destinationPath: string,
  contentType: string
): Promise<string> => {
  const file = bucket.file(destinationPath);

  await new Promise<void>((resolve, reject) => {
    const stream = file.createWriteStream({
      resumable: false,
      contentType,
    });

    stream.on('error', reject);
    stream.on('finish', resolve);
    stream.end(fileBuffer);
  });

  return `https://storage.googleapis.com/${bucket.name}/${destinationPath}`;
};

/**
 * Genera una URL firmada para un archivo en GCS que expira en un tiempo dado
 * @param filePath ruta relativa dentro del bucket
 * @param expiresInSeconds segundos para que expire la URL firmada (por defecto 10 min)
 * @returns URL firmada para acceso temporal
 */
export const generateSignedUrl = async (
  filePath: string,
  expiresInSeconds = 60 * 60 * 24 
): Promise<string> => {
  const file = bucket.file(filePath);
  const [url] = await file.getSignedUrl({
    version: 'v4',
    action: 'read',
    expires: Date.now() + expiresInSeconds * 1000,
  });
  return url;
};
