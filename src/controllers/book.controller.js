const Book = require("../models/book.model");  // The path to the model

exports.add = async (req, res) => {
  try {
    const { title, author, genre, year, description } = req.body;

    // Create a new book instance
    const newBook = new Book({
      title,
      author,
      genre,
      year,
      description,
    });

    // Save the new book to the database
    const savedBook = await newBook.save();

    // Send the created book back in the response
    res.status(201).json(savedBook);
  } catch (err) {
    console.error("Error adding book:", err);
    res.status(500).json({ message: "Error adding book" });
  }
};

// Get all books
exports.getAll = async (req, res) => {
  try {
    const books = await Book.find();  // Fetch all books
    res.status(200).json(books);
  } catch (err) {
    console.error("Error fetching books:", err);
    res.status(500).json({ message: "Error fetching books" });
  }
};

// Get a book by ID
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;  // Get book ID from URL params

    // Validate if the ID is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid book ID" });
    }
    const book = await Book.findById(id);  // Find book by ID

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
    res.status(200).json(book);
  } catch (err) {
    console.error("Error fetching book:", err);
    res.status(500).json({ message: "Error fetching book" });
  }
};

// Update a book by ID
exports.updateById = async (req, res) => {
  try {
    const { id } = req.params;  // Get book ID from URL params
    const { title, author, genre, year, description } = req.body;

    const updatedBook = await Book.findByIdAndUpdate(
      id,
      { title, author, genre, year, description },
      { new: true }  // Return the updated book
    );

    if (!updatedBook) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.status(200).json(updatedBook);
  } catch (err) {
    console.error("Error updating book:", err);
    res.status(500).json({ message: "Error updating book" });
  }
};

// Delete a book by ID
exports.deleteById = async (req, res) => {
  try {
    const { id } = req.params;  // Get book ID from URL params

    const deletedBook = await Book.findByIdAndDelete(id);

    if (!deletedBook) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.status(200).json({ message: "Book deleted successfully" });
  } catch (err) {
    console.error("Error deleting book:", err);
    res.status(500).json({ message: "Error deleting book" });
  }
};
