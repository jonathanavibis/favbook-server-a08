import express from 'express';
import {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
} from '../controllers/bookController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getBooks);
router.get('/:id', getBookById);

// Protected routes (JWT authentication required)
router.post('/', protect, createBook);
router.patch('/:id', protect, updateBook);
router.put('/:id', protect, updateBook); // Backward compatibility
router.delete('/:id', protect, deleteBook);

export default router;
