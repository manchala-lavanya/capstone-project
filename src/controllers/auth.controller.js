const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

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
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      role: req.body.role || 'user',
    });

    // Save the user to the database
    await newUser.save();

    const newUserObj = newUser.toObject();
    delete newUserObj.password;  // Remove password before sending
    
    res.status(201).json({
      message: 'User registered successfully',
      user: newUserObj
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
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
      expiresIn: '1h', //86400-24hrs
    });

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    //console.error("Login error:", err);
    res.status(500).json({ message: 'Error logging in', error: err.message });
  }
};

// Register Admin - only admins can create other admins
exports.registerAdmin = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if email or username already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: "Username or email already exists" });
    }

    // Create new admin user
    const adminUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      role: 'admin',  // force role to admin
    });

    await adminUser.save();

    const newadminUserObj = newUser.toObject();
    delete newadminUserObj.password;  // Remove password before sending

    res.status(201).json({
      message: "Admin user registered successfully",
      user: {
        _id: adminUser._id,
        username: adminUser.username,
        email: adminUser.email,
        role: adminUser.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error registering admin user" });
  }
};
