// ============================================
// SERVER.JS — Blog App Backend
// ============================================
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

// Load .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================
// Middleware
// ============================================

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  process.env.FRONTEND_URL,
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(helmet());
app.use(mongoSanitize());

// ============================================
// Test Route
// ============================================

app.get("/", (req, res) => {
  res.json({
    message: "Blog API is running",
    mongodb:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

// ============================================
// Routes
// ============================================

app.use("/api/auth", require("./routes/auth"));
app.use("/api/posts", require("./routes/posts"));

// ============================================
// Error Handler
// ============================================

app.use(require("./middleware/errorHandler"));

// ============================================
// MongoDB Connect + Server Start
// ============================================

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing in .env file");
    }

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 15000,
      family: 4,
    });

    console.log("MongoDB connected successfully");

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

connectDB();
