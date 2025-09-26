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
      enum: {
        values: ["Fiction", "Non-Fiction", "Mystery", "Sci-Fi", "Fantasy"],  // Add your fixed genres here
        message: '{VALUE} is not a valid genre',  // error message
      },
    },
    year: {
      type: Number,
      required: [true, "Year is required"],
      min: [1900, "Year must be after 1900"],
      max: [new Date().getFullYear(), "Year cannot be in the future"],  // Current year as max limit
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description must be less than 1000 characters"], // Limit the length of description
      default: "No description provided",
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

const Book = mongoose.model("Book", bookSchema);

module.exports = Book;
