const controller = require("../controllers/user.controller");
const verifyToken = require('../middleware/auth.middleware');
const verifyRole = require('../middleware/role.middleware');

module.exports = function(app) {
  // List all users (admin only)
  app.get("/api/admin/users", [verifyToken, verifyRole('admin')], controller.getAllUsers);
  
};