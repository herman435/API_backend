import express from 'express';
import { createHotel, updateHotel, deleteHotel, getHotels, getHotelById } from '../controllers/hotelController';
import { authenticateJWT, requireOperator } from '../middlewares/auth';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Hotel
 *   description: Hotel Management
 */

/**
 * @swagger
 * /api/hotels:
 *   get:
 *     summary: Get hotel list
 *     tags: [Hotel]
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Search by name
 *     responses:
 *       200:
 *         description: Hotel list
 */
router.get('/', getHotels);

/**
 * @swagger
 * /api/hotels/{id}:
 *   get:
 *     summary: Get single hotel info
 *     tags: [Hotel]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Hotel info
 *       404:
 *         description: Not found
 */
router.get('/:id', getHotelById);

/**
 * @swagger
 * /api/hotels:
 *   post:
 *     summary: Create hotel (operator permission required)
 *     tags: [Hotel]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - address
 *               - price
 *               - availableRooms
 *             properties:
 *               name:
 *                 type: string
 *                 description: Hotel name
 *               address:
 *                 type: string
 *                 description: Hotel address
 *               description:
 *                 type: string
 *                 description: Hotel description
 *               price:
 *                 type: number
 *                 description: Price per night
 *               availableRooms:
 *                 type: integer
 *                 description: Available rooms
 *     responses:
 *       201:
 *         description: Hotel created successfully
 *       400:
 *         description: Parameter error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Operator permission required
 */
router.post('/', authenticateJWT, requireOperator, createHotel);

/**
 * @swagger
 * /api/hotels/{id}:
 *   put:
 *     summary: Update hotel info (operator permission required)
 *     tags: [Hotel]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Hotel ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Hotel name
 *               address:
 *                 type: string
 *                 description: Hotel address
 *               description:
 *                 type: string
 *                 description: Hotel description
 *               price:
 *                 type: number
 *                 description: Price per night
 *               availableRooms:
 *                 type: integer
 *                 description: Available rooms
 *     responses:
 *       200:
 *         description: Hotel updated successfully
 *       400:
 *         description: Parameter error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Operator permission required or no permission
 *       404:
 *         description: Hotel not found
 */
router.put('/:id', authenticateJWT, requireOperator, updateHotel);

/**
 * @swagger
 * /api/hotels/{id}:
 *   delete:
 *     summary: Delete hotel (operator permission required)
 *     tags: [Hotel]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Hotel ID
 *     responses:
 *       200:
 *         description: Hotel deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Operator permission required or no permission
 *       404:
 *         description: Hotel not found
 */
router.delete('/:id', authenticateJWT, requireOperator, deleteHotel);

export default router; 