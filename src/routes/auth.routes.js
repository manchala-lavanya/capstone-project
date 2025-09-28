const authController = require("../controllers/auth.controller");
const verifyToken = require('../middleware/auth.middleware');
const verifyRole = require('../middleware/role.middleware');

module.exports = function(app) {
  // Register user
  app.post("/api/register", authController.register);

  // Login user
  app.post("/api/login", authController.login);

  // Register admin - Only admins can create another admin
  app.post("/api/admin/register", [verifyToken, verifyRole('admin')], authController.registerAdmin);
};
