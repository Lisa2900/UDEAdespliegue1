import multer from "multer"
import path from "path"
import crypto from "crypto"
import { Storage } from "@google-cloud/storage"
import type { Request } from "express"

// Configura GCS (asegúrate de cargar credentials por variable de entorno)
const gcpCredentials = process.env.GOOGLE_CREDENTIALS ? JSON.parse(process.env.GOOGLE_CREDENTIALS) : undefined

const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
  credentials: gcpCredentials,
})

const bucket = storage.bucket(process.env.GCP_BUCKET_NAME!)

const generateUniqueName = (originalname: string) => {
  const randomName = crypto.randomBytes(16).toString("hex")
  const ext = path.extname(originalname).toLowerCase()
  return `${Date.now()}-${randomName}${ext}`
}

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ]
  const allowedExts = [".pdf", ".docx"]
  const extname = path.extname(file.originalname).toLowerCase()

  if (allowedMimes.includes(file.mimetype) && allowedExts.includes(extname)) {
    cb(null, true)
  } else {
    cb(new Error("Formato de archivo no válido. Solo se permiten archivos PDF o DOCX"))
  }
}

const uploadLibro = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 1,
  },
})

export const uploadToGCS = async (file: Express.Multer.File, folder: string) => {
  return new Promise<string>((resolve, reject) => {
    const gcsFileName = `${folder}/${generateUniqueName(file.originalname)}`
    const fileUpload = bucket.file(gcsFileName)

    const blobStream = fileUpload.createWriteStream({
      resumable: false,
      contentType: file.mimetype,
      public: true,
    })

    blobStream.on("error", (err) => reject(err))
    blobStream.on("finish", () => {
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${gcsFileName}`
      resolve(publicUrl)
    })

    blobStream.end(file.buffer)
  })
}

export { uploadLibro }
