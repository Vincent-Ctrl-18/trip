import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models';
import { JWT_SECRET, authenticate } from '../middleware/auth';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { username, password, role, inviteCode } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: '用户名和密码不能为空' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: '密码至少6位' });
    }
    if (!['merchant', 'admin'].includes(role)) {
      return res.status(400).json({ message: '角色必须是 merchant 或 admin' });
    }
    // Admin registration requires invite code
    if (role === 'admin') {
      const expectedCode = process.env.ADMIN_INVITE_CODE || 'easystay-admin-2024';
      if (!inviteCode || inviteCode !== expectedCode) {
        return res.status(403).json({ message: '管理员邀请码无效' });
      }
    }
    const existing = await User.findOne({ where: { username } });
    if (existing) {
      return res.status(400).json({ message: '用户名已存在' });
    }
    const password_hash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, password_hash, role });
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: '用户名和密码不能为空' });
    }
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(400).json({ message: '用户名或密码错误' });
    }
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(400).json({ message: '用户名或密码错误' });
    }
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/auth/profile
router.get('/profile', authenticate, async (req: Request, res: Response) => {
  try {
    const user = await User.findByPk(req.user!.id, { attributes: ['id', 'username', 'role', 'created_at'] });
    if (!user) return res.status(404).json({ message: '用户不存在' });
    res.json(user);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
