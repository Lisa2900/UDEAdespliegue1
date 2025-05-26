import { Request, Response } from 'express';
import Libro from '../../data/mysql/models/Libro';
import { getGCSFilePath, deleteFiles } from '../../utils/gcsClient';

export const deleteBook = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;

    const libro = await Libro.findByPk(id);
    if (!libro) {
      return res.status(404).json({ message: `Libro con ID ${id} no encontrado` });
    }

    const filesToDelete: string[] = [];
    if (libro.archivoUrl) filesToDelete.push(getGCSFilePath(libro.archivoUrl));
    if (libro.portadaUrl) filesToDelete.push(getGCSFilePath(libro.portadaUrl));

    if (filesToDelete.length > 0) {
      await deleteFiles(filesToDelete);
    }

    await libro.destroy();

    return res.status(200).json({ message: `Libro con ID ${id} y sus archivos asociados eliminados exitosamente.` });
  } catch (error) {
    console.error('Error al eliminar el libro:', error);
    return res.status(500).json({
      message: 'Error al eliminar el libro',
      error: (error as Error).message,
    });
  }
};
