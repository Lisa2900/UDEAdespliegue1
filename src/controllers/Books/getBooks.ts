import { Request, Response } from 'express';
import Libro from '../../data/mysql/models/Libro';
import Area from '../../data/mysql/models/Area';
import Semestre from '../../data/mysql/models/Semestre';
import Materia from '../../data/mysql/models/Materia';
import { getGCSFilePath, generateSignedUrl } from '../../utils/gcsClient'; // Ajusta la ruta según donde tengas el módulo

export const getBooks = async (req: Request, res: Response) => {
  try {
    const { offset = 0, limit = 25 } = req.query;
    const maxLimit = 100;
    const finalLimit = Math.min(Number(limit), maxLimit);

    const libros = await Libro.findAll({
      limit: finalLimit,
      offset: Number(offset),
      include: [
        { model: Area, attributes: ['nombreArea'] },
        { model: Semestre, attributes: ['nombreSemestre'] },
        { model: Materia, attributes: ['nombreMateria'] }
      ]
    });

    const librosConUrlsFirmadas = await Promise.all(
      libros.map(async (libro) => {
        const libroJson = libro.toJSON() as any;

        if (libroJson.archivoUrl) {
          const filePath = getGCSFilePath(libroJson.archivoUrl);
          libroJson.archivoUrl = await generateSignedUrl(filePath);
        }

        if (libroJson.portadaUrl) {
          const filePath = getGCSFilePath(libroJson.portadaUrl);
          libroJson.portadaUrl = await generateSignedUrl(filePath);
        }

        return libroJson;
      })
    );

    return res.status(200).json(librosConUrlsFirmadas);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error al obtener los libros' });
  }
};
