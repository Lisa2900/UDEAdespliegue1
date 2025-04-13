import { Table, Column, Model, DataType, Default, Scopes, PrimaryKey, BelongsTo, ForeignKey } from 'sequelize-typescript';
import Area from './Area';


@Table({
  tableName: 'alumno',
  timestamps: true, 
})
class Alumno extends Model {

  @PrimaryKey
  @Column({
    type: DataType.STRING(11),
    allowNull: false,
    unique: true  // Matricula como clave primaria
  })
  declare matricula: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,  
  })
  declare nombre?: string;

  @Column({
    type: DataType.BIGINT,
    allowNull: false,  
  })
  declare telefono?: bigint;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    unique: true 
  })
  declare correo?: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false
  })
  declare password?: string;

  @ForeignKey(() => Area)  // Relación de clave foránea con el modelo Area
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  declare areaAcademica?: number;

  @BelongsTo(() => Area)  // Relación de tipo 'BelongsTo' con el modelo Area
  area?: Area;

  @Column({
    type: DataType.STRING(30),
    allowNull: true  // Codigo_Verificacion puede ser null
  })
  declare codigoVerificacion?: string;

  @Default('alumno')
  @Column({
    type: DataType.ENUM('alumno'),
    defaultValue: 'alumno',
    allowNull: false
  })
  declare rol: 'alumno';

  @Column({
    type: DataType.BOOLEAN,
    allowNull: true,
    defaultValue: false
  })
  declare verificado: boolean;
}

export default Alumno;
