import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

import productRoutes from './routes/productRoutes.js';

dotenv.config();

const app = express();

/**
 * Middleware setup
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

/**
 * Route Handlers
 */
app.use('/api/v1/products', productRoutes);

/**
 * Basic Health Checks
 */
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Alpha Pharma API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    uptime: process.uptime()
  });
});

/**
 * Global Error Handler
 */
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

/**
 * 404 Handler
 */
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Resource not found: ${req.originalUrl}`
  });
});

export default app;
