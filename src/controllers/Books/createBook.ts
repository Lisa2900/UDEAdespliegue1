import { Request, Response } from 'express';
import Libro from '../../data/mysql/models/Libro';
import Area from '../../data/mysql/models/Area';
import Semestre from '../../data/mysql/models/Semestre';
import Materia from '../../data/mysql/models/Materia';
import { validationResult } from 'express-validator';
import path from 'path';

export const createBook = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { nombreLibro, descripcion, autor, fkIdArea, fkIdSemestre, fkIdMateria } = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    const areaId = parseInt(fkIdArea, 10);
    const semestreId = parseInt(fkIdSemestre, 10);
    const materiaId = parseInt(fkIdMateria, 10);

    if (isNaN(areaId) || isNaN(semestreId) || isNaN(materiaId)) {
      return res.status(400).json({ message: "IDs inválidos, deben ser números enteros." });
    }

    const area = await Area.findByPk(areaId);
    const semestre = await Semestre.findByPk(semestreId);
    const materia = await Materia.findByPk(materiaId);

    if (!area) return res.status(400).json({ message: `El área con ID ${areaId} no existe` });
    if (!semestre) return res.status(400).json({ message: `El semestre con ID ${semestreId} no existe` });
    if (!materia) return res.status(400).json({ message: `La materia con ID ${materiaId} no existe` });

    if (!files || !files.archivo || !files.portada) {
      return res.status(400).json({ message: 'Se deben subir los archivos de portada y libro.' });
    }

    const file = files.archivo[0];
    const portadaFile = files.portada[0];

    // Validar extensiones
    const allowedDocExtensions = ['.pdf', '.docx'];
    const allowedImageExtensions = ['.jpg', '.jpeg', '.png'];

    if (!allowedDocExtensions.includes(path.extname(file.originalname).toLowerCase())) {
      return res.status(400).json({ message: 'El archivo debe ser .pdf o .docx' });
    }

    if (!allowedImageExtensions.includes(path.extname(portadaFile.originalname).toLowerCase())) {
      return res.status(400).json({ message: 'La portada debe ser una imagen (.jpg, .jpeg, .png)' });
    }

const archivoUrl = req.body.archivoUrl;
const portadaUrl = req.body.portadaUrl;

if (!archivoUrl || !portadaUrl) {
  return res.status(400).json({ message: 'URLs de archivo y portada son obligatorias.' });
}

    // Crear el libro en la base de datos con URLs GCS
    const libro = await Libro.create({
      nombreLibro,
      descripcion,
      autor,
      archivoUrl,
      portadaUrl,
      fkIdArea: areaId,
      fkIdSemestre: semestreId,
      fkIdMateria: materiaId,
    });

    return res.status(201).json({ message: 'Libro creado con éxito', libro });
  } catch (error: any) {
    console.error('Error al crear el libro:', error);
    return res.status(500).json({ message: 'Error al crear el libro', error: error.message });
  }
};
