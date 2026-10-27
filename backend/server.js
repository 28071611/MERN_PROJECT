import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

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
app.use(cors());
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

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Lost and Found Portal API is running successfully',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Status endpoint
app.get('/api/status', (req, res) => {
  res.json({ status: 'running', timestamp: new Date() });
});


// Port configuration
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
