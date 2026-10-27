import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Import controller methods
import { registerUser, loginUser, getUserProfile } from './controllers/authController.js';
import { createItem, getItems, getItemById, updateItem, deleteItem, getMyItems, getMatches } from './controllers/itemController.js';
import { getAllUsers, deleteUser, getSystemStats } from './controllers/adminController.js';
import { createClaim, getClaimsForItem, updateClaimStatus } from './controllers/claimController.js';

// Import middlewares
import { protect, adminOnly } from './middleware/authMiddleware.js';

const app = express();

// Configure Middleware
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://mern-project-v4x4.onrender.com',
  // Allow all Firebase Hosting domains (including project-specific ones)
  /^https:\/\/.*\.firebaseapp\.com$/,
  /^https:\/\/.*\.web\.app$/,
  // Allow any onrender.com subdomain (for Render preview deploys)
  /^https:\/\/.*\.onrender\.com$/,
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (e.g., server-to-server, curl, Render health checks)
    if (!origin) return callback(null, true);
    const allowed = ALLOWED_ORIGINS.some((o) =>
      typeof o === 'string' ? o === origin : o.test(origin)
    );
    if (allowed) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked request from origin: ${origin}`);
      callback(new Error(`CORS policy: origin ${origin} not allowed`));
    }
  },
  credentials: true,
}));
app.use(express.json());

// Ensure uploads directory exists and serve it statically
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}
app.use('/uploads', express.static(uploadsDir));

// Multer setup for handling image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    cb(null, `${uniqueSuffix}-${safeName}`);
  }
});

const upload = multer({ storage });

// Initialize Database connection
connectDB();

// API Routes

// 1. Auth routes
app.post('/api/auth/register', registerUser);
app.post('/api/auth/login', loginUser);
app.get('/api/auth/profile', protect, getUserProfile);

// 2. Items routes
// Use `images` field for file uploads (max 5 files)
app.post('/api/items', protect, upload.array('images', 5), createItem);
app.get('/api/items', getItems);
app.get('/api/items/my', protect, getMyItems);
app.get('/api/items/:id', getItemById);
app.put('/api/items/:id', protect, upload.array('images', 5), updateItem);
app.delete('/api/items/:id', protect, deleteItem);
app.get('/api/items/:id/matches', protect, getMatches);

// Claim routes
app.post('/api/items/:id/claims', protect, createClaim);
app.get('/api/items/:id/claims', protect, getClaimsForItem);
app.put('/api/claims/:id/status', protect, updateClaimStatus);

// 3. Admin routes
app.get('/api/admin/users', protect, adminOnly, getAllUsers);
app.delete('/api/admin/users/:id', protect, adminOnly, deleteUser);
app.get('/api/admin/stats', protect, adminOnly, getSystemStats);

// Root endpoint and health checks
app.get('/api/status', (req, res) => {
  const dbStateMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  const dbState = mongoose.connection.readyState;
  res.json({
    status: 'running',
    database: dbStateMap[dbState] || 'unknown',
    databaseHost: mongoose.connection.host || null,
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// In production, serve frontend build if present
const candidateDistPaths = [
  path.resolve(__dirname, '..', 'frontend', 'dist'), // Relative to server.js in backend/
  path.resolve(process.cwd(), 'frontend', 'dist'),   // When cwd is repo root
  path.resolve(process.cwd(), '..', 'frontend', 'dist'), // When cwd is backend/
  path.resolve(process.cwd(), 'dist'),
  path.resolve(__dirname, 'dist')
];

const staticDist = candidateDistPaths.find((p) => fs.existsSync(path.join(p, 'index.html'))) || null;

if (staticDist) {
  console.log(`📁 Serving frontend static build from: ${staticDist}`);
  app.use(express.static(staticDist));
  // Serve index.html for all non-API routes so React Router handles navigation
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(staticDist, 'index.html'));
  });
} else {
  console.warn('⚠️ Frontend static build (index.html) not found. Serving API status endpoint on /.');
  // Fallback root endpoint for standalone API service
  app.get('/', (req, res) => {
    res.json({
      status: 'success',
      message: 'Lost and Found Portal API is running successfully',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString()
    });
  });
}

// Port configuration
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
