import { Request, Response } from 'express';
import { Hotel } from '../models/Hotel';
import { User } from '../models/User';
import { Op } from 'sequelize';

export const getHotels = async (req: Request, res: Response) => {
  try {
    const { name } = req.query;
    const where: any = {};
    if (name) {
      where.name = { [Op.like]: `%${name}%` };
    }
    const hotels = await Hotel.findAll({ where });
    return res.json(hotels);
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};

export const getHotelById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const hotel = await Hotel.findByPk(id);
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }
    return res.json(hotel);
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};

export const createHotel = async (req: Request, res: Response) => {
  try {
    const { name, address, description, price, availableRooms } = req.body;
    const operatorId = (req as any).user.id;
    if (!name || !address || !price || !availableRooms) {
      return res.status(400).json({ message: 'Missing required parameters' });
    }
    const hotel = await Hotel.create({ name, address, description, price, availableRooms, operatorId });
    return res.status(201).json(hotel);
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};

export const updateHotel = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const operatorId = (req as any).user.id;
    const hotel = await Hotel.findByPk(id);
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }
    if (hotel.operatorId !== operatorId) {
      return res.status(403).json({ message: 'No permission' });
    }
    await hotel.update(req.body);
    return res.json(hotel);
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};

export const deleteHotel = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const operatorId = (req as any).user.id;
    const hotel = await Hotel.findByPk(id);
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }
    if (hotel.operatorId !== operatorId) {
      return res.status(403).json({ message: 'No permission' });
    }
    await hotel.destroy();
    return res.json({ message: 'Delete successful' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
}; 