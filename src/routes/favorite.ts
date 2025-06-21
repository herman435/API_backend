import express from 'express';
import { getUserFavorites, addFavorite, removeFavorite, checkFavorite } from '../controllers/favoriteController';
import { authenticateJWT } from '../middlewares/auth';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Favorite
 *   description: Favorite Management
 */

/**
 * @swagger
 * /api/favorites:
 *   get:
 *     summary: Get user favorite list
 *     tags: [Favorite]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Favorite list
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticateJWT, getUserFavorites);

/**
 * @swagger
 * /api/favorites:
 *   post:
 *     summary: Add favorite
 *     tags: [Favorite]
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
 *             properties:
 *               hotelId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Favorite added successfully
 *       400:
 *         description: Parameter error
 *       401:
 *         description: Unauthorized
 */
router.post('/', authenticateJWT, addFavorite);

/**
 * @swagger
 * /api/favorites/{hotelId}:
 *   delete:
 *     summary: Remove favorite
 *     tags: [Favorite]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: hotelId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Removed successfully
 *       404:
 *         description: Favorite record does not exist
 *       401:
 *         description: Unauthorized
 */
router.delete('/:hotelId', authenticateJWT, removeFavorite);

/**
 * @swagger
 * /api/favorites/{hotelId}/check:
 *   get:
 *     summary: Check if favorited
 *     tags: [Favorite]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: hotelId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Check result
 *       401:
 *         description: Unauthorized
 */
router.get('/:hotelId/check', authenticateJWT, checkFavorite);

export default router; 