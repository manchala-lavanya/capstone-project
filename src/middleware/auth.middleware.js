const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

module.exports = async (req, res, next) => {
  // Get the token from the request headers
  const token = req.headers['x-access-token'];

  // If no token is provided, return an error
  if (!token) {
    return res.status(403).json({ message: 'No token provided' });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Set user ID from the decoded token
    req.userId = decoded.id;

    // Find the user by ID using async/await
    const user = await User.findById(req.userId);

    // If the user is not found, return an error
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Set user role in the request object
    req.userRole = user.role;

    // Proceed to the next middleware
    next();
  } catch (err) {
    // If there's any error (e.g., invalid token, or user not found), return an unauthorized error
    console.error('Error verifying token or user:', err);
    return res.status(401).json({ message: 'Unauthorized' });
  }
};
