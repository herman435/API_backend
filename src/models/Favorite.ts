import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { User } from './User';
import { Hotel } from './Hotel';

export interface FavoriteAttributes {
  id: number;
  userId: number;
  hotelId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface FavoriteCreationAttributes extends Optional<FavoriteAttributes, 'id'> {}

export class Favorite extends Model<FavoriteAttributes, FavoriteCreationAttributes> implements FavoriteAttributes {
  public id!: number;
  public userId!: number;
  public hotelId!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Favorite.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    hotelId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Hotel,
        key: 'id',
      },
    },
  },
  {
    sequelize,
    modelName: 'Favorite',
    tableName: 'favorites',
    indexes: [
      {
        unique: true,
        fields: ['userId', 'hotelId'],
      },
    ],
  }
);

Favorite.belongsTo(User, { foreignKey: 'userId' });
Favorite.belongsTo(Hotel, { foreignKey: 'hotelId' });
User.hasMany(Favorite, { foreignKey: 'userId' });
Hotel.hasMany(Favorite, { foreignKey: 'hotelId' }); 