const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Register a user
exports.register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Validate role if provided
    if (role && !['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role specified' });
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Check if username already exists
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Create new user with hashed password
    const newUser = new User({
      username,
      email,
      password,  // Password will be hashed by the pre-save hook in the model
      role: role || 'user'
    });

    await newUser.save();

    const newUserObj = newUser.toObject();
    delete newUserObj.password; // Remove password before sending response

    res.status(201).json({
      message: 'User registered successfully',
      user: newUserObj,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login a user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check if the entered password matches the stored password
    const isMatch = await user.comparePassword(password); // using comparePassword method
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

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
    res.status(500).json({ message: 'Error logging in', error: err.message });
  }
};

// Register Admin - only admins can create other admins
exports.registerAdmin = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if username or email already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: "Username or email already exists" });
    }

    // Create new admin user (password will be hashed automatically)
    const adminUser = new User({
      username,
      email,
      password,  // Password will be hashed by the pre-save hook in the model
      role: 'admin', // Force the role to admin
    });

    await adminUser.save();

    const newAdminUserObj = adminUser.toObject();
    delete newAdminUserObj.password;

    res.status(201).json({
      message: "Admin user registered successfully",
      user: newAdminUserObj,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error registering admin user" });
  }
};
