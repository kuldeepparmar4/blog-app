// ============================================
// AUTH MIDDLEWARE — Protects private routes
// ============================================
// This function runs BEFORE any protected route handler.
// It checks if the user sent a valid JWT token.
// If yes → let them through. If no → send 401 error.

const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  try {
    // The token comes in the Authorization header like this:
    // "Bearer eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiI2NWFiYyJ9..."
    const authHeader = req.headers.authorization;

    // Check if header exists and starts with "Bearer "
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided. Please log in.",
      });
    }

    // Extract just the token part (remove "Bearer " prefix)
    // "Bearer abc123" → split by space → ["Bearer", "abc123"] → take index [1]
    const token = authHeader.split(" ")[1];

    // jwt.verify() does two things:
    // 1. Checks the token hasn't been tampered with (signature check)
    // 2. Checks the token hasn't expired
    // If either fails, it throws an error
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the decoded user data to the request object
    // Now any route handler can access req.user.userId
    req.user = decoded;

    // next() means "I'm done, pass control to the next function"
    // Without calling next(), the request would hang forever
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired. Please log in again.",
      });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token. Please log in again.",
      });
    }
    res.status(401).json({ success: false, message: "Authentication failed." });
  }
};

module.exports = protect;
