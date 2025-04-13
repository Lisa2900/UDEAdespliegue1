import { Table, Column, Model, DataType, PrimaryKey } from 'sequelize-typescript';

@Table({
    tableName: 'matricula',
    timestamps: false,
})
class Matricula extends Model {
    @PrimaryKey
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        autoIncrement: true
    })
    declare id: number;

    @Column({
        type: DataType.STRING(50),
        allowNull: false
    })
    declare matricula: string;
}

export default Matricula;
