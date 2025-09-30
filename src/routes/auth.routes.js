const authController = require("../controllers/auth.controller");
const verifyToken = require('../middleware/auth.middleware');
const verifyRole = require('../middleware/role.middleware');
const { registerValidator, loginValidator } = require('../utils/authValidator');
const { validationResult } = require('express-validator');

// Middleware to handle validation result
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = function(app) {
  // Register user with validation middlewares
  app.post(
    "/api/register",
    registerValidator,
    validateRequest,
    authController.register
  );

  // Login user with validation middlewares
  app.post(
    "/api/login",
    loginValidator,
    validateRequest,
    authController.login
  );

  // Register admin - Only admins can create another admin, validation included
  app.post(
    "/api/admin/register",
    [verifyToken, verifyRole('admin'), registerValidator, validateRequest],
    authController.registerAdmin
  );
};
