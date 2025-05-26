import { Storage } from "@google-cloud/storage";
import crypto from "crypto";
import path from "path";

const storageGCS = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
  keyFilename: path.join(__dirname, "../../keystorage.json"),
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
     
    });

    blobStream.on("error", (err) => reject(err));
    blobStream.on("finish", () => {
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${gcsFileName}`;
      resolve(publicUrl);
    });

    blobStream.end(file.buffer);
  });
};
