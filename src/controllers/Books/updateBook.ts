import { Request, Response } from 'express';
import Libro from '../../data/mysql/models/Libro';
import Area from '../../data/mysql/models/Area';
import Semestre from '../../data/mysql/models/Semestre';
import Materia from '../../data/mysql/models/Materia';
import { getGCSFilePath, deleteFiles } from '../../utils/gcsClient';  // <-- tu módulo GCS

export const updateBook = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { nombreLibro, descripcion, autor, fkIdArea, fkIdSemestre, fkIdMateria, archivoUrl, portadaUrl } = req.body;

    const libro = await Libro.findByPk(id);
    if (!libro) {
      res.status(404).json({ message: 'Libro no encontrado' });
      return;
    }

    // Validar IDs relacionados
    if (fkIdArea) {
      const area = await Area.findByPk(fkIdArea);
      if (!area) {
        res.status(400).json({ message: `El área con ID ${fkIdArea} no existe` });
        return;
      }
    }
    if (fkIdSemestre) {
      const semestre = await Semestre.findByPk(fkIdSemestre);
      if (!semestre) {
        res.status(400).json({ message: `El semestre con ID ${fkIdSemestre} no existe` });
        return;
      }
    }
    if (fkIdMateria) {
      const materia = await Materia.findByPk(fkIdMateria);
      if (!materia) {
        res.status(400).json({ message: `La materia con ID ${fkIdMateria} no existe` });
        return;
      }
    }

    // Manejo de archivos GCS antiguos
    const archivosAEliminar: string[] = [];

    // Si hay nuevo archivo y url antigua es distinta -> eliminar antiguo
    if (archivoUrl && libro.archivoUrl && archivoUrl !== libro.archivoUrl) {
      archivosAEliminar.push(getGCSFilePath(libro.archivoUrl));
    }

    // Igual para portada
    if (portadaUrl && libro.portadaUrl && portadaUrl !== libro.portadaUrl) {
      archivosAEliminar.push(getGCSFilePath(libro.portadaUrl));
    }

    if (archivosAEliminar.length > 0) {
      await deleteFiles(archivosAEliminar);
    }

    // Actualizar libro con datos nuevos o mantener viejos
    libro.nombreLibro = nombreLibro ?? libro.nombreLibro;
    libro.descripcion = descripcion ?? libro.descripcion;
    libro.autor = autor ?? libro.autor;
    libro.fkIdArea = fkIdArea ?? libro.fkIdArea;
    libro.fkIdSemestre = fkIdSemestre ?? libro.fkIdSemestre;
    libro.fkIdMateria = fkIdMateria ?? libro.fkIdMateria;
    libro.archivoUrl = archivoUrl ?? libro.archivoUrl;
    libro.portadaUrl = portadaUrl ?? libro.portadaUrl;

    await libro.save();

    res.status(200).json({
      message: 'Libro actualizado con éxito',
      libro,
      archivosEliminados: archivosAEliminar.length > 0 ? archivosAEliminar : 'No se eliminaron archivos antiguos',
    });
  } catch (error: any) {
    console.error('Error al actualizar el libro:', error);
    res.status(500).json({ message: 'Error al actualizar el libro', error: error.message });
  }
};
