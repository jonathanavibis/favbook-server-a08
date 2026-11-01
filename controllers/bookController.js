import Book from '../models/Book.js';
import { initialBooks } from '../data/initialBooks.js';

// @desc    Get all books with optional search, category filter, and limit
// @route   GET /books
// @access  Public
export const getBooks = async (req, res) => {
  try {
    const { category, search, userEmail, limit, sort } = req.query;
    let query = {};

    // Filter by category
    if (category && category !== 'All' && category !== 'all') {
      query.category = new RegExp(`^${category}$`, 'i');
    }

    // Filter by contributor (My Books)
    if (userEmail) {
      query.userEmail = userEmail.toLowerCase();
    }

    // Text Search
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ title: searchRegex }, { author: searchRegex }];
    }

    // Sort order
    let sortOption = { createdAt: -1 }; // Newest first by default
    if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    } else if (sort === 'title') {
      sortOption = { title: 1 };
    } else if (sort === 'copies') {
      sortOption = { copies: -1 };
    }

    let booksQuery = Book.find(query).sort(sortOption);

    if (limit) {
      const parsedLimit = parseInt(limit, 10);
      if (!isNaN(parsedLimit) && parsedLimit > 0) {
        booksQuery = booksQuery.limit(parsedLimit);
      }
    }

    let books = await booksQuery.exec();

    // If database is completely empty and no filters applied, seed curated library books
    if (books.length === 0 && Object.keys(query).length === 0 && (!limit || parseInt(limit, 10) >= 6)) {
      const count = await Book.countDocuments();
      if (count === 0 && initialBooks && initialBooks.length > 0) {
        await Book.insertMany(initialBooks);
        books = await Book.find({}).sort({ createdAt: -1 }).limit(limit ? parseInt(limit, 10) : 50);
      }
    }

    return res.status(200).json(books);
  } catch (error) {
    console.error('[getBooks Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve books from library archive',
      error: error.message,
    });
  }
};

// @desc    Get single book by ID
// @route   GET /books/:id
// @access  Public
export const getBookById = async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Book.findById(id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found in library inventory',
      });
    }

    return res.status(200).json(book);
  } catch (error) {
    console.error('[getBookById Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch book details',
      error: error.message,
    });
  }
};

// @desc    Add a new book
// @route   POST /books
// @access  Private (JWT Protected)
export const createBook = async (req, res) => {
  try {
    const { title, author, category, image, description, copies } = req.body;

    if (!title || !author || !category || !image || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: title, author, category, image, and description.',
      });
    }

    const userName = req.user?.name || req.body.userName || 'Library Contributor';
    const userEmail = (req.user?.email || req.body.userEmail || '').toLowerCase();

    if (!userEmail) {
      return res.status(400).json({
        success: false,
        message: 'Contributor email is required to add a book.',
      });
    }

    const newBook = new Book({
      title: title.trim(),
      author: author.trim(),
      category,
      image,
      description: description.trim(),
      copies: Number(copies) >= 0 ? Number(copies) : 1,
      userEmail,
      userName,
      createdAt: new Date(),
    });

    const savedBook = await newBook.save();

    return res.status(201).json({
      success: true,
      message: 'Book added to BookHype library successfully!',
      book: savedBook,
    });
  } catch (error) {
    console.error('[createBook Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to add book to the library catalog',
      error: error.message,
    });
  }
};

// @desc    Update book details
// @route   PATCH /books/:id
// @access  Private (JWT Protected)
export const updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Book.findById(id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found in catalog',
      });
    }

    // Authorization check: only original contributor or admin can update
    const userEmail = (req.user?.email || '').toLowerCase();
    const isOwner = book.userEmail.toLowerCase() === userEmail;
    const isAdmin = req.user?.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied: You can only edit books you contributed to the library.',
      });
    }

    const { title, author, category, image, description, copies } = req.body;

    if (title) book.title = title.trim();
    if (author) book.author = author.trim();
    if (category) book.category = category;
    if (image) book.image = image;
    if (description) book.description = description.trim();
    if (copies !== undefined) book.copies = Math.max(0, Number(copies));

    const updatedBook = await book.save();

    return res.status(200).json({
      success: true,
      message: 'Book updated successfully in the library!',
      book: updatedBook,
    });
  } catch (error) {
    console.error('[updateBook Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to update book information',
      error: error.message,
    });
  }
};

// @desc    Delete a book from library
// @route   DELETE /books/:id
// @access  Private (JWT Protected)
export const deleteBook = async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Book.findById(id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found in catalog',
      });
    }

    // Authorization check
    const userEmail = (req.user?.email || '').toLowerCase();
    const isOwner = book.userEmail.toLowerCase() === userEmail;
    const isAdmin = req.user?.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied: You can only remove books you added.',
      });
    }

    await Book.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Book removed from BookHype library archive successfully.',
    });
  } catch (error) {
    console.error('[deleteBook Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete book from archive',
      error: error.message,
    });
  }
};
