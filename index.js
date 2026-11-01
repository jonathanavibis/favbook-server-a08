import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import connectDB from './config/db.js';
import Book from './models/Book.js';
import { initialBooks } from './data/initialBooks.js';

import bookRoutes from './routes/bookRoutes.js';
import borrowRoutes from './routes/borrowRoutes.js';
import authRoutes from './routes/authRoutes.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB Atlas
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Format JSON responses with clean 2-space indentation
app.set('json spaces', 2);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root Route: Show API status and live library collection
app.get('/', async (req, res) => {
  try {
    const books = await Book.find({}).sort({ createdAt: -1 }).limit(10);
    if (books && books.length > 0) {
      return res.json({
        message: 'Welcome to BookHype Online Library API Server',
        status: 'online',
        database: 'connected',
        totalSampleBooks: books.length,
        books,
      });
    }
    return res.json({
      message: 'Welcome to BookHype Online Library API Server',
      status: 'online',
      database: 'connected',
      initialBooks,
    });
  } catch (error) {
    return res.json({
      message: 'Welcome to BookHype Online Library API Server',
      status: 'online',
      error: error.message,
      initialBooks,
    });
  }
});

// Mount Routes (supports both direct and /api prefixes)
app.use('/books', bookRoutes);
app.use('/api/books', bookRoutes);

app.use('/borrows', borrowRoutes);
app.use('/api/borrows', borrowRoutes);

app.use('/auth', authRoutes);
app.use('/api/auth', authRoutes);

// JWT Token Issuance Endpoint
app.post('/jwt', (req, res) => {
  const user = req.body;
  if (!user || !user.email) {
    return res.status(400).json({ success: false, message: 'User payload required' });
  }
  const secret =
    process.env.JWT_SECRET ||
    process.env.BETTER_AUTH_SECRET ||
    'bookhype_secret_key_super_secure_2026_jwt_token';
  const token = jwt.sign(user, secret, { expiresIn: '30d' });
  return res.json({ success: true, token });
});

// 404 Handler for Unrecognized Endpoints
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Start Server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[BookHype API] Server listening on port ${PORT}`);
  });
}

export default app;
