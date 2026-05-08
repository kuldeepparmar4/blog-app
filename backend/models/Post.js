// ============================================
// POST MODEL — Defines what a blog post looks like in MongoDB
// ============================================

const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [5, "Title must be at least 5 characters"],
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    content: {
      type: String,
      required: [true, "Content is required"],
      minlength: [10, "Content must be at least 10 characters"],
    },
    // The image object stores both the URL (to display the image)
    // and the publicId (to delete the image from Cloudinary later)
    image: {
      url: {
        type: String,
        default: "",
      },
      publicId: {
        type: String,
        default: "", // Cloudinary's ID — needed to delete the image
      },
    },
    // author stores the MongoDB ObjectId of the User who created this post
    // "ref: 'User'" tells Mongoose this links to the User model
    // This is like a foreign key in SQL
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tags: {
      type: [String], // array of strings e.g. ['javascript', 'react']
      default: [],
    },
    // How many times this post has been viewed
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  },
);

// Index for faster search queries on title and content
postSchema.index({ title: "text", content: "text" });

module.exports = mongoose.model("Post", postSchema);
