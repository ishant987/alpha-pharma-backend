import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
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

const PRODUCTS = [
  { serial: "SN1001", code: "ALPHA123", mfg: "02/2022 or before", name: "Astralean 40mcg - 50 tablets", token: "01" },
  { serial: "SN1002", code: "BRAVO457", mfg: "02/2022 or before", name: "Cardioplus 10mg - 30 tablets", token: "02" },
  { serial: "SN1003", code: "CHARLIE892", mfg: "02/2022 or before", name: "Neurovita B12 - 60 capsules", token: "03" },
  { serial: "SN1004", code: "DELTA310", mfg: "02/2022 or before", name: "GastroCare 20mg - 15 tablets", token: "04" },
  { serial: "SN1005", code: "ECHO765", mfg: "02/2022 or before", name: "ImmunoShield C - 100 tablets", token: "05" },
  { serial: "SN1006", code: "FOXTROT221", mfg: "02/2022 or before", name: "PainRelief XR 500mg - 10 tablets", token: "06" },
  { serial: "SN1007", code: "GOLF908", mfg: "02/2022 or before", name: "RespiraClear 5mg - 20 tablets", token: "07" },
  { serial: "SN1008", code: "HOTEL634", mfg: "02/2022 or before", name: "Dermacalm Lotion - 100ml", token: "08" },
  { serial: "SN1009", code: "INDIA519", mfg: "02/2022 or before", name: "OcuVision Plus - 30 softgels", token: "09" },
  { serial: "SN1010", code: "JULIET842", mfg: "02/2022 or before", name: "VitaBoost Zinc - 90 tablets", token: "10" },
  { serial: "SN1011", code: "BETA456", mfg: "03/2022 or after", name: "Alphabol 10mg - 50 tablets", token: "11" },
  { serial: "SN1012", code: "LIMA204", mfg: "03/2022 or after", name: "GlucoGuard 500mg - 30 tablets", token: "12" },
  { serial: "SN1013", code: "MIKE639", mfg: "03/2022 or after", name: "NeuroCalm 25mg - 15 tablets", token: "13" },
  { serial: "SN1014", code: "NOVEMBER115", mfg: "03/2022 or after", name: "HeartSafe 75mg - 14 tablets", token: "014" },
  { serial: "SN1015", code: "OSCAR903", mfg: "03/2022 or after", name: "AllerFree 5mg - 10 tablets", token: "15" },
  { serial: "SN1016", code: "PAPA472", mfg: "03/2022 or after", name: "VitaD3 Max - 8 capsules", token: "16" },
  { serial: "SN1017", code: "QUEBEC388", mfg: "03/2022 or after", name: "LiverCare Forte - 60 tablets", token: "17" },
  { serial: "SN1018", code: "ROMEO726", mfg: "03/2022 or after", name: "RespiraAid Syrup - 100ml", token: "18" },
  { serial: "SN1019", code: "SIERRA550", mfg: "03/2022 or after", name: "PainBlock Gel - 30g", token: "19" },
];

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



// Verification schema (stores who verified what and when)
const verificationSchema = new mongoose.Schema({
  authKey: { type: String, unique: true },
  productName: { type: String },
  verifiedAt: { type: Date, default: Date.now }
});
const Verification = mongoose.models.Verification || mongoose.model('Verification', verificationSchema);

// /verify endpoint
app.post('/verify', async (req, res) => {
  try {
    const { token, code, serial, mfg } = req.body;

    // Find product by token OR by code+serial+mfg
    let product = null;
    if (token) {
      product = PRODUCTS.find(p => p.token === token.trim());
    } else if (code) {
      const cleanCode = code.trim().toUpperCase();
      const cleanMfg = (mfg || '').trim();
      product = PRODUCTS.find(p => {
        const serialRequired = p.mfg !== '03/2022 or after';
        return (
          p.code.toUpperCase() === cleanCode &&
          p.mfg === cleanMfg &&
          (serialRequired ? p.serial.toUpperCase() === (serial || '').trim().toUpperCase() : true)
        );
      });
    }

    if (!product) {
      return res.json({ status: 'fail' });
    }

    // Build a unique key for this product
    const authKey = product.mfg === '03/2022 or after'
      ? `auth_${product.code}_${product.mfg}`
      : `auth_${product.code}_${product.serial}_${product.mfg}`;

    // Check if already verified
    const existing = await Verification.findOne({ authKey });
    if (existing) {
      return res.json({
        status: 'duplicate',
        productName: existing.productName,
        verifiedAt: existing.verifiedAt
      });
    }

    // First-time verification — save it
    await Verification.create({ authKey, productName: product.name });
    return res.json({ status: 'success', productName: product.name });

  } catch (err) {
    console.error('/verify error:', err);
    return res.status(500).json({ status: 'fail' });
  }
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
