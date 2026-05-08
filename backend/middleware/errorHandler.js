// ============================================
// ERROR HANDLER MIDDLEWARE
// ============================================
// This is the "catch-all" error handler.
// Any route that calls next(error) sends the error here.
// Express knows this is an error handler because it has 4 parameters (err, req, res, next).

const errorHandler = (err, req, res, next) => {
  // Always log the full error in the terminal (for debugging)
  console.error("❌ Error:", err.message);
  console.error(err.stack);

  // Default status code and message
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // ── Mongoose Validation Error ──
  // Happens when data doesn't match the schema (e.g. missing required field)
  if (err.name === "ValidationError") {
    statusCode = 400;
    // Collect all validation error messages into one string
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
  }

  // ── MongoDB Duplicate Key Error ──
  // Happens when trying to create a user with an email/username that already exists
  // Error code 11000 is MongoDB's duplicate key error code
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0]; // which field is duplicate
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
  }

  // ── Mongoose Cast Error ──
  // Happens when an invalid MongoDB ObjectId is passed (e.g. /api/posts/not-an-id)
  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid ID format";
  }

  // ── Multer Error ──
  // Happens when file upload fails (wrong type, too large)
  if (err.name === "MulterError") {
    statusCode = 400;
    if (err.code === "LIMIT_FILE_SIZE") {
      message = "File too large. Maximum size is 5MB.";
    } else {
      message = err.message;
    }
  }

  res.status(statusCode).json({
    success: false,
    message,
    // Only show detailed error stack in development (not in production)
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = errorHandler;
