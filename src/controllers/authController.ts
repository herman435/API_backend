import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

const OPERATOR_REGISTER_CODE = 'WANDERLUST2025'; 
const JWT_SECRET = process.env.JWT_SECRET || 'wanderlust_secret';

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, role, registerCode } = req.body;
    if (!email || !password || !role) {
      return res.status(400).json({ message: 'Missing required parameters' });
    }
    if (role === 'operator' && registerCode !== OPERATOR_REGISTER_CODE) {
      return res.status(400).json({ message: 'Invalid operator register code' });
    }
    const exist = await User.findOne({ where: { email } });
    if (exist) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hash, role });
    return res.status(201).json({ message: 'Registration successful', user: { id: user.id, email: user.email, role: user.role } });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'User does not exist' });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: 'Incorrect password' });
    }
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    return res.status(200).json({ token, user: { id: user.id, email: user.email, role: user.role } });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Missing parameters' });
    }
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }
    const hash = await bcrypt.hash(newPassword, 10);
    user.password = hash;
    await user.save();
    return res.json({ message: 'Password changed successfully' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
}; 