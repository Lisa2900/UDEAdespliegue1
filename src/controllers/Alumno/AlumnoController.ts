import type { Request, Response } from "express";
import User from "../../data/mysql/models/Alumno";
import { generarId } from "../../helpers/tokens";
import { emailRegistro } from "../../helpers/emails";
import bcrypt from "bcrypt";
import Alumno from "../../data/mysql/models/Alumno";

export class AlumnoController {
  static createUser = async (req: Request, res: Response) => {
    const { matricula, nombre, correo, password, telefono, areaAcademica } =
      req.body;

    try {
      const [existeUsuario, ExisteUserCorreo] = await Promise.all([
        Alumno.findByPk(matricula),
        Alumno.findOne({ where: { correo } }),
      ]);

      if (existeUsuario || ExisteUserCorreo) {
        res.send("el usuario ya existe");
        return;
      }

      // Hashear la contraseña
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const usuario = await Alumno.create({
        nombre,
        correo,
        matricula,
        areaAcademica,
        telefono,

        password: hashedPassword,
        codigoVerificacion: generarId(),
      });

      //envia email de confimacaion
      emailRegistro({
        nombre: usuario.nombre!,
        correo: usuario.correo!,
        codigoVerificacion: usuario.codigoVerificacion!,
      });

      res.send("Se ha enviado un email de confirmacion").status(200);

    } catch (error) {
      console.log(error);
      res.send("hubo un error intentalo de nuevo").status(500);
    }
  };

  static getUserByMatricula = async (req: Request, res: Response) => {
    const { matricula } = req.params;
    try {
      const user = await Alumno.findOne({
        where: { matricula},
        attributes: {
          exclude: ['password', 'codigoVerificacion', 'createdAt', 'updatedAt'],
        },
        include:['area']
      });

      if (!user) {
        res.send("usuario no encontrado");
        return;
      }


      res.send(user).status(200);
    } catch (error) {
      console.log(error);
      res.send("hubo un error").status(500);
    }
  };

  static getAllAlumnos = async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = 10;
      const offset = (page - 1) * pageSize;

      const users = await Alumno.findAll({
        limit: pageSize,
        offset: offset,

        attributes: {
          exclude: ['password', 'codigoVerificacion', 'createdAt', 'updatedAt'],
        },
        include:['area']
      });

      const totalUsers = await Alumno.count();

      res.json({
        users,
        totalPages: Math.ceil(totalUsers / pageSize),
        currentPage: page,
        totalUsers,
      });
    } catch (error) {
      console.log({ error });
      res.status(500).send("Hubo un error");
    }
  };

  static updateUser = async (req: Request, res: Response) => {
    const { matricula } = req.params;
    const { correo, nombre, password } = req.body;

    try {
      const user = await Alumno.findOne({ where: { matricula } });

      if (!user) {
         res.status(404).send("Usuario no encontrado");
          return;
        }


      if (correo) {
        user.correo = correo;  // Actualizar correo
      }

      if (nombre) {
        user.nombre = nombre;  // Actualizar nombre
      }

      if (password) {
        // Hashear la nueva contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        user.password = hashedPassword;  // Actualizar contraseña
      }


      await user.save();


      res.status(200).json({
        message: "Usuario actualizado exitosamente",
        user: {
          matricula: user.matricula,
          nombre: user.nombre,
          correo: user.correo,

        },
      });
    } catch (error) {
      console.log(error);
      res.status(500).send("Hubo un error al actualizar el usuario");
    }
  };

}
