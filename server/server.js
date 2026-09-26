import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import { connectDB } from './config/db.js';
import { testSupabaseConnection } from './config/supabase.js';
import User from './models/User.js';
import { seedDemoData } from './seed/seedData.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import familyRoutes from './routes/familyRoutes.js';
import reminderRoutes from './routes/reminderRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import shareRoutes from './routes/shareRoutes.js';
import warrantyRoutes from './routes/warrantyRoutes.js';
import billRoutes from './routes/billRoutes.js';
import activityRoutes from './routes/activityRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, '../uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middlewares
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
app.use(morgan('dev'));

// Static serve uploads for document previews & downloads
app.use('/uploads', express.static(uploadsDir));

// Rate limiter for authentication routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests from this IP, please try again later.' },
});

// API Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/family', familyRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/shares', shareRoutes);
app.use('/api/warranties', warrantyRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoutes);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  const supabaseStatus = await testSupabaseConnection();
  res.json({
    status: 'healthy',
    product: 'FamilyVault',
    version: '1.0.0',
    database: {
      engine: 'mongodb',
      connected: true,
      supabase: supabaseStatus,
    },
    timestamp: new Date().toISOString(),
  });
});

// Dedicated Supabase status endpoint
app.get('/api/supabase/status', async (req, res) => {
  const status = await testSupabaseConnection();
  res.json({
    success: true,
    supabase: status,
  });
});

// 404 handler for undefined API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: 'API endpoint not found.' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'An unexpected internal server error occurred.',
  });
});

// Start Server and Auto-Seed Demo Data if needed
const startServer = async () => {
  try {
    await connectDB();

    // Check if demo user exists, if not auto-seed
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('📦 No existing users found. Auto-seeding Demo Account and FamilyVault records...');
      await seedDemoData();
    } else {
      console.log(`ℹ️ Database contains ${userCount} user accounts.`);
    }

    app.listen(PORT, () => {
      console.log(`🚀 FamilyVault Server running at http://localhost:${PORT}`);
      console.log(`📂 Uploads directory mounted at http://localhost:${PORT}/uploads`);
      console.log(`🔑 Demo Login: demo@familyvault.app / Demo@123`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
