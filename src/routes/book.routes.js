const { validationResult } = require('express-validator');
const controller = require("../controllers/book.controller");
const verifyToken = require('../middleware/auth.middleware');
const { bookCreateValidation, bookIdValidation } = require('../utils/validations');
const validateRequest = require('../middleware/validateRequest');

module.exports = function (app) {
  // Add a book (Authenticated users & admins)
  app.post("/api/books", [
    verifyToken,
    ...bookCreateValidation,
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    }
  ], controller.add);

  // Get all books (Everyone can search/list books)
  app.get("/api/books", controller.getAll);

  // Get a specific book by ID
  app.get("/api/books/:id", [
    ...bookIdValidation,
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      next();
    }
  ], controller.getById);

  // Update a book (Authenticated user or admin)
  app.put("/api/books/:id", [
    verifyToken,
    ...bookIdValidation,
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      next();
    }
  ], controller.updateById);


  // Delete a book (Authenticated user or admin)
  app.delete('/api/books/:id', [
    verifyToken,
    ...bookIdValidation,
    validateRequest,
  ], controller.deleteById);
};