// ============================================
// AUTH ROUTES — Register and Login
// ============================================
// POST /api/auth/register  → create new user
// POST /api/auth/login     → login existing user
// GET  /api/auth/me        → get current logged-in user's data

const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const protect = require("../middleware/auth");

// ──────────────────────────────────────────
// Helper: Create JWT token
// ──────────────────────────────────────────
const createToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );
};

// ──────────────────────────────────────────
// POST /api/auth/register
// ──────────────────────────────────────────
router.post(
  "/register",
  [
    // express-validator: validate request body BEFORE reaching our code
    body("username")
      .trim()
      .isLength({ min: 3, max: 30 })
      .withMessage("Username must be 3-30 characters"),
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please enter a valid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  async (req, res, next) => {
    try {
      // Check if validation passed
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array().map((e) => e.msg),
        });
      }

      const { username, email, password } = req.body;

      // Check if email already exists
      const emailExists = await User.findOne({ email: email.toLowerCase() });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: "An account with this email already exists",
        });
      }

      // Check if username already exists
      const usernameExists = await User.findOne({ username });
      if (usernameExists) {
        return res.status(400).json({
          success: false,
          message: "This username is already taken",
        });
      }

      // Hash the password
      // bcrypt.hash(password, saltRounds)
      // saltRounds = 12 means bcrypt scrambles the password 2^12 = 4096 times
      // Higher = more secure but slower. 12 is the industry standard.
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create the user in MongoDB
      const user = await User.create({
        username,
        email: email.toLowerCase(),
        password: hashedPassword,
      });

      // Create JWT token
      const token = createToken(user);

      // Send response — DO NOT include password in response
      res.status(201).json({
        success: true,
        message: "Account created successfully!",
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          bio: user.bio,
          role: user.role,
          createdAt: user.createdAt,
        },
      });
    } catch (error) {
      next(error); // passes to errorHandler middleware
    }
  },
);

// ──────────────────────────────────────────
// POST /api/auth/login
// ──────────────────────────────────────────
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Please enter a valid email"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array().map((e) => e.msg),
        });
      }

      const { email, password } = req.body;

      // Find user by email
      // We use same message for "user not found" and "wrong password"
      // This prevents attackers from knowing which one is wrong (security best practice)
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      // Compare entered password with stored hash
      // bcrypt.compare() returns true if they match, false if not
      const isPasswordCorrect = await bcrypt.compare(password, user.password);
      if (!isPasswordCorrect) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      const token = createToken(user);

      res.json({
        success: true,
        message: "Logged in successfully!",
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          bio: user.bio,
          role: user.role,
          createdAt: user.createdAt,
        },
      });
    } catch (error) {
      next(error);
    }
  },
);

// ──────────────────────────────────────────
// GET /api/auth/me — Get current user (protected)
// ──────────────────────────────────────────
router.get("/me", protect, async (req, res, next) => {
  try {
    // req.user.userId was set by the protect middleware
    // .select('-password') means "return all fields EXCEPT password"
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
