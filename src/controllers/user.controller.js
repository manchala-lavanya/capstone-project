const User = require('../models/user.model');

exports.getAllUsers = async (req, res) => {
  try {
    // Fetch all users but exclude password field for security
    const users = await User.find({}, '-password');
    res.status(200).json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Error fetching users" });
  }
};