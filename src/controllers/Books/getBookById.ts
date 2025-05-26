import { Request, Response } from 'express';
import Libro from '../../data/mysql/models/Libro';
import Area from '../../data/mysql/models/Area';
import Semestre from '../../data/mysql/models/Semestre';
import Materia from '../../data/mysql/models/Materia';
import { getGCSFilePath, generateSignedUrl } from '../../utils/gcsClient'; // Ajusta la ruta

export const getBookById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const libro = await Libro.findByPk(id, {
      include: [
        { model: Area, attributes: ['nombreArea'] },
        { model: Semestre, attributes: ['nombreSemestre'] },
        { model: Materia, attributes: ['nombreMateria'] }
      ]
    });

    if (!libro) {
      return res.status(404).json({ message: 'Libro no encontrado' });
    }

    const libroJson = libro.toJSON() as any;

    if (libroJson.archivoUrl) {
      const filePath = getGCSFilePath(libroJson.archivoUrl);
      libroJson.archivoUrl = await generateSignedUrl(filePath);
    }

    if (libroJson.portadaUrl) {
      const filePath = getGCSFilePath(libroJson.portadaUrl);
      libroJson.portadaUrl = await generateSignedUrl(filePath);
    }

    return res.status(200).json(libroJson);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error al obtener el libro' });
  }
};
