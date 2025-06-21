import { Sequelize } from 'sequelize';

export const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: false,
});

import '../models/User';
import '../models/Hotel';
import '../models/Favorite';
import '../models/Booking'; 