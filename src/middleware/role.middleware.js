const User = require("../models/user.model");

module.exports = (requiredRole) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.userId);
      if (!user || user.role !== requiredRole) {
        return res.status(403).json({ message: "Access denied" });
      }
      next();
    } catch (err) {
      console.error("Role check error:", err);
      res.status(500).json({ message: "Error verifying user role" });
    }
  };
};