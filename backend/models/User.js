// ============================================
// USER MODEL — Defines what a user looks like in MongoDB
// ============================================
// A "Schema" is like a blueprint or form — it says what fields
// are required and what type of data each field holds.

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true, // no two users can have the same username
      trim: true, // removes spaces: "  john  " becomes "john"
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [30, "Username cannot exceed 30 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true, // always store email in lowercase
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"], // regex validation
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      // Note: We NEVER store plain passwords — always hashed with bcrypt
    },
    avatar: {
      type: String,
      default: "", // optional profile picture URL
    },
    bio: {
      type: String,
      default: "",
      maxlength: [200, "Bio cannot exceed 200 characters"],
    },
  },
  {
    timestamps: true, // automatically adds createdAt and updatedAt fields
  },
);

// mongoose.model('User', userSchema) creates the "users" collection in MongoDB
// (Mongoose automatically lowercases and pluralizes the model name)
module.exports = mongoose.model("User", userSchema);
