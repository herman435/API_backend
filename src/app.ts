import express from 'express';
import cors from 'cors';
import { sequelize } from './config/database';
import authRoutes from './routes/auth';
import hotelRoutes from './routes/hotel';
import favoriteRoutes from './routes/favorite';
import bookingRoutes from './routes/booking';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Wanderlust Travel API',
      version: '1.0.0',
      description: 'Wanderlust Travel RESTful API Documentation',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [path.join(__dirname, './routes/*.ts')],
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/bookings', bookingRoutes);

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Swagger docs at http://localhost:${PORT}/api/docs`);
  });
}); 