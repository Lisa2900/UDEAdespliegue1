import expres from 'express'
import dotenv from 'dotenv'

import cors from 'cors'
import { AdminRoutes } from './routes/Administrador/AdminstradorRouter';
import AuthAlumnoRoutes from './routes/AuthAlumno/AuthAlumnoRoutes'
import AlumnoUserRoutes from './routes/AlumnoUser/AlumnoUserRoutes'
import SemestreRoutes from './routes/Semestre/SemestreRouter'
import MateriaRoutes from './routes/Materia/MateriaRoutes'
import BookRoutes from './routes/Book/BookRoutes'
import AreaRoutes from './routes/Area/AreaRouter'
import MatriculaRoutes from './routes/Matricula/MatriculaRouter';

 import { errorHandler } from './middleware/errorHandler';
import { corsConfig } from './config/cors';

dotenv.config()

const app = expres()
app.use(cors (corsConfig))


app.use(expres.json())  //habilita el body parser
app.use(expres.urlencoded({ extended: true }))  //habilita el body parser






//routes 

app.use('/api/alumno', AlumnoUserRoutes)
app.use('/api/auth/alumnos', AuthAlumnoRoutes)
app.use('/api/books', BookRoutes )
app.use('/api/area', AreaRoutes )
app.use(errorHandler);
app.use('/api/books', BookRoutes)
app.use('/api/area', AreaRoutes)
app.use('/api/matricula', MatriculaRoutes);
app.use('/api/administrador', AdminRoutes.routes);
app.use('/api/semestre', SemestreRoutes);
app.use('/api/materias', MateriaRoutes);

export default app