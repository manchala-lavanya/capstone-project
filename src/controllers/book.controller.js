const mongoose = require("mongoose");
const Book = require('../models/book.model');

// Add a book (Only Admins can add)
exports.add = async (req, res) => {
  try {
    const { title, author, genre, year, description } = req.body;

    // Check if the user is an admin -  Only admin can add books 
    if (req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Only admins can add books' });
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

// List/Search Books (Everyone can use)
exports.getAll = async (req, res) => {
  try {
    const { title, author, genre, year } = req.query;

    const filters = {};
    if (title) filters.title = { $regex: title, $options: 'i' };
    if (author) filters.author = { $regex: author, $options: 'i' };
    if (genre) filters.genre = { $regex: genre, $options: 'i' };
    if (year) filters.year = year;

    const books = await Book.find(filters);
    res.status(200).json(books);
  } catch (err) {
    // console.error('Error fetching books:', err);
    res.status(500).json({ message: 'Error fetching books' });
  }
};

// Get a book by ID
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    // Validate if the ID is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid book ID' });
    }
    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.status(200).json(book);
  } catch (err) {
    console.error('Error fetching book:', err);
    res.status(500).json({ message: 'Error fetching book' });
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
    if (userRole !== "admin" && book.addedBy.toString() !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }
    
    await Book.findByIdAndDelete(bookId);
    return res.status(200).json({ message: "Book deleted successfully" });

  } catch (error) {
    console.error("Error deleting book:", error);
    return res.status(500).json({ message: "Error deleting book", error: error.message });
  }
};
