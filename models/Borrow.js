import mongoose from 'mongoose';

const borrowSchema = new mongoose.Schema(
  {
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: [true, 'Book ID is required for borrowing'],
    },
    bookTitle: {
      type: String,
      required: [true, 'Book title is required'],
      trim: true,
    },
    bookImage: {
      type: String,
      required: [true, 'Book image is required'],
    },
    userEmail: {
      type: String,
      required: [true, 'Borrower email is required'],
      lowercase: true,
      trim: true,
    },
    userName: {
      type: String,
      required: [true, 'Borrower name is required'],
      trim: true,
    },
    borrowDate: {
      type: Date,
      default: Date.now,
      required: true,
    },
    returnDate: {
      type: Date,
      required: [true, 'Expected return date is required'],
    },
    status: {
      type: String,
      enum: ['borrowed', 'returned'],
      default: 'borrowed',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure fast checking for user active borrows
borrowSchema.index({ bookId: 1, userEmail: 1, status: 1 });

const Borrow = mongoose.models.Borrow || mongoose.model('Borrow', borrowSchema);
export default Borrow;
