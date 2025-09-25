const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    author: {
      type: String,
      required: [true, "Author is required"],
      trim: true,
    },
    genre: {
      type: String,
      required: [true, "Genre is required"],
      trim: true,
    },
    year: {
      type: Number,
      required: [true, "Year is required"],
      min: [1900, "Year must be after 1900"],
      max: [new Date().getFullYear(), "Year cannot be in the future"],
    },
    description: {
      type: String,
      trim: true,
      default: "No description provided",
    },
  },
  {
    timestamps: true,  
  }
);

const Book = mongoose.model("Book", bookSchema);

module.exports = Book;
