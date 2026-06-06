import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';

// Load environment variables
dotenv.config();

// Import controller methods
import { registerUser, loginUser, getUserProfile } from './controllers/authController.js';
import { createItem, getItems, getItemById, updateItem, deleteItem, getMyItems, getMatches } from './controllers/itemController.js';
import { getAllUsers, deleteUser, getSystemStats } from './controllers/adminController.js';

// Import middlewares
import { protect, adminOnly } from './middleware/authMiddleware.js';

const app = express();

// Configure Middleware
app.use(cors());
app.use(express.json());

// Initialize Database connection
connectDB();

// API Routes

// 1. Auth routes
app.post('/api/auth/register', registerUser);
app.post('/api/auth/login', loginUser);
app.get('/api/auth/profile', protect, getUserProfile);

// 2. Items routes
app.post('/api/items', protect, createItem);
app.get('/api/items', getItems);
app.get('/api/items/my', protect, getMyItems);
app.get('/api/items/:id', getItemById);
app.put('/api/items/:id', protect, updateItem);
app.delete('/api/items/:id', protect, deleteItem);
app.get('/api/items/:id/matches', protect, getMatches);

// 3. Admin routes
app.get('/api/admin/users', protect, adminOnly, getAllUsers);
app.delete('/api/admin/users/:id', protect, adminOnly, deleteUser);
app.get('/api/admin/stats', protect, adminOnly, getSystemStats);

// Status endpoint
app.get('/api/status', (req, res) => {
  res.json({ status: 'running', timestamp: new Date() });
});

// Port configuration
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
