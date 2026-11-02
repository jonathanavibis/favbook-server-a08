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

// GET /books - Public
// POST /books - Private (JWT Protected)
router.route('/')
  .get(getBooks)
  .post(protect, createBook);

// GET /books/:id - Public
// PATCH /books/:id - Private (JWT Protected)
// DELETE /books/:id - Private (JWT Protected)
router.route('/:id')
  .get(getBookById)
  .patch(protect, updateBook)
  .delete(protect, deleteBook);

export default router;
