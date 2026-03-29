// Import JWT and the User model
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// This middleware checks for a valid token in the Authorization header
const authenticate = async (req, res, next) => {
  try {
    // Step 1: Get token from header
    const authHeader = req.headers.authorization;

    // Step 2: Check if token is missing
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Access denied. No token provided." });
    }

    // Step 3: Extract token from "Bearer <token>"
    const token = authHeader.split(" ")[1];

    // Step 4: Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Step 5: Attach user info to request
    req.user = decoded;

    // Move to next middleware or controller
    next();
  } catch (error) {
    console.error("Auth error:", error.message);
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

module.exports = authenticate;
