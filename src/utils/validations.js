const { body, param } = require('express-validator');

const bookCreateValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('author').trim().notEmpty().withMessage('Author is required'),
  body('genre').trim().notEmpty().withMessage('Genre is required')
    .isIn(['Fiction', 'Non-Fiction', 'Mystery', 'Sci-Fi', 'Fantasy', 'Romance'])
    .withMessage('Genre must be one of Fiction, Non-Fiction, Mystery, Sci-Fi, Fantasy, Romance', ),
  body('year').isInt({ min: 1900, max: new Date().getFullYear() })
    .withMessage(`Year must be a number between 1900 and ${new Date().getFullYear()}`),
  body('description').trim().isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
];

const bookIdValidation = [
  param('id').isMongoId().withMessage('Invalid book ID'),
];

module.exports = {
  bookCreateValidation,
  bookIdValidation,
};
