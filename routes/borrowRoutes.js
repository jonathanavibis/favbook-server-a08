import express from 'express';
import {
  borrowBook,
  getMyBorrows,
  returnBook,
} from '../controllers/borrowController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All borrow routes are protected with JWT validation
router.post('/', protect, borrowBook);
router.get('/', protect, getMyBorrows);
router.delete('/:id', protect, returnBook);

export default router;
