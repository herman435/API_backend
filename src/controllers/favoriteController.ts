import { Request, Response } from 'express';
import { Favorite } from '../models/Favorite';
import { Hotel } from '../models/Hotel';

export const getUserFavorites = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const favorites = await Favorite.findAll({
      where: { userId },
      include: [
        {
          model: Hotel,
          attributes: ['id', 'name', 'address', 'price', 'availableRooms'],
        },
      ],
    });

    const favoriteHotels = favorites.map(favorite => ({
      id: favorite.hotelId,
      name: (favorite as any).Hotel.name,
      address: (favorite as any).Hotel.address,
      price: (favorite as any).Hotel.price,
      availableRooms: (favorite as any).Hotel.availableRooms,
    }));

    return res.json(favoriteHotels);
  } catch (err) {
    console.error('Failed to get user favorites:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};


export const addFavorite = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { hotelId } = req.body;

    if (!hotelId) {
      return res.status(400).json({ message: 'Missing hotel ID' });
    }

    const hotel = await Hotel.findByPk(hotelId);
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel does not exist' });
    }


    const existingFavorite = await Favorite.findOne({
      where: { userId, hotelId },
    });

    if (existingFavorite) {
      return res.status(400).json({ message: 'Already favorited this hotel' });
    }

    await Favorite.create({ userId, hotelId });

    return res.status(201).json({ message: 'Favorite added successfully' });
  } catch (err) {
    console.error('Failed to add favorite:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const removeFavorite = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { hotelId } = req.params;

    const favorite = await Favorite.findOne({
      where: { userId, hotelId: parseInt(hotelId) },
    });

    if (!favorite) {
      return res.status(404).json({ message: 'Favorite record does not exist' });
    }

    await favorite.destroy();

    return res.json({ message: 'Favorite removed successfully' });
  } catch (err) {
    console.error('Failed to remove favorite:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const checkFavorite = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { hotelId } = req.params;

    const favorite = await Favorite.findOne({
      where: { userId, hotelId: parseInt(hotelId) },
    });

    return res.json({ isFavorite: !!favorite });
  } catch (err) {
    console.error('Failed to check favorite status:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}; 