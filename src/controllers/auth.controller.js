const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
//const bcrypt = require("bcryptjs");

//Register a user
exports.register = async (req, res) => {
  try {
    // Destructure fields from request body
    const { username, email, password } = req.body;

    // Check if email already exists in the database
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Check if username already exists
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Create new user instance
    const newUser = new User({
      username,
      email,
      password,  // Password will be hashed when saved
    });

    // Save the user to the database
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Error registering user' });
  }
};

//Login a user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

     // Find user
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    //check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    // Generate a JWT token using the secret from the .env file
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.status(200).json({
      message: "Login successful",
      token,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error during login" });
  }
};
