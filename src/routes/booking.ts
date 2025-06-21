import express from 'express';
import { 
  createBooking, 
  getUserBookings, 
  cancelBooking, 
  getBookingById,
  confirmBooking,
  completeBooking,
  getOperatorBookings
} from '../controllers/bookingController';
import { authenticateJWT, requireOperator } from '../middlewares/auth';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Booking
 *   description: Booking Management
 */

/**
 * @swagger
 * /api/bookings:
 *   post:
 *     summary: Create booking
 *     tags: [Booking]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - hotelId
 *               - checkInDate
 *               - checkOutDate
 *               - guestCount
 *             properties:
 *               hotelId:
 *                 type: integer
 *               checkInDate:
 *                 type: string
 *                 format: date
 *               checkOutDate:
 *                 type: string
 *                 format: date
 *               guestCount:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *               specialRequests:
 *                 type: string
 *     responses:
 *       201:
 *         description: Booking successful
 *       400:
 *         description: Parameter error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Hotel does not exist
 */
router.post('/', authenticateJWT, createBooking);

/**
 * @swagger
 * /api/bookings:
 *   get:
 *     summary: Get user booking list
 *     tags: [Booking]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Booking list
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticateJWT, getUserBookings);

/**
 * @swagger
 * /api/bookings/operator:
 *   get:
 *     summary: Get operator booking list
 *     tags: [Booking]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Operator booking list
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Operator permission required
 */
router.get('/operator', authenticateJWT, requireOperator, getOperatorBookings);

/**
 * @swagger
 * /api/bookings/{bookingId}:
 *   get:
 *     summary: Get booking detail
 *     tags: [Booking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Booking detail
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Booking does not exist
 */
router.get('/:bookingId', authenticateJWT, getBookingById);

/**
 * @swagger
 * /api/bookings/{bookingId}/cancel:
 *   post:
 *     summary: Cancel booking
 *     tags: [Booking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Cancel successful
 *       400:
 *         description: Unable to cancel
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Booking does not exist
 */
router.post('/:bookingId/cancel', authenticateJWT, cancelBooking);

/**
 * @swagger
 * /api/bookings/{bookingId}/confirm:
 *   post:
 *     summary: Operator confirm booking
 *     tags: [Booking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Confirm successful
 *       400:
 *         description: Unable to confirm
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Operator permission required
 *       404:
 *         description: Booking does not exist
 */
router.post('/:bookingId/confirm', authenticateJWT, requireOperator, confirmBooking);

/**
 * @swagger
 * /api/bookings/{bookingId}/complete:
 *   post:
 *     summary: Operator complete booking
 *     tags: [Booking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Complete successful
 *       400:
 *         description: Unable to complete
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Operator permission required
 *       404:
 *         description: Booking does not exist
 */
router.post('/:bookingId/complete', authenticateJWT, requireOperator, completeBooking);

export default router; 