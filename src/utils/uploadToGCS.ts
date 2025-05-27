import { Storage } from "@google-cloud/storage";
import crypto from "crypto";
import path from "path";

// ✅ Usar credenciales parseadas desde variable de entorno
const credentials = process.env.GOOGLE_CREDENTIALS
  ? JSON.parse(process.env.GOOGLE_CREDENTIALS)
  : undefined;

const storageGCS = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
  credentials,
});

const bucket = storageGCS.bucket(process.env.GCP_BUCKET_NAME!);

const generateUniqueName = (originalname: string) => {
  const randomName = crypto.randomBytes(16).toString("hex");
  const ext = path.extname(originalname).toLowerCase();
  return `${Date.now()}-${randomName}${ext}`;
};

export const uploadToGCS = async (file: Express.Multer.File, folder: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const gcsFileName = `${folder}/${generateUniqueName(file.originalname)}`;
    const fileUpload = bucket.file(gcsFileName);

    const blobStream = fileUpload.createWriteStream({
      resumable: false,
      contentType: file.mimetype,
      public: true,
    });

    blobStream.on("error", reject);
    blobStream.on("finish", () => {
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${gcsFileName}`;
      resolve(publicUrl);
    });

    blobStream.end(file.buffer);
  });
};
