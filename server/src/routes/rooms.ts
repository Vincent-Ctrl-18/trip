import { Router, Request, Response } from 'express';
import { RoomType, Hotel } from '../models';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

// POST /api/hotels/:hotelId/rooms
router.post('/hotels/:hotelId/rooms', authenticate, requireRole('merchant'), async (req: Request, res: Response) => {
  try {
    const hotel = await Hotel.findByPk(req.params.hotelId);
    if (!hotel) return res.status(404).json({ message: '酒店不存在' });
    if (hotel.merchant_id !== req.user!.id) return res.status(403).json({ message: '无权操作' });

    const { name, price, original_price, capacity, breakfast, images } = req.body;
    const room = await RoomType.create({
      hotel_id: hotel.id,
      name,
      price,
      original_price: original_price || null,
      capacity: capacity || 2,
      breakfast: breakfast || false,
      images: JSON.stringify(images || []),
    });
    res.json(room);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/rooms/:id
router.put('/rooms/:id', authenticate, requireRole('merchant'), async (req: Request, res: Response) => {
  try {
    const room = await RoomType.findByPk(req.params.id);
    if (!room) return res.status(404).json({ message: '房型不存在' });

    const hotel = await Hotel.findByPk(room.hotel_id);
    if (!hotel || hotel.merchant_id !== req.user!.id) return res.status(403).json({ message: '无权操作' });

    const { name, price, original_price, capacity, breakfast, images } = req.body;
    await room.update({
      name: name ?? room.name,
      price: price ?? room.price,
      original_price: original_price !== undefined ? original_price : room.original_price,
      capacity: capacity ?? room.capacity,
      breakfast: breakfast !== undefined ? breakfast : room.breakfast,
      images: images ? JSON.stringify(images) : room.images,
    });
    res.json(room);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/rooms/:id
router.delete('/rooms/:id', authenticate, requireRole('merchant'), async (req: Request, res: Response) => {
  try {
    const room = await RoomType.findByPk(req.params.id);
    if (!room) return res.status(404).json({ message: '房型不存在' });

    const hotel = await Hotel.findByPk(room.hotel_id);
    if (!hotel || hotel.merchant_id !== req.user!.id) return res.status(403).json({ message: '无权操作' });

    await room.destroy();
    res.json({ message: '已删除' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
