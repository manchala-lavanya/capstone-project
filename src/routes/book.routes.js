const { body, param, validationResult } = require('express-validator');
const controller = require("../controllers/book.controller");
const verifyToken = require('../middleware/auth.middleware');
const verifyRole = require('../middleware/role.middleware');

module.exports = function (app) {
  // Add a book (Only Admins can add)
  app.post("/api/books", [
    verifyToken, 
    verifyRole('admin'),
    // Validate and sanitize fields
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('author').trim().notEmpty().withMessage('Author is required'),
    body('genre').trim().notEmpty().withMessage('Genre is required')
      .isIn(['Fiction', 'Non-Fiction', 'Mystery', 'Sci-Fi', 'Fantasy'])
      .withMessage('Genre must be one of Fiction, Non-Fiction, Mystery, Sci-Fi, Fantasy'),
    body('year').isInt({ min: 1900, max: new Date().getFullYear() })
      .withMessage(`Year must be a number between 1900 and ${new Date().getFullYear()}`),
    body('description').trim().isLength({ max: 1000 })
      .withMessage('Description must be less than 1000 characters'),
  ], (req, res, next) => {
    // Handle validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }, controller.add);
  
  // Get all books (Everyone can search/list books)
  app.get("/api/books", controller.getAll);

  // Get a specific book by ID
  app.get("/api/books/:id", controller.getById);

  // Update a book (Authenticated user or admin) with validation on param id
  app.put("/api/books/:id", [
    verifyToken,
    param('id').isMongoId().withMessage('Invalid book ID'),
  ], (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  }, controller.updateById);

  // Delete a book (Authenticated user or admin) with validation on param id
  app.delete("/api/books/:id", [
    verifyToken,
    param('id').isMongoId().withMessage('Invalid book ID'),
  ], (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  }, controller.deleteById);
};
