const controller = require("../controllers/review.controller");
const verifyToken = require('../middleware/auth.middleware');
const verifyRole = require('../middleware/role.middleware');

module.exports = function (app) {
  // Add reviews by Authenticated users only
  app.post("/api/books/:id/reviews", [verifyToken], controller.add);

  // Get reviews for a specific book
  app.get("/api/books/:id/reviews", controller.getAll);

  // Edit review (Only owner/admin)
  app.put("/api/reviews/:id", [verifyToken], controller.updateById);

  // Delete review (Only owner/admin)
  app.delete("/api/reviews/:id", [verifyToken], controller.deleteById);

  // Admin can delete reviews
  app.delete("/api/admin/reviews/:id", [verifyToken, verifyRole('admin')], controller.deleteByAdmin);
};
