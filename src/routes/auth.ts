import express from 'express';
import { register, login, changePassword } from '../controllers/authController';
import { authenticateJWT } from '../middlewares/auth';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: User Authentication
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: User Registration
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - role
 *               - registerCode
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [operator, user]
 *               registerCode:
 *                 type: string
 *     responses:
 *       201:
 *         description: Registration successful
 *       400:
 *         description: Parameter error
 */
router.post('/register', register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: User Login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Login failed
 */
router.post('/login', login);

/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     summary: Change User Password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/change-password', authenticateJWT, changePassword);

export default router; 