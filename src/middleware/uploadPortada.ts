import multer from "multer"
import { Storage } from "@google-cloud/storage"
import path from "path"
import crypto from "crypto"
import type { Request } from "express"
import { MulterError } from "multer"

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
  const allowedMimes = ["image/jpeg", "image/png", "image/jpg"]
  const extname = path.extname(file.originalname).toLowerCase()

  if (allowedMimes.includes(file.mimetype) && [".jpg", ".jpeg", ".png"].includes(extname)) {
    cb(null, true)
  } else {
    cb(new MulterError("LIMIT_UNEXPECTED_FILE", "Formato no válido"))
  }
}

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1,
  },
})

export const uploadToGCS = async (file: Express.Multer.File) => {
  return new Promise<string>((resolve, reject) => {
    const gcsFileName = generateUniqueName(file.originalname)
    const fileUpload = bucket.file(gcsFileName)

    const blobStream = fileUpload.createWriteStream({
      resumable: false,
      contentType: file.mimetype,
      public: true, // O false si es privado
    })

    blobStream.on("error", (err) => reject(err))
    blobStream.on("finish", () => {
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${gcsFileName}`
      resolve(publicUrl)
    })

    blobStream.end(file.buffer)
  })
}

export default upload
