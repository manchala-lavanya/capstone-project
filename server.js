const express = require("express");
const cors = require("cors");
const dbConfig = require("./src/config/db.config");

const app = express();

// CORS setup
var corsOptions = {
  origin: "http://localhost:8081",
};
app.use(cors(corsOptions));

// Middleware for parsing requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection setup
const db = require("./src/models");
const Book = db.book;

db.mongoose
  .connect(`mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`, {
    useNewUrlParser: true,
    //useUnifiedTopology: true, // Removed useUnifiedTopology since it's no longer needed - error
  })
  .then(() => {
    console.log("Successfully connected to MongoDB.");
  })
  .catch((err) => {
    console.error("Connection error", err);
    process.exit();
  });

// Import routes
require("./src/routes/book.routes")(app);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

// Set port and listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
