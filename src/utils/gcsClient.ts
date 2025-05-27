import { Storage } from '@google-cloud/storage';
import path from 'path';

const gcpCredentials = process.env.GOOGLE_CREDENTIALS
  ? JSON.parse(process.env.GOOGLE_CREDENTIALS)
  : undefined;

const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
  credentials: gcpCredentials,
});

const bucket = storage.bucket(process.env.GCP_BUCKET_NAME!);

// Extrae la ruta del archivo desde la URL pública
export const getGCSFilePath = (publicUrl: string): string => {
  const url = new URL(publicUrl);
  return url.pathname.replace(`/${bucket.name}/`, '');
};

// Elimina archivos por ruta
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

// Sube un archivo a GCS
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
      public: true,
    });

    stream.on('error', reject);
    stream.on('finish', resolve);
    stream.end(fileBuffer);
  });

  return `https://storage.googleapis.com/${bucket.name}/${destinationPath}`;
};

// Genera una URL firmada
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
