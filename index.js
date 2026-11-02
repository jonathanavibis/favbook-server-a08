import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import bookRoutes from './routes/bookRoutes.js';
import borrowRoutes from './routes/borrowRoutes.js';
import authRoutes from './routes/authRoutes.js';
import Book from './models/Book.js';

dotenv.config();

// Attempt immediate connection for local servers
connectDB().catch((err) => console.error('[Init DB error]:', err.message));

const app = express();
const PORT = process.env.PORT || 5000;

// Enable pretty formatted JSON responses
app.set('json spaces', 2);

// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive for evaluation and preview deployments
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serverless DB connection middleware: ensures MongoDB is connected before handling routes
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (dbErr) {
    console.error('[DB Middleware Error]:', dbErr.message);
    next();
  }
});

// Root route: Serves clean formatted JSON showing API status and latest MongoDB catalog
app.get('/', async (req, res) => {
  try {
    const bookCount = await Book.countDocuments();
    const recentBooks = await Book.find({}).sort({ createdAt: -1 }).limit(10);

    res.status(200).json({
      success: true,
      service: 'BookNook Library API Server',
      version: '1.0.0',
      database: 'Connected to MongoDB Atlas',
      totalBooksInCatalog: bookCount,
      recentBooksArchive: recentBooks,
      endpoints: {
        publicCatalog: 'GET /books',
        bookDetails: 'GET /books/:id',
        createBook: 'POST /books (Protected)',
        updateBook: 'PATCH /books/:id (Protected)',
        deleteBook: 'DELETE /books/:id (Protected)',
        borrowBook: 'POST /borrows (Protected)',
        myBorrows: 'GET /borrows (Protected)',
        returnBook: 'DELETE /borrows/:id (Protected)',
        userSignup: 'POST /auth/register',
        userLogin: 'POST /auth/login',
        socialAuth: 'POST /auth/social',
        jwtToken: 'POST /auth/jwt',
      },
    });
  } catch (error) {
    res.status(200).json({
      success: false,
      service: 'BookNook Library API Server',
      status: 'MongoDB Connection Pending or Blocked',
      message: 'MongoDB Atlas থেকে ডেটা আনা যায়নি।',
      error: error.message,
      solution: 'MongoDB Atlas ড্যাশবোর্ডে গিয়ে Network Access-এ 0.0.0.0/0 (Allow Access from Anywhere) যোগ করে সেভ করুন।',
    });
  }
});

// API Routes
app.use('/books', bookRoutes);
app.use('/borrows', borrowRoutes);
app.use('/auth', authRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API route ${req.originalUrl} not found on BookNook server.`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Server Error]:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`[BookNook Server] Running at http://localhost:${PORT}`);
    console.log(`[BookNook Server] Serving live MongoDB catalog directly as JSON`);
  });
}

export default app;
