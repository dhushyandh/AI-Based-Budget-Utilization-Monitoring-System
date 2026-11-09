import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import budgetRoutes from './routes/budgets.js';
import expenseRoutes from './routes/expenses.js';
import dashboardRoutes from './routes/dashboard.js';

const app = express();
app.set('trust proxy', 1);
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
if (process.env.CLIENT_ORIGIN) {
  app.use(cors({ origin: process.env.CLIENT_ORIGIN.split(',').map(value => value.trim()), credentials: false }));
}
app.use(express.json({ limit: '1mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.get('/api/health', async (_req, res) => {
  try {
    await connectDatabase();
    return res.status(200).json({
      status: 'ok',
      service: 'budget-monitor-api',
      database: 'connected'
    });
  } catch (error) {
    console.error('Health check database connection failed:', error.message);
    return res.status(503).json({
      status: 'error',
      service: 'budget-monitor-api',
      database: 'disconnected',
      reason: !process.env.MONGO_URI
        ? 'MONGO_URI is not configured'
        : 'MongoDB connection failed'
    });
  }
});

let databaseConnection;
async function connectDatabase() {
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  if (!process.env.MONGO_URI) {
    const error = new Error('Database is not configured. Set MONGO_URI in the deployment environment.');
    error.status = 503;
    throw error;
  }
  if (!databaseConnection) {
    databaseConnection = mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      maxPoolSize: 10,
      minPoolSize: 0
    }).catch(error => {
      databaseConnection = undefined;
      throw error;
    });
  }
  return databaseConnection;
}

app.use('/api', async (_req, _res, next) => {
  try {
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
      const error = new Error('Authentication service is not configured.');
      error.status = 503;
      throw error;
    }
    await connectDatabase();
    next();
  } catch (error) {
    console.error('API initialization failed:', error.message);
    next(error.status ? error : Object.assign(new Error('Database connection unavailable.'), { status: 503 }));
  }
});

app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 100, standardHeaders: 'draft-7', legacyHeaders: false }), authRoutes);
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: 'draft-7', legacyHeaders: false }));
app.use('/api/budgets', budgetRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use((err, _req, res, _next) => {
  console.error(err);
  if (err.name === 'CastError' || err.name === 'ValidationError') return res.status(400).json({ message: 'Invalid request data' });
  if (err.code === 11000) return res.status(409).json({ message: 'A record with this value already exists' });
  res.status(err.status || 500).json({ message: err.status && err.status < 500 ? err.message : 'Internal server error' });
});

if (!process.env.VERCEL) {
  const port = process.env.PORT || 5000;
  connectDatabase()
    .then(() => app.listen(port, () => console.log(`API running on port ${port}`)))
    .catch(error => { console.error('MongoDB connection failed:', error.message); process.exit(1); });
}

export default app;
