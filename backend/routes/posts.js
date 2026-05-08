// ============================================
// POSTS ROUTES — Full CRUD
// ============================================
// GET    /api/posts         → get all posts (public)
// GET    /api/posts/:id     → get one post  (public)
// POST   /api/posts         → create post   (login required)
// PUT    /api/posts/:id     → update post   (only author)
// DELETE /api/posts/:id     → delete post   (only author)

const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const Post = require("../models/Post");
const protect = require("../middleware/auth");
const { upload, cloudinary } = require("../config/cloudinary");

// ──────────────────────────────────────────
// GET /api/posts — Get all posts (public)
// ──────────────────────────────────────────
router.get("/", async (req, res, next) => {
  try {
    // Query parameters for filtering, searching, pagination
    const { search, tag, page = 1, limit = 10, sort = "newest" } = req.query;

    // Build the filter object
    const filter = {};

    // Search by title or content using MongoDB text index
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } }, // $options: 'i' = case-insensitive
        { content: { $regex: search, $options: "i" } },
      ];
    }

    // Filter by tag
    if (tag) {
      filter.tags = { $in: [tag] }; // $in means "contains any of these values"
    }

    // Sorting options
    const sortOptions = {
      newest: { createdAt: -1 }, // -1 = descending (newest first)
      oldest: { createdAt: 1 }, // 1  = ascending  (oldest first)
      popular: { views: -1 }, // most viewed first
    };

    // .populate('author', 'username avatar') replaces the author ObjectId
    // with the actual username and avatar from the User collection
    // It's like a JOIN in SQL

    const skip = (Number(page) - 1) * Number(limit); // pagination math

    const posts = await Post.find(filter)
      .populate("author", "username avatar")
      .sort(sortOptions[sort] || sortOptions.newest)
      .skip(skip)
      .limit(Number(limit))
      .lean(); // .lean() returns plain JS object (faster, no Mongoose methods)

    // Count total posts for pagination
    const total = await Post.countDocuments(filter);

    res.json({
      success: true,
      posts,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        hasMore: skip + posts.length < total,
      },
    });
  } catch (error) {
    next(error);
  }
});

// ──────────────────────────────────────────
// GET /api/posts/:id — Get one post (public)
// ──────────────────────────────────────────
router.get("/:id", async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id).populate(
      "author",
      "username avatar bio",
    );

    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    // Increment view count every time post is fetched
    post.views += 1;
    await post.save();

    res.json({ success: true, post });
  } catch (error) {
    next(error);
  }
});

// ──────────────────────────────────────────
// POST /api/posts — Create post (login required)
// ──────────────────────────────────────────
// upload.single('image') is multer middleware — it processes one file
// named 'image' from the form data and uploads it to Cloudinary
router.post(
  "/",
  protect, // first check: is user logged in?
  upload.single("image"), // second: handle optional image upload
  [
    body("title")
      .trim()
      .isLength({ min: 5 })
      .withMessage("Title must be at least 5 characters"),
    body("content")
      .trim()
      .isLength({ min: 10 })
      .withMessage("Content must be at least 10 characters"),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        // If validation fails but an image was already uploaded to Cloudinary, delete it
        if (req.file) {
          await cloudinary.uploader.destroy(req.file.filename);
        }
        return res.status(400).json({
          success: false,
          errors: errors.array().map((e) => e.msg),
        });
      }

      const { title, content, tags } = req.body;

      // Parse tags: "javascript, react, nodejs" → ["javascript", "react", "nodejs"]
      const parsedTags = tags
        ? tags
            .split(",")
            .map((t) => t.trim().toLowerCase())
            .filter(Boolean)
        : [];

      // Build post data
      const postData = {
        title,
        content,
        tags: parsedTags,
        author: req.user.userId, // from the protect middleware
      };

      // If image was uploaded, add Cloudinary URL and publicId
      if (req.file) {
        postData.image = {
          url: req.file.path, // Cloudinary URL
          publicId: req.file.filename, // Cloudinary public ID (for deletion)
        };
      }

      const post = await Post.create(postData);

      // Populate author info before sending response
      await post.populate("author", "username avatar");

      res.status(201).json({
        success: true,
        message: "Post created successfully!",
        post,
      });
    } catch (error) {
      next(error);
    }
  },
);

// ──────────────────────────────────────────
// PUT /api/posts/:id — Update post (only author)
// ──────────────────────────────────────────
router.put("/:id", protect, upload.single("image"), async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    // Authorization check: only the author can edit their post
    // post.author is an ObjectId, req.user.userId is a string
    // .toString() converts ObjectId to string for comparison
    if (post.author.toString() !== req.user.userId) {
      // Delete newly uploaded image if not authorized
      if (req.file) await cloudinary.uploader.destroy(req.file.filename);
      return res.status(403).json({
        success: false,
        message: "Forbidden: You can only edit your own posts",
      });
    }

    const { title, content, tags } = req.body;

    // Update only the fields that were provided
    if (title) post.title = title;
    if (content) post.content = content;
    if (tags !== undefined) {
      post.tags = tags
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);
    }

    // If a new image was uploaded
    if (req.file) {
      // Delete the OLD image from Cloudinary first (to save storage)
      if (post.image && post.image.publicId) {
        await cloudinary.uploader.destroy(post.image.publicId);
      }
      post.image = {
        url: req.file.path,
        publicId: req.file.filename,
      };
    }

    await post.save();
    await post.populate("author", "username avatar");

    res.json({
      success: true,
      message: "Post updated successfully!",
      post,
    });
  } catch (error) {
    next(error);
  }
});

// ──────────────────────────────────────────
// DELETE /api/posts/:id — Delete post (only author)
// ──────────────────────────────────────────
router.delete("/:id", protect, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    // Only the author can delete their post
    if (post.author.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You can only delete your own posts",
      });
    }

    // Delete image from Cloudinary before deleting the post
    // (Otherwise the image stays in Cloudinary forever — wasting storage)
    if (post.image && post.image.publicId) {
      await cloudinary.uploader.destroy(post.image.publicId);
    }

    // Delete the post from MongoDB
    await post.deleteOne();

    res.json({ success: true, message: "Post deleted successfully!" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
