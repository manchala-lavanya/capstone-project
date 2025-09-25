const controller = require("../controllers/book.controller");

module.exports = function(app) {
  
  // Route to create a new book
  app.post("/api/books", controller.add);

  // Route to get all books
  app.get("/api/books", controller.getAll);

  // Route to get a single book by ID
  app.get("/api/books/:id", controller.getById);

  // Route to update a book by ID
  app.put("/api/books/:id", controller.updateById);

  // Route to delete a book by ID
  app.delete("/api/books/:id", controller.deleteById);
  
};
