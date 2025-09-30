const mongoose = require("mongoose");
const Book = require('../models/book.model');
const Review = require('../models/review.model');

// Add a book (user and admin)
exports.add = async (req, res) => {
  try {
    const { title, author, genre, year, description } = req.body;

    // Check if the user is authenticated
    if (!req.userId) {
      return res.status(401).json({ message: 'Authentication required to add a book' });
    }
    
    const newBook = new Book({
      title,
      author,
      genre,
      year,
      description,
      addedBy: req.userId, // Store the ID of the user who added this book
    });

    const savedBook = await newBook.save();
    res.status(201).json(savedBook);
  } catch (err) {
    console.error('Error adding book:', err);
    res.status(500).json({ message: 'Error adding book' });
  }
};   

// List/Search Books (Everyone can use) along with reviews
exports.getAll = async (req, res) => {
  try {
    const { title, author, genre, year } = req.query;

    const filters = {};
    if (title) filters.title = { $regex: title, $options: 'i' };
    if (author) filters.author = { $regex: author, $options: 'i' };
    if (genre) filters.genre = { $regex: genre, $options: 'i' };
    if (year) filters.year = year;

    // Fetch books based on filters
    const books = await Book.find(filters).lean(); // lean() returns plain JS objects
    // For each book, fetch reviews
    const booksWithReviews = await Promise.all(books.map(async (book) => {
      const reviews = await Review.find({ bookId: book._id })

      .populate('userId', 'username email')  //user info in review
      .select('rating comment user createdAt')
      .lean();

      return {
        ...book,
        reviews
      };
    }));
    res.status(200).json(booksWithReviews);
  } catch (err) {
    console.error('Error fetching books with reviews:', err);
    res.status(500).json({ message: 'Error fetching books' });
  }
};

// Get a book by ID with its reviews
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate if the ID is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid book ID' });
    }

    // Find the book
    const book = await Book.findById(id).lean();
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Find reviews related to the book, using 'bookId' field (matches schema)
    const reviews = await Review.find({ bookId: book.id })
      .populate('userId', 'username email')  // populate using 'userId'
      .select('rating comment userId createdAt') // include userId for populated user
      .lean();

    // Respond with book and its reviews
    res.status(200).json({
      ...book,
      reviews
    });
  } catch (err) {
    console.error('Error fetching book with reviews:', err);
    res.status(500).json({ message: 'Error fetching book', error: err.message });
  }
};


// Update a book by ID (Only the book owner or an admin can update)
exports.updateById = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, author, genre, year, description } = req.body;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid book ID" });
    const book = await Book.findById(id);
    if (!book) 
      return res.status(404).json({ message: "Book not found" });
    // Check if the user is the one who added the book or an admin
    if (book.addedBy.toString() !== req.userId && req.userRole !== "admin") {
      return res.status(403).json({ message: "Forbidden: Not authorized to edit this book" });
    }

    book.title = title || book.title;
    book.author = author || book.author;
    book.genre = genre || book.genre;
    book.year = year || book.year;
    book.description = description || book.description;

    const updatedBook = await book.save();
    res.status(200).json(updatedBook); // Return the updated book
  } catch (err) {
    console.error("Error updating book:", err);
    res.status(500).json({ message: "Error updating book" });
  }
};

// Delete a book by ID (Only the book owner or an admin can delete)
exports.deleteById = async (req, res) => {
  try {
    const bookId = req.params.id;
    const userId = req.userId;
    const userRole = req.userRole;
    // Find the book first
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
    //Check ownership or admin role - To check if the user is the one who added the book or an admin
    if (userRole !== "admin" || book.addedBy.toString() !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }
    
    await Book.findByIdAndDelete(bookId);
    return res.status(200).json({ message: "Book deleted successfully" });

  } catch (error) {
    console.error("Error deleting book:", error);
    return res.status(500).json({ message: "Error deleting book", error: error.message });
  }
};
