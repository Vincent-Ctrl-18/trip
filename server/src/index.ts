import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { execSync } from 'child_process';
import rateLimit from 'express-rate-limit';
import { sequelize, Hotel } from './models';
import authRoutes from './routes/auth';
import hotelRoutes from './routes/hotels';
import uploadRoutes from './routes/upload';

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173').split(',').map(s => s.trim());
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 requests per window
  message: { message: '请求过于频繁，请稍后再试' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Static files - uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/upload', uploadRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Start
async function start() {
  try {
    await sequelize.sync({ alter: true });
    console.log('Database synced');

    // Auto-seed if database is empty (no hotels)
    const hotelCount = await Hotel.count();
    if (hotelCount === 0) {
      console.log('Database is empty, seeding initial data...');
      try {
        execSync('npx tsx src/seed.ts', {
          cwd: path.join(__dirname, '..'),
          stdio: 'inherit',
        });
        console.log('Seed data initialized successfully');
      } catch (seedErr) {
        console.error('Warning: Failed to seed initial data:', seedErr);
      }
    }

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
