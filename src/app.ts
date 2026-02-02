import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { authenticateApiKey } from './middleware/auth';
import { errorHandler } from './middleware/errorHandler';
import eventsRouter from './routes/events';
import dealsRouter from './routes/deals';
import attributionRouter from './routes/attribution';
import partnersRouter from './routes/partners';
import analyticsRouter from './routes/analytics';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.RATE_LIMIT_MAX ? parseInt(process.env.RATE_LIMIT_MAX) : 100,
  message: 'Too many requests from this IP, please try again later.'
});

app.use(limiter);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check (no auth required)
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// API documentation
app.get('/', (req, res) => {
  res.json({
    name: 'Partner Attribution API',
    version: '1.0.0',
    endpoints: {
      'POST /events': 'Track attribution event',
      'GET /events': 'List events',
      'POST /deals': 'Record deal closed',
      'GET /deals': 'List deals',
      'GET /deals/:id': 'Get deal details',
      'GET /attribution/:dealId': 'Get attribution for a deal',
      'POST /attribution/:dealId/recalculate': 'Force recalculation',
      'GET /partners': 'List partners',
      'POST /partners': 'Add partner',
      'GET /partners/:id': 'Get partner details',
      'GET /analytics': 'Dashboard analytics',
      'GET /analytics/partner/:partnerId': 'Partner-specific analytics'
    },
    models: ['equal', 'role-based', 'first-touch', 'last-touch', 'time-decay'],
    authentication: 'API key required (X-API-Key header)'
  });
});

// Protected routes (require API key)
app.use('/events', authenticateApiKey, eventsRouter);
app.use('/deals', authenticateApiKey, dealsRouter);
app.use('/attribution', authenticateApiKey, attributionRouter);
app.use('/partners', authenticateApiKey, partnersRouter);
app.use('/analytics', authenticateApiKey, analyticsRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler (must be last)
app.use(errorHandler);

export default app;
