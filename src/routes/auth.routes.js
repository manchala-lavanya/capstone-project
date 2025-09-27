const authController = require("../controllers/auth.controller");

module.exports = function(app) {
  // Register user
  app.post("/api/register", authController.register);

  // Login user
  app.post("/api/login", authController.login);
};
