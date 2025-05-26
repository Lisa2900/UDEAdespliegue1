import { Request, Response } from 'express';
import Libro from '../../data/mysql/models/Libro';
import Area from '../../data/mysql/models/Area';
import { Op } from 'sequelize';
import Semestre from '../../data/mysql/models/Semestre';
import Materia from '../../data/mysql/models/Materia';
import { getGCSFilePath, generateSignedUrl } from '../../utils/gcsClient'; // Ajusta la ruta

export const searchBooks = async (req: Request, res: Response) => {
  try {
    const { nombreLibro, fkIdArea, fkIdSemestre, fkIdMateria, idLibro } = req.query;
    const whereConditions: any = {};

    if (idLibro) {
      whereConditions.idLibro = idLibro;
    } else {
      if (nombreLibro) whereConditions.nombreLibro = { [Op.like]: `%${nombreLibro}%` };
      if (fkIdArea) whereConditions.fkIdArea = fkIdArea;
      if (fkIdSemestre) whereConditions.fkIdSemestre = fkIdSemestre;
      if (fkIdMateria) whereConditions.fkIdMateria = fkIdMateria;
    }

    const libros = await Libro.findAll({
      where: whereConditions,
      include: [
        { model: Area, attributes: ['nombreArea'] },
        { model: Semestre, attributes: ['nombreSemestre'] },
        { model: Materia, attributes: ['nombreMateria'] }
      ]
    });

    if (!libros || libros.length === 0) {
      return res.status(404).json({ message: 'No se encontraron libros' });
    }

    // Generar URLs firmadas para cada libro
    const librosConUrlsFirmadas = await Promise.all(libros.map(async (libro) => {
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
    }));

    return res.status(200).json(librosConUrlsFirmadas);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error al realizar la búsqueda de libros' });
  }
};
