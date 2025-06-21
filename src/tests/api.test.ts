import request from 'supertest';
import express from 'express';
import { sequelize } from '../config/database';
import authRoutes from '../routes/auth';
import hotelRoutes from '../routes/hotel';
import bookingRoutes from '../routes/booking';
import favoriteRoutes from '../routes/favorite';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/favorites', favoriteRoutes);

describe('API Tests', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('Auth API', () => {
    test('POST /api/auth/register - 用户注册', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          role: 'user'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'Registration successful');
      expect(response.body).toHaveProperty('user');
    });

    test('POST /api/auth/register - 业者注册', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'operator@example.com',
          password: 'password123',
          role: 'operator',
          registerCode: 'WANDERLUST2025'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'Registration successful');
    });

    test('POST /api/auth/login - 用户登录', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          role: 'user'
        });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
    });

    test('POST /api/auth/login - 业者登录', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'operator@example.com',
          password: 'password123',
          role: 'operator',
          registerCode: 'WANDERLUST2025'
        });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'operator@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
    });
  });

  describe('Hotel API', () => {
    let authToken: string;
    let operatorToken: string;

    beforeEach(async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          role: 'user'
        });

      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'operator@example.com',
          password: 'password123',
          role: 'operator',
          registerCode: 'WANDERLUST2025'
        });

      const userResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });
      authToken = userResponse.body.token;

      const operatorResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'operator@example.com',
          password: 'password123'
        });
      operatorToken = operatorResponse.body.token;
    });

    afterEach(async () => {
      await sequelize.truncate({ cascade: true });
    });

    test('GET /api/hotels - 获取酒店列表', async () => {
      const response = await request(app)
        .get('/api/hotels');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    test('POST /api/hotels - 创建酒店（需要业者权限）', async () => {
      const response = await request(app)
        .post('/api/hotels')
        .set('Authorization', `Bearer ${operatorToken}`)
        .send({
          name: '测试酒店',
          address: '测试地址',
          description: '测试描述',
          price: 500,
          availableRooms: 10
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('name', '测试酒店');
    });

    test('GET /api/hotels/:id - 获取单个酒店', async () => {
      const hotelResponse = await request(app)
        .post('/api/hotels')
        .set('Authorization', `Bearer ${operatorToken}`)
        .send({
          name: '测试酒店',
          address: '测试地址',
          description: '测试描述',
          price: 500,
          availableRooms: 10
        });

      const hotelId = hotelResponse.body.id;

      const response = await request(app)
        .get(`/api/hotels/${hotelId}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', hotelId);
    });

    test('PUT /api/hotels/:id - 更新酒店（需要业者权限）', async () => {
      const hotelResponse = await request(app)
        .post('/api/hotels')
        .set('Authorization', `Bearer ${operatorToken}`)
        .send({
          name: '测试酒店',
          address: '测试地址',
          description: '测试描述',
          price: 500,
          availableRooms: 10
        });

      const hotelId = hotelResponse.body.id;

      const response = await request(app)
        .put(`/api/hotels/${hotelId}`)
        .set('Authorization', `Bearer ${operatorToken}`)
        .send({
          name: '更新后的酒店名称',
          price: 600
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('name', '更新后的酒店名称');
    });

    test('DELETE /api/hotels/:id - 删除酒店（需要业者权限）', async () => {
      const hotelResponse = await request(app)
        .post('/api/hotels')
        .set('Authorization', `Bearer ${operatorToken}`)
        .send({
          name: '测试酒店',
          address: '测试地址',
          description: '测试描述',
          price: 500,
          availableRooms: 10
        });

      const hotelId = hotelResponse.body.id;

      const response = await request(app)
        .delete(`/api/hotels/${hotelId}`)
        .set('Authorization', `Bearer ${operatorToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Delete successful');
    });
  });

  describe('Booking API', () => {
    let authToken: string;
    let operatorToken: string;
    let hotelId: number;

    beforeEach(async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          role: 'user'
        });

      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'operator@example.com',
          password: 'password123',
          role: 'operator',
          registerCode: 'WANDERLUST2025'
        });

      const userResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });
      authToken = userResponse.body.token;

      const operatorResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'operator@example.com',
          password: 'password123'
        });
      operatorToken = operatorResponse.body.token;


      const hotelResponse = await request(app)
        .post('/api/hotels')
        .set('Authorization', `Bearer ${operatorToken}`)
        .send({
          name: '测试酒店',
          address: '测试地址',
          description: '测试描述',
          price: 500,
          availableRooms: 10
        });
      hotelId = hotelResponse.body.id;
    });

    afterEach(async () => {
      await sequelize.truncate({ cascade: true });
    });

    test('POST /api/bookings - 创建预订', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30); 
      const checkInDate = futureDate.toISOString().split('T')[0];
      
      futureDate.setDate(futureDate.getDate() + 2); 
      const checkOutDate = futureDate.toISOString().split('T')[0];

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          hotelId: hotelId,
          checkInDate: checkInDate,
          checkOutDate: checkOutDate,
          guestCount: 2,
          specialRequests: '需要安静的房间'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'Booking successful');
      expect(response.body).toHaveProperty('booking');
      expect(response.body.booking).toHaveProperty('hotelName');
      expect(response.body.booking).toHaveProperty('status', 'pending');
    });

    test('GET /api/bookings - 获取用户预订列表', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);
      const checkInDate = futureDate.toISOString().split('T')[0];
      
      futureDate.setDate(futureDate.getDate() + 2);
      const checkOutDate = futureDate.toISOString().split('T')[0];

      await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          hotelId: hotelId,
          checkInDate: checkInDate,
          checkOutDate: checkOutDate,
          guestCount: 2
        });

      const response = await request(app)
        .get('/api/bookings')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    test('GET /api/bookings/operator - 获取业者预订列表', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);
      const checkInDate = futureDate.toISOString().split('T')[0];
      
      futureDate.setDate(futureDate.getDate() + 2);
      const checkOutDate = futureDate.toISOString().split('T')[0];

      await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          hotelId: hotelId,
          checkInDate: checkInDate,
          checkOutDate: checkOutDate,
          guestCount: 2
        });

      const response = await request(app)
        .get('/api/bookings/operator')
        .set('Authorization', `Bearer ${operatorToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    test('GET /api/bookings/:id - 获取预订详情', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);
      const checkInDate = futureDate.toISOString().split('T')[0];
      
      futureDate.setDate(futureDate.getDate() + 2);
      const checkOutDate = futureDate.toISOString().split('T')[0];

      const bookingResponse = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          hotelId: hotelId,
          checkInDate: checkInDate,
          checkOutDate: checkOutDate,
          guestCount: 2
        });

      const bookingId = bookingResponse.body.booking.id;

      const response = await request(app)
        .get(`/api/bookings/${bookingId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', bookingId);
    });

    test('POST /api/bookings/:id/cancel - 取消预订', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);
      const checkInDate = futureDate.toISOString().split('T')[0];
      
      futureDate.setDate(futureDate.getDate() + 2);
      const checkOutDate = futureDate.toISOString().split('T')[0];

      const bookingResponse = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          hotelId: hotelId,
          checkInDate: checkInDate,
          checkOutDate: checkOutDate,
          guestCount: 2
        });

      const bookingId = bookingResponse.body.booking.id;

      const response = await request(app)
        .post(`/api/bookings/${bookingId}/cancel`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Booking cancelled');
    });

    test('POST /api/bookings/:id/confirm - 业者确认预订', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);
      const checkInDate = futureDate.toISOString().split('T')[0];
      
      futureDate.setDate(futureDate.getDate() + 2);
      const checkOutDate = futureDate.toISOString().split('T')[0];

      const bookingResponse = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          hotelId: hotelId,
          checkInDate: checkInDate,
          checkOutDate: checkOutDate,
          guestCount: 2
        });

      const bookingId = bookingResponse.body.booking.id;

      const response = await request(app)
        .post(`/api/bookings/${bookingId}/confirm`)
        .set('Authorization', `Bearer ${operatorToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Booking confirmed');
    });

    test('POST /api/bookings/:id/complete - 业者完成预订', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);
      const checkInDate = futureDate.toISOString().split('T')[0];
      
      futureDate.setDate(futureDate.getDate() + 2);
      const checkOutDate = futureDate.toISOString().split('T')[0];

      const bookingResponse = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          hotelId: hotelId,
          checkInDate: checkInDate,
          checkOutDate: checkOutDate,
          guestCount: 2
        });

      const bookingId = bookingResponse.body.booking.id;

      await request(app)
        .post(`/api/bookings/${bookingId}/confirm`)
        .set('Authorization', `Bearer ${operatorToken}`);

      const response = await request(app)
        .post(`/api/bookings/${bookingId}/complete`)
        .set('Authorization', `Bearer ${operatorToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Booking completed');
    });
  });

  describe('Favorite API', () => {
    let authToken: string;
    let operatorToken: string;
    let hotelId: number;

    beforeEach(async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          role: 'user'
        });

      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'operator@example.com',
          password: 'password123',
          role: 'operator',
          registerCode: 'WANDERLUST2025'
        });

      const userResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });
      authToken = userResponse.body.token;

      const operatorResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'operator@example.com',
          password: 'password123'
        });
      operatorToken = operatorResponse.body.token;

      const hotelResponse = await request(app)
        .post('/api/hotels')
        .set('Authorization', `Bearer ${operatorToken}`)
        .send({
          name: '测试酒店',
          address: '测试地址',
          description: '测试描述',
          price: 500,
          availableRooms: 10
        });
      hotelId = hotelResponse.body.id;
    });

    afterEach(async () => {
      await sequelize.truncate({ cascade: true });
    });

    test('POST /api/favorites - 添加收藏', async () => {
      const response = await request(app)
        .post('/api/favorites')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          hotelId: hotelId
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'Favorite added successfully');
    });

    test('GET /api/favorites - 获取收藏列表', async () => {
      await request(app)
        .post('/api/favorites')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          hotelId: hotelId
        });

      const response = await request(app)
        .get('/api/favorites')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    test('GET /api/favorites/:hotelId/check - 检查是否已收藏', async () => {
      await request(app)
        .post('/api/favorites')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          hotelId: hotelId
        });

      const response = await request(app)
        .get(`/api/favorites/${hotelId}/check`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('isFavorite', true);
    });

    test('DELETE /api/favorites/:hotelId - 移除收藏', async () => {
      await request(app)
        .post('/api/favorites')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          hotelId: hotelId
        });

      const response = await request(app)
        .delete(`/api/favorites/${hotelId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Favorite removed successfully');
    });
  });
}); 