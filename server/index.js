/**
 * Rail Sandbox Backend Server
 * Express.js server that proxies requests to the Rail Sandbox API
 * Runs on port 3001, serves frontend on port 5173
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase } from './db.js';

// Import route handlers
import applicationsRouter from './routes/applications.js';
import customersRouter from './routes/customers.js';
import accountsRouter from './routes/accounts.js';
import transactionsRouter from './routes/transactions.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ============================================================================
// MIDDLEWARE
// ============================================================================

// Enable CORS for React frontend
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON request bodies
app.use(express.json());

// ============================================================================
// DATABASE INITIALIZATION
// ============================================================================

// ============================================================================
// STARTUP — initialize DB (async) then mount routes and listen
// ============================================================================

async function start() {
  // Initialize SQLite database tables (sql.js is async)
  await initializeDatabase();

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API routes
  app.use('/api/applications', applicationsRouter);
  app.use('/api/customers', customersRouter);
  app.use('/api/accounts', accountsRouter);
  app.use('/api/transactions', transactionsRouter);

  // Global error handling middleware
  app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(err.status || 500).json({
      error: 'Internal server error',
      message: err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  });

  // 404 handler for undefined routes
  app.use((req, res) => {
    res.status(404).json({
      error: 'Route not found',
      method: req.method,
      path: req.path
    });
  });

  app.listen(PORT, () => {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Rail Sandbox Backend Server`);
    console.log(`${'='.repeat(60)}`);
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Frontend: http://localhost:5173`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`${'='.repeat(60)}\n`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
