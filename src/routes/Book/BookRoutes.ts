import { Router } from "express";
import upload from "../../middleware/upload";
import { uploadToGCS } from "../../utils/uploadToGCS";
import { createBook } from "../../controllers/Books/createBook";
import { getBooks } from "../../controllers/Books/getBooks";
import { getBookById } from "../../controllers/Books/getBookById";
import { updateBook } from "../../controllers/Books/updateBook";
import { deleteBook } from "../../controllers/Books/deleteBook";
import { searchBooks } from "../../controllers/Books/searchBooks";

const router = Router();

router.post(
  "/create",
  upload.fields([
    { name: "portada", maxCount: 1 },
    { name: "archivo", maxCount: 1 },
  ]),
  async (req: import("express").Request, res: import("express").Response): Promise<void> => {
    try {
      if (!req.files) {
        res.status(400).json({ message: "No se subieron archivos" });
        return;
      }

      const files = req.files as {
        portada?: Express.Multer.File[];
        archivo?: Express.Multer.File[];
      };

      if (!files.portada?.[0] || !files.archivo?.[0]) {
        res.status(400).json({ message: "Portada y archivo son obligatorios" });
        return;
      }

      const portadaUrl = await uploadToGCS(files.portada[0], "portadas");
      const archivoUrl = await uploadToGCS(files.archivo[0], "libros");

      req.body.portadaUrl = portadaUrl;
      req.body.archivoUrl = archivoUrl;

      await createBook(req, res);
    } catch (error: any) {
      console.error("Error en /create:", error);
      res.status(500).json({ message: "Error interno", error: error.message });
    }
  }
);

router.get("/getBooks", async (req, res) => {
  try {
    await getBooks(req, res);
  } catch (error) {
    res.status(500).json({ message: "Error interno del servidor", error });
  }
});

router.get("/getBooks/:id", async (req, res) => {
  try {
    await getBookById(req, res);
  } catch (error) {
    res.status(500).json({ message: "Error interno del servidor", error });
  }
});

router.get("/searchBooks", async (req, res) => {
  try {
    await searchBooks(req, res);
  } catch (error) {
    res.status(500).json({ message: "Error interno del servidor", error });
  }
});

router.put(
  '/updateBook/:id',
  upload.fields([
    { name: 'portada', maxCount: 1 },
    { name: 'archivo', maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const files = req.files as {
        portada?: Express.Multer.File[];
        archivo?: Express.Multer.File[];
      };

      if (files.portada?.[0]) {
        const portadaUrl = await uploadToGCS(files.portada[0], 'portadas');
        req.body.portadaUrl = portadaUrl;
      }

      if (files.archivo?.[0]) {
        const archivoUrl = await uploadToGCS(files.archivo[0], 'libros');
        req.body.archivoUrl = archivoUrl;
      }

      await updateBook(req, res);
    } catch (error: any) {
      console.error('Error en /updateBook:', error);
      res.status(500).json({ message: 'Error interno', error: error.message });
    }
  }
);


router.delete("/deleteBook/:id", async (req, res) => {
  try {
    await deleteBook(req, res);
  } catch (error) {
    res.status(500).json({ message: "Error interno del servidor", error });
  }
});
export default router;
