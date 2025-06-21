import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface HotelAttributes {
  id: number;
  name: string;
  address: string;
  description?: string;
  price: number;
  availableRooms: number;
  operatorId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface HotelCreationAttributes extends Optional<HotelAttributes, 'id' | 'description' | 'createdAt' | 'updatedAt'> {}

export class Hotel extends Model<HotelAttributes, HotelCreationAttributes> implements HotelAttributes {
  public id!: number;
  public name!: string;
  public address!: string;
  public description?: string;
  public price!: number;
  public availableRooms!: number;
  public operatorId!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Hotel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    availableRooms: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    operatorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Hotel',
    tableName: 'hotels',
  }
); 