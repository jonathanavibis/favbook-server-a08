import express from 'express';
import {
  borrowBook,
  getMyBorrows,
  returnBook,
} from '../controllers/borrowController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// POST /borrows - Borrow a book (Private)
// GET /borrows - Get user borrows (Private)
router.route('/')
  .post(protect, borrowBook)
  .get(protect, getMyBorrows);

// DELETE /borrows/:id - Return a book (Private)
router.route('/:id')
  .delete(protect, returnBook);

export default router;
