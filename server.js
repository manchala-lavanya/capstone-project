require('dotenv').config({ path: './.env' });  // Explicitly set the .env path 
console.log("JWT_SECRET:", process.env.JWT_SECRET);

const express = require("express");
const cors = require("cors");
const dbConfig = require("./src/config/db.config");
const Role = require("./src/models/role.model");

//To create an Express application instance as app is main object of server
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
db.mongoose.set('debug', true);  // Enable Mongoose debug mode

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

const setInitialRolesInDB = async () => {
  try {
    const count = await Role.estimatedDocumentCount();
    if (count === 0) {
      await new Role({ name: "Admin" }).save();
      console.log("'Admin' role created successfully");

      await new Role({ name: "User" }).save();
      console.log("'User' role created successfully");
    }
  } catch (error) {
    console.error("Error in setting initial roles:", error);
  }
}

setInitialRolesInDB();

// Import routes
const authRoutes = require("./src/routes/auth.routes"); // Import the auth routes
const bookRoutes = require("./src/routes/book.routes");  // Book-related routes
const reviewRoutes = require("./src/routes/review.routes");  // Review-related routes
const userRoutes = require("./src/routes/user.routes"); //USer-related routes

// Error handling middleware for known and unknown errors
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);

  // Handle validation errors
  if (err.name === "ValidationError") {
    return res.status(400).json({ message: "Validation error", details: err.errors });
  }

  // Handle MongoDB duplicate key error
  if (err.name === "MongoError" && err.code === 11000) {
    return res.status(400).json({ message: "Duplicate field value entered", details: err.keyValue });
  }

  // Handle not found errors
  if (err.status === 404) {
    return res.status(404).json({ message: "Resource not found" });
  }

  // Generic error handling for all other errors
  res.status(500).json({ message: "Internal Server Error", error: err.message });
});

// Use the routes
authRoutes(app);  // Register the auth routes
bookRoutes(app);  // Register the book routes
reviewRoutes(app);  // Register the review routes
userRoutes(app); // Register the user routes



// Set port and listen for requests to start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
