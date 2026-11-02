import mongoose from 'mongoose';
import Borrow from '../models/Borrow.js';
import Book from '../models/Book.js';

// @desc    Borrow a book (Challenge: $inc -1 copies, No double borrow check)
// @route   POST /borrows
// @access  Private (JWT Protected)
export const borrowBook = async (req, res) => {
  try {
    const { bookId, bookTitle, bookImage, returnDate } = req.body;

    if (!bookId || !returnDate) {
      return res.status(400).json({
        success: false,
        message: 'Book ID and valid return date are required.',
      });
    }

    const userEmail = (req.user?.email || req.body.userEmail || '').toLowerCase();
    const userName = req.user?.name || req.body.userName || 'Library Member';

    if (!userEmail) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required: Borrower email missing.',
      });
    }

    // 1. Verify book existence and availability in catalog
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Selected book was not found in catalog.',
      });
    }

    if (book.copies <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Not Available: All copies of this book are currently on loan.',
      });
    }

    // 2. Challenge: No Double Borrow check
    // A user cannot borrow the same book two times at the same time
    const existingActiveBorrow = await Borrow.findOne({
      bookId,
      userEmail,
      status: 'borrowed',
    });

    if (existingActiveBorrow) {
      return res.status(400).json({
        success: false,
        message: 'You have already borrowed this book and have not returned it yet.',
      });
    }

    // 3. Challenge: Atomically decrement copies by 1 ($inc: -1)
    const updatedBook = await Book.findOneAndUpdate(
      { _id: bookId, copies: { $gt: 0 } },
      { $inc: { copies: -1 } },
      { new: true }
    );

    if (!updatedBook) {
      return res.status(400).json({
        success: false,
        message: 'Failed to borrow: The last copy was just claimed by another reader.',
      });
    }

    // 4. Save loan transaction in borrows collection
    const newBorrow = new Borrow({
      bookId: book._id,
      bookTitle: bookTitle || book.title,
      bookImage: bookImage || book.image,
      userEmail,
      userName,
      borrowDate: new Date(),
      returnDate: new Date(returnDate),
      status: 'borrowed',
    });

    const savedBorrow = await newBorrow.save();

    return res.status(201).json({
      success: true,
      message: `Successfully borrowed "${book.title}". Enjoy reading!`,
      borrow: savedBorrow,
      remainingCopies: updatedBook.copies,
    });
  } catch (error) {
    console.error('[borrowBook Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to process book loan.',
      error: error.message,
    });
  }
};

// @desc    Get borrow records of the logged in user
// @route   GET /borrows
// @access  Private (JWT Protected)
export const getMyBorrows = async (req, res) => {
  try {
    const userEmail = (req.user?.email || req.query.userEmail || '').toLowerCase();

    if (!userEmail) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required to view loan ledger.',
      });
    }

    const borrows = await Borrow.find({
      userEmail,
      status: 'borrowed',
    })
      .sort({ createdAt: -1 })
      .populate('bookId', 'title author category image copies');

    return res.status(200).json(borrows);
  } catch (error) {
    console.error('[getMyBorrows Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve borrow history.',
      error: error.message,
    });
  }
};

// @desc    Return a borrowed book (Challenge: $inc +1 copies, delete or complete loan)
// @route   DELETE /borrows/:id
// @access  Private (JWT Protected)
export const returnBook = async (req, res) => {
  try {
    const { id } = req.params;
    const userEmail = (req.user?.email || req.query.userEmail || '').toLowerCase();

    const borrow = await Borrow.findById(id);
    if (!borrow) {
      return res.status(404).json({
        success: false,
        message: 'Borrow record not found.',
      });
    }

    // Ownership verification
    if (userEmail && borrow.userEmail !== userEmail && req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only return books you borrowed.',
      });
    }

    // 1. Challenge: Atomically increment book copies by 1 ($inc: 1)
    await Book.findByIdAndUpdate(borrow.bookId, {
      $inc: { copies: 1 },
    });

    // 2. Remove the borrow record or mark returned
    await Borrow.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: `Book "${borrow.bookTitle}" returned successfully! Available copies updated.`,
    });
  } catch (error) {
    console.error('[returnBook Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to return book.',
      error: error.message,
    });
  }
};
