import { Request, Response } from 'express';
import { Booking } from '../models/Booking';
import { Hotel } from '../models/Hotel';
import { Op } from 'sequelize';
import { User } from '../models/User';


export const createBooking = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { hotelId, checkInDate, checkOutDate, guestCount, specialRequests } = req.body;

    if (!hotelId || !checkInDate || !checkOutDate || !guestCount) {
      return res.status(400).json({ message: 'Missing required parameters' });
    }

    const hotel = await Hotel.findByPk(hotelId);
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel does not exist' });
    }

    if (hotel.availableRooms <= 0) {
      return res.status(400).json({ message: 'No available rooms in this hotel' });
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkIn < today) {
      return res.status(400).json({ message: 'Check-in date cannot be earlier than today' });
    }

    if (checkOut <= checkIn) {
      return res.status(400).json({ message: 'Check-out date must be after check-in date' });
    }

    if (guestCount < 1 || guestCount > 10) {
      return res.status(400).json({ message: 'Guest count must be between 1 and 10' });
    }

    const days = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    
    const totalPrice = Number(hotel.price) * days;


    const booking = await Booking.create({
      userId,
      hotelId,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      guestCount,
      specialRequests,
      totalPrice,
      status: 'pending',
    });

    await hotel.update({
      availableRooms: hotel.availableRooms - 1,
    });

    return res.status(201).json({
      message: 'Booking successful',
      booking: {
        id: booking.id,
        hotelName: hotel.name,
        checkInDate: booking.checkInDate,
        checkOutDate: booking.checkOutDate,
        guestCount: booking.guestCount,
        totalPrice: booking.totalPrice,
        status: booking.status,
      },
    });
  } catch (err) {
    console.error('Failed to create booking:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const getUserBookings = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const bookings = await Booking.findAll({
      where: { userId },
      include: [
        {
          model: Hotel,
          attributes: ['id', 'name', 'address', 'price'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    const bookingList = bookings.map(booking => ({
      id: booking.id,
      hotelName: (booking as any).Hotel.name,
      hotelAddress: (booking as any).Hotel.address,
      checkInDate: booking.checkInDate,
      checkOutDate: booking.checkOutDate,
      guestCount: booking.guestCount,
      totalPrice: booking.totalPrice,
      status: booking.status,
      specialRequests: booking.specialRequests,
      createdAt: booking.createdAt,
    }));

    return res.json(bookingList);
  } catch (err) {
    console.error('Failed to get booking list:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const cancelBooking = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { bookingId } = req.params;

    const booking = await Booking.findOne({
      where: { id: bookingId, userId },
      include: [{ model: Hotel }],
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking record does not exist' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Booking already cancelled' });
    }

    if (booking.status === 'completed') {
      return res.status(400).json({ message: 'Completed bookings cannot be cancelled' });
    }

    await booking.update({ status: 'cancelled' });

    const hotel = (booking as any).Hotel;
    await hotel.update({
      availableRooms: hotel.availableRooms + 1,
    });

    return res.json({ message: 'Booking cancelled' });
  } catch (err) {
    console.error('Failed to cancel booking:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};


export const getBookingById = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { bookingId } = req.params;

    const booking = await Booking.findOne({
      where: { id: bookingId, userId },
      include: [
        {
          model: Hotel,
          attributes: ['id', 'name', 'address', 'price', 'description'],
        },
      ],
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking record does not exist' });
    }

    return res.json({
      id: booking.id,
      hotelName: (booking as any).Hotel.name,
      hotelAddress: (booking as any).Hotel.address,
      hotelDescription: (booking as any).Hotel.description,
      checkInDate: booking.checkInDate,
      checkOutDate: booking.checkOutDate,
      guestCount: booking.guestCount,
      totalPrice: booking.totalPrice,
      status: booking.status,
      specialRequests: booking.specialRequests,
      createdAt: booking.createdAt,
    });
  } catch (err) {
    console.error('Failed to get booking detail:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const confirmBooking = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;
    const operatorId = (req as any).user.id;

    const booking = await Booking.findOne({
      where: { id: bookingId },
      include: [{ model: Hotel }],
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking record does not exist' });
    }

    const hotel = (booking as any).Hotel;
    if (hotel.operatorId !== operatorId) {
      return res.status(403).json({ message: 'No permission to operate this booking' });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending bookings can be confirmed' });
    }

    await booking.update({ status: 'confirmed' });

    return res.json({ message: 'Booking confirmed' });
  } catch (err) {
    console.error('Failed to confirm booking:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};


export const completeBooking = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;
    const operatorId = (req as any).user.id;

    const booking = await Booking.findOne({
      where: { id: bookingId },
      include: [{ model: Hotel }],
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking record does not exist' });
    }

    const hotel = (booking as any).Hotel;
    if (hotel.operatorId !== operatorId) {
      return res.status(403).json({ message: 'No permission to operate this booking' });
    }

    if (booking.status !== 'confirmed') {
      return res.status(400).json({ message: 'Only confirmed bookings can be completed' });
    }

    await booking.update({ status: 'completed' });

    return res.json({ message: 'Booking completed' });
  } catch (err) {
    console.error('Failed to complete booking:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const getOperatorBookings = async (req: Request, res: Response) => {
  try {
    const operatorId = (req as any).user.id;
    const bookings = await Booking.findAll({
      include: [
        {
          model: Hotel,
          where: { operatorId },
          attributes: ['id', 'name', 'address', 'price'],
        },
        {
          model: User,
          attributes: ['id', 'email'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    const bookingList = bookings.map(booking => ({
      id: booking.id,
      hotelName: (booking as any).Hotel.name,
      hotelAddress: (booking as any).Hotel.address,
      userEmail: (booking as any).User.email,
      checkInDate: booking.checkInDate,
      checkOutDate: booking.checkOutDate,
      guestCount: booking.guestCount,
      totalPrice: booking.totalPrice,
      status: booking.status,
      specialRequests: booking.specialRequests,
      createdAt: booking.createdAt,
    }));

    return res.json(bookingList);
  } catch (err) {
    console.error('Failed to get operator booking list:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}; 