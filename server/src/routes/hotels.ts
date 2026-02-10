import { Router, Request, Response } from 'express';
import { Op, Sequelize } from 'sequelize';
import { Hotel, RoomType, NearbyPlace, sequelize as db } from '../models';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

// ========== Named routes MUST come before /:id ==========

// GET /api/hotels/search
router.get('/search', async (req: Request, res: Response) => {
  try {
    const { city, keyword, star, minPrice, maxPrice, tag, page = '1', pageSize = '10' } = req.query;
    const where: any = { status: 'approved' };

    if (city) where.city = city as string;
    if (keyword) {
      const kw = String(keyword).replace(/[%_]/g, '\\$&'); // escape SQL wildcards
      where[Op.or] = [
        { name_cn: { [Op.like]: `%${kw}%` } },
        { name_en: { [Op.like]: `%${kw}%` } },
        { address: { [Op.like]: `%${kw}%` } },
      ];
    }
    if (star) where.star = Number(star);
    if (tag) {
      const safeTag = String(tag).replace(/[%_]/g, '\\$&');
      where.tags = { [Op.like]: `%"${safeTag}"%` };
    }

    // Filter by price range at SQL level using subquery
    if (minPrice || maxPrice) {
      const priceConditions: string[] = [];
      if (minPrice) priceConditions.push(`min_price >= ${Number(minPrice)}`);
      if (maxPrice) priceConditions.push(`min_price <= ${Number(maxPrice)}`);
      where.id = {
        [Op.in]: Sequelize.literal(
          `(SELECT hotel_id FROM room_types GROUP BY hotel_id HAVING ${priceConditions.join(' AND ')})`
        ),
      };
      // alias min_price = MIN(price) in the subquery
      where.id = {
        [Op.in]: Sequelize.literal(
          `(SELECT hotel_id FROM room_types GROUP BY hotel_id HAVING ${priceConditions.map(c => c.replace('min_price', 'MIN(price)')).join(' AND ')})`
        ),
      };
    }

    const offset = (Number(page) - 1) * Number(pageSize);
    const { rows, count } = await Hotel.findAndCountAll({
      where,
      include: [{ model: RoomType, as: 'RoomTypes' }],
      limit: Number(pageSize),
      offset,
      order: [['updated_at', 'DESC']],
      distinct: true,
    });

    // Add lowestPrice to each hotel
    const result = rows.map((h) => {
      const plain: any = h.toJSON();
      const rooms = plain.RoomTypes || [];
      plain.lowestPrice = rooms.length > 0 ? Math.min(...rooms.map((r: any) => r.price)) : null;
      return plain;
    });

    res.json({ total: count, page: Number(page), pageSize: Number(pageSize), data: result });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/hotels/banner
router.get('/banner', async (_req: Request, res: Response) => {
  try {
    const hotels = await Hotel.findAll({
      where: { status: 'approved' },
      limit: 5,
      order: [['star', 'DESC'], ['updated_at', 'DESC']],
      attributes: ['id', 'name_cn', 'name_en', 'images', 'star', 'city'],
    });
    res.json(hotels);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/hotels/my - merchant's own hotels
router.get('/my', authenticate, requireRole('merchant'), async (req: Request, res: Response) => {
  try {
    const hotels = await Hotel.findAll({
      where: { merchant_id: req.user!.id },
      include: [{ model: RoomType, as: 'RoomTypes' }],
      order: [['updated_at', 'DESC']],
    });
    res.json(hotels);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/hotels/review - admin review list
router.get('/review', authenticate, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    const where: any = {};
    if (status) where.status = status;
    const hotels = await Hotel.findAll({
      where,
      include: [{ model: RoomType, as: 'RoomTypes' }],
      order: [['updated_at', 'DESC']],
    });
    res.json(hotels);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// ========== Parameterized routes ==========

// GET /api/hotels/:id - hotel detail
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const hotel = await Hotel.findByPk(req.params.id, {
      include: [
        { model: RoomType, as: 'RoomTypes' },
        { model: NearbyPlace, as: 'NearbyPlaces' },
      ],
    });
    if (!hotel) return res.status(404).json({ message: '酒店不存在' });
    res.json(hotel);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/hotels - create hotel
router.post('/', authenticate, requireRole('merchant'), async (req: Request, res: Response) => {
  try {
    const { name_cn, name_en, city, address, star, opening_date, description, tags, facilities, images, rooms, nearbyPlaces } = req.body;
    const hotel = await Hotel.create({
      name_cn, name_en: name_en || '', city, address,
      star: star || 3,
      opening_date: opening_date || '',
      description: description || '',
      tags: JSON.stringify(tags || []),
      facilities: JSON.stringify(facilities || []),
      images: JSON.stringify(images || []),
      merchant_id: req.user!.id,
      status: 'draft',
    });
    if (rooms && rooms.length > 0) {
      for (const room of rooms) {
        await RoomType.create({
          hotel_id: hotel.id,
          name: room.name,
          price: room.price,
          original_price: room.original_price || null,
          capacity: room.capacity || 2,
          breakfast: room.breakfast || false,
          images: JSON.stringify(room.images || []),
        });
      }
    }
    if (nearbyPlaces && nearbyPlaces.length > 0) {
      for (const place of nearbyPlaces) {
        await NearbyPlace.create({
          hotel_id: hotel.id,
          type: place.type,
          name: place.name,
          distance: place.distance,
        });
      }
    }
    const result = await Hotel.findByPk(hotel.id, {
      include: [{ model: RoomType, as: 'RoomTypes' }, { model: NearbyPlace, as: 'NearbyPlaces' }],
    });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/hotels/:id - update hotel
router.put('/:id', authenticate, requireRole('merchant'), async (req: Request, res: Response) => {
  try {
    const hotel = await Hotel.findByPk(req.params.id);
    if (!hotel) return res.status(404).json({ message: '酒店不存在' });
    if (hotel.merchant_id !== req.user!.id) return res.status(403).json({ message: '无权修改该酒店' });

    const { name_cn, name_en, city, address, star, opening_date, description, tags, facilities, images, rooms, nearbyPlaces } = req.body;
    await hotel.update({
      name_cn: name_cn ?? hotel.name_cn,
      name_en: name_en ?? hotel.name_en,
      city: city ?? hotel.city,
      address: address ?? hotel.address,
      star: star ?? hotel.star,
      opening_date: opening_date ?? hotel.opening_date,
      description: description ?? hotel.description,
      tags: tags ? JSON.stringify(tags) : hotel.tags,
      facilities: facilities ? JSON.stringify(facilities) : hotel.facilities,
      images: images ? JSON.stringify(images) : hotel.images,
      updated_at: new Date(),
    });

    if (rooms) {
      await RoomType.destroy({ where: { hotel_id: hotel.id } });
      for (const room of rooms) {
        await RoomType.create({
          hotel_id: hotel.id,
          name: room.name,
          price: room.price,
          original_price: room.original_price || null,
          capacity: room.capacity || 2,
          breakfast: room.breakfast || false,
          images: JSON.stringify(room.images || []),
        });
      }
    }

    if (nearbyPlaces) {
      await NearbyPlace.destroy({ where: { hotel_id: hotel.id } });
      for (const place of nearbyPlaces) {
        await NearbyPlace.create({
          hotel_id: hotel.id,
          type: place.type,
          name: place.name,
          distance: place.distance,
        });
      }
    }

    const result = await Hotel.findByPk(hotel.id, {
      include: [{ model: RoomType, as: 'RoomTypes' }, { model: NearbyPlace, as: 'NearbyPlaces' }],
    });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/hotels/:id/submit - submit for review
router.post('/:id/submit', authenticate, requireRole('merchant'), async (req: Request, res: Response) => {
  try {
    const hotel = await Hotel.findByPk(req.params.id);
    if (!hotel) return res.status(404).json({ message: '酒店不存在' });
    if (hotel.merchant_id !== req.user!.id) return res.status(403).json({ message: '无权操作' });
    if (!['draft', 'rejected'].includes(hotel.status)) {
      return res.status(400).json({ message: '当前状态不可提交审核' });
    }
    await hotel.update({ status: 'pending', reject_reason: '', updated_at: new Date() });
    res.json({ message: '已提交审核' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/hotels/:id/approve
router.put('/:id/approve', authenticate, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const hotel = await Hotel.findByPk(req.params.id);
    if (!hotel) return res.status(404).json({ message: '酒店不存在' });
    if (hotel.status !== 'pending') {
      return res.status(400).json({ message: '只有待审核状态的酒店可以通过审核' });
    }
    await hotel.update({ status: 'approved', reject_reason: '', updated_at: new Date() });
    res.json({ message: '审核通过' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/hotels/:id/reject
router.put('/:id/reject', authenticate, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const hotel = await Hotel.findByPk(req.params.id);
    if (!hotel) return res.status(404).json({ message: '酒店不存在' });
    if (hotel.status !== 'pending') {
      return res.status(400).json({ message: '只有待审核状态的酒店可以拒绝' });
    }
    const { reason } = req.body;
    await hotel.update({ status: 'rejected', reject_reason: reason || '未通过审核', updated_at: new Date() });
    res.json({ message: '已拒绝' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/hotels/:id/offline
router.put('/:id/offline', authenticate, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const hotel = await Hotel.findByPk(req.params.id);
    if (!hotel) return res.status(404).json({ message: '酒店不存在' });
    if (hotel.status !== 'approved') {
      return res.status(400).json({ message: '只有已通过的酒店可以下线' });
    }
    await hotel.update({ status: 'offline', updated_at: new Date() });
    res.json({ message: '已下线' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/hotels/:id/online
router.put('/:id/online', authenticate, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const hotel = await Hotel.findByPk(req.params.id);
    if (!hotel) return res.status(404).json({ message: '酒店不存在' });
    if (hotel.status !== 'offline') {
      return res.status(400).json({ message: '只有已下线的酒店可以恢复上线' });
    }
    await hotel.update({ status: 'approved', updated_at: new Date() });
    res.json({ message: '已恢复上线' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
