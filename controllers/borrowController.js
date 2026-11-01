import mongoose from 'mongoose';
import Book from '../models/Book.js';
import Borrow from '../models/Borrow.js';

// @desc    Borrow a book (decrements copies by 1, prevents double-borrowing)
// @route   POST /borrows
// @access  Private (JWT Protected)
export const borrowBook = async (req, res) => {
  try {
    const { bookId, returnDate } = req.body;
    const userEmail = (req.user?.email || req.body.userEmail || '').toLowerCase();
    const userName = req.user?.name || req.body.userName || 'Library Reader';

    if (!bookId) {
      return res.status(400).json({
        success: false,
        message: 'Book ID is required to process borrow request.',
      });
    }

    if (!userEmail) {
      return res.status(400).json({
        success: false,
        message: 'Borrower email is required. Please sign in.',
      });
    }

    if (!returnDate) {
      return res.status(400).json({
        success: false,
        message: 'Please choose an expected return date.',
      });
    }

    // 1. Check if the book exists in inventory
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'The requested book does not exist in library records.',
      });
    }

    // 2. Challenge: Check Available Copies (cannot borrow if copies <= 0)
    if (book.copies <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Sorry! No copies available right now. This book is currently Not Available.',
      });
    }

    // 3. Challenge: No Double Borrow (cannot borrow the same book two times at the same time)
    const existingActiveBorrow = await Borrow.findOne({
      bookId: new mongoose.Types.ObjectId(bookId),
      userEmail,
      status: 'borrowed',
    });

    if (existingActiveBorrow) {
      return res.status(400).json({
        success: false,
        message: 'Double Borrow Denied: You have already borrowed this book and have not returned it yet.',
      });
    }

    // 4. Create and save the borrow record
    const borrowRecord = new Borrow({
      bookId: book._id,
      bookTitle: book.title,
      bookImage: book.image,
      userEmail,
      userName,
      borrowDate: new Date(),
      returnDate: new Date(returnDate),
      status: 'borrowed',
    });

    await borrowRecord.save();

    // 5. Challenge: Decrease available copies by 1 with $inc
    const updatedBook = await Book.findByIdAndUpdate(
      bookId,
      { $inc: { copies: -1 } },
      { new: true }
    );

    return res.status(201).json({
      success: true,
      message: `Hooray! You borrowed "${book.title}". Enjoy your reading!`,
      borrow: borrowRecord,
      remainingCopies: updatedBook.copies,
    });
  } catch (error) {
    console.error('[borrowBook Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to process book borrow request',
      error: error.message,
    });
  }
};

// @desc    Get all active borrows of the logged-in user
// @route   GET /borrows
// @access  Private (JWT Protected)
export const getMyBorrows = async (req, res) => {
  try {
    const userEmail = (req.user?.email || req.query.email || '').toLowerCase();

    if (!userEmail) {
      return res.status(400).json({
        success: false,
        message: 'User email is required to fetch borrow history.',
      });
    }

    const borrows = await Borrow.find({
      userEmail,
      status: 'borrowed',
    })
      .sort({ borrowDate: -1 })
      .populate('bookId', 'title author category image copies');

    return res.status(200).json(borrows);
  } catch (error) {
    console.error('[getMyBorrows Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch personal borrowed books',
      error: error.message,
    });
  }
};

// @desc    Return a borrowed book (increments copies by 1, updates borrow status)
// @route   DELETE /borrows/:id
// @access  Private (JWT Protected)
export const returnBook = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the borrow record
    const borrowRecord = await Borrow.findById(id);

    if (!borrowRecord) {
      return res.status(404).json({
        success: false,
        message: 'Borrow record not found in system.',
      });
    }

    // Verify ownership
    const userEmail = (req.user?.email || '').toLowerCase();
    const isOwner = borrowRecord.userEmail.toLowerCase() === userEmail;
    const isAdmin = req.user?.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to return someone else’s borrowed book.',
      });
    }

    // Challenge: Increment book copies by 1 with $inc
    if (borrowRecord.bookId) {
      await Book.findByIdAndUpdate(
        borrowRecord.bookId,
        { $inc: { copies: 1 } },
        { new: true }
      );
    }

    // Remove the borrow record from collection (or mark returned)
    await Borrow.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: `"${borrowRecord.bookTitle}" has been returned successfully! Thank you for sharing knowledge.`,
    });
  } catch (error) {
    console.error('[returnBook Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to complete book return process',
      error: error.message,
    });
  }
};
