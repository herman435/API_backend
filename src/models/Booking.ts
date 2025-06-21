import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { User } from './User';
import { Hotel } from './Hotel';

export interface BookingAttributes {
  id: number;
  userId: number;
  hotelId: number;
  checkInDate: Date;
  checkOutDate: Date;
  guestCount: number;
  specialRequests?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  totalPrice: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface BookingCreationAttributes extends Optional<BookingAttributes, 'id' | 'status' | 'totalPrice'> {}

export class Booking extends Model<BookingAttributes, BookingCreationAttributes> implements BookingAttributes {
  public id!: number;
  public userId!: number;
  public hotelId!: number;
  public checkInDate!: Date;
  public checkOutDate!: Date;
  public guestCount!: number;
  public specialRequests?: string;
  public status!: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  public totalPrice!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Booking.init(
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
    checkInDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    checkOutDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    guestCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 10,
      },
    },
    specialRequests: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('pending', 'confirmed', 'cancelled', 'completed'),
      allowNull: false,
      defaultValue: 'pending',
    },
    totalPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Booking',
    tableName: 'bookings',
  }
);

Booking.belongsTo(User, { foreignKey: 'userId' });
Booking.belongsTo(Hotel, { foreignKey: 'hotelId' });
User.hasMany(Booking, { foreignKey: 'userId' });
Hotel.hasMany(Booking, { foreignKey: 'hotelId' }); 