import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Book title is required'],
      trim: true,
    },
    author: {
      type: String,
      required: [true, 'Author name is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Book category is required'],
      enum: {
        values: ['Fiction', 'Science', 'History', 'Kids', 'Others'],
        message: 'Category must be one of Fiction, Science, History, Kids, or Others',
      },
    },
    image: {
      type: String,
      required: [true, 'Book cover image is required'],
    },
    description: {
      type: String,
      required: [true, 'Book description is required'],
      trim: true,
    },
    copies: {
      type: Number,
      required: [true, 'Total copies count is required'],
      default: 1,
      min: [0, 'Available copies cannot be negative'],
    },
    userEmail: {
      type: String,
      required: [true, 'Contributor email is required'],
      lowercase: true,
      trim: true,
    },
    userName: {
      type: String,
      required: [true, 'Contributor name is required'],
      trim: true,
    },
    rating: {
      type: Number,
      default: 4.8,
      min: 1,
      max: 5,
    },
  },
  {
    timestamps: true,
  }
);

// Index for high performance search and category filtering
bookSchema.index({ title: 'text', author: 'text', category: 1 });

const Book = mongoose.models.Book || mongoose.model('Book', bookSchema);
export default Book;
