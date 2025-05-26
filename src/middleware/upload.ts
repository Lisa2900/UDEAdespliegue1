import multer, { MulterError } from "multer";
import path from "path";
import crypto from "crypto";
import type { Request } from "express";

const filterPortada = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = ["image/jpeg", "image/png", "image/jpg"];
  const extname = path.extname(file.originalname).toLowerCase();

  if (allowedMimes.includes(file.mimetype) && [".jpg", ".jpeg", ".png"].includes(extname)) {
    cb(null, true);
  } else {
    cb(new MulterError("LIMIT_UNEXPECTED_FILE", "Formato no válido para portada"));
  }
};

const filterArchivo = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  const allowedExts = [".pdf", ".docx"];
  const extname = path.extname(file.originalname).toLowerCase();

  if (allowedMimes.includes(file.mimetype) && allowedExts.includes(extname)) {
    cb(null, true);
  } else {
    cb(new MulterError("LIMIT_UNEXPECTED_FILE", "Formato no válido para archivo"));
  }
};

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.fieldname === "portada") {
      filterPortada(req, file, cb);
    } else if (file.fieldname === "archivo") {
      filterArchivo(req, file, cb);
    } else {
      cb(new MulterError("LIMIT_UNEXPECTED_FILE", "Campo no permitido"));
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB por archivo
  },
});

export default upload;
