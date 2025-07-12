const express = require("express");
const { body, validationResult } = require("express-validator");
const Question = require("../models/Question");
const { authMiddleware, optionalAuth } = require("../middleware/auth");

const router = express.Router();

// @route   GET /api/questions
// @desc    Get all questions with filtering and pagination
// @access  Public
router.get("/", optionalAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sortBy = req.query.sortBy || "lastActivity";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
    const tag = req.query.tag;
    const search = req.query.search;
    const status = req.query.status || "open";

    const skip = (page - 1) * limit;

    let query = { status };

    if (tag) {
      query.tags = tag.toLowerCase();
    }

    if (search) {
      query.$text = { $search: search };
    }

    const questions = await Question.find(query)
      .populate("author", "username firstName lastName avatar reputation")
      .populate("answers")
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit);

    const total = await Question.countDocuments(query);

    res.json({
      success: true,
      data: questions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get questions error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   GET /api/questions/:id
// @desc    Get question by ID
// @access  Public
router.get("/:id", optionalAuth, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate("author", "username firstName lastName avatar reputation")
      .populate({
        path: "answers",
        populate: {
          path: "author",
          select: "username firstName lastName avatar reputation",
        },
      });

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    // Add view if user is authenticated
    if (req.user) {
      await question.addView();
    }

    res.json({
      success: true,
      data: question,
    });
  } catch (error) {
    console.error("Get question error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   POST /api/questions
// @desc    Create a new question
// @access  Private
router.post(
  "/",
  authMiddleware,
  [
    body("title")
      .isLength({ min: 10, max: 300 })
      .withMessage("Title must be between 10 and 300 characters"),
    body("content")
      .isLength({ min: 20 })
      .withMessage("Content must be at least 20 characters"),
    body("tags")
      .isArray({ min: 1, max: 5 })
      .withMessage("At least 1 and maximum 5 tags are required"),
    body("tags.*")
      .isLength({ min: 1, max: 20 })
      .withMessage("Each tag must be between 1 and 20 characters"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { title, content, tags, isAnonymous } = req.body;

      const question = await Question.create({
        title,
        content,
        tags: tags.map((tag) => tag.toLowerCase()),
        author: req.user.id,
        isAnonymous: isAnonymous || false,
      });

      await question.populate(
        "author",
        "username firstName lastName avatar reputation"
      );

      res.status(201).json({
        success: true,
        message: "Question created successfully",
        data: question,
      });
    } catch (error) {
      console.error("Create question error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

// @route   PUT /api/questions/:id
// @desc    Update question
// @access  Private
router.put(
  "/:id",
  authMiddleware,
  [
    body("title")
      .optional()
      .isLength({ min: 10, max: 300 })
      .withMessage("Title must be between 10 and 300 characters"),
    body("content")
      .optional()
      .isLength({ min: 20 })
      .withMessage("Content must be at least 20 characters"),
    body("tags")
      .optional()
      .isArray({ min: 1, max: 5 })
      .withMessage("At least 1 and maximum 5 tags are required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const question = await Question.findById(req.params.id);

      if (!question) {
        return res.status(404).json({
          success: false,
          message: "Question not found",
        });
      }

      // Check if user can edit
      if (
        question.author.toString() !== req.user.id &&
        req.user.role !== "admin"
      ) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to edit this question",
        });
      }

      const { title, content, tags, editReason } = req.body;

      // Add to edit history
      question.editHistory.push({
        editor: req.user.id,
        previousContent: question.content,
        editReason: editReason || "No reason provided",
      });

      if (title) question.title = title;
      if (content) question.content = content;
      if (tags) question.tags = tags.map((tag) => tag.toLowerCase());

      question.isEdited = true;

      await question.save();
      await question.populate(
        "author",
        "username firstName lastName avatar reputation"
      );

      res.json({
        success: true,
        message: "Question updated successfully",
        data: question,
      });
    } catch (error) {
      console.error("Update question error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

// @route   DELETE /api/questions/:id
// @desc    Delete question
// @access  Private
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    // Check if user can delete
    if (
      question.author.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this question",
      });
    }

    await Question.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Question deleted successfully",
    });
  } catch (error) {
    console.error("Delete question error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   POST /api/questions/:id/vote
// @desc    Vote on question
// @access  Private
router.post(
  "/:id/vote",
  authMiddleware,
  [
    body("voteType")
      .isIn(["upvote", "downvote"])
      .withMessage("Vote type must be upvote or downvote"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { voteType } = req.body;

      const question = await Question.findById(req.params.id);

      if (!question) {
        return res.status(404).json({
          success: false,
          message: "Question not found",
        });
      }

      // Check if user can vote
      if (!req.user.canVote()) {
        return res.status(403).json({
          success: false,
          message: "You need at least 15 reputation to vote",
        });
      }

      // Don't allow voting on own question
      if (question.author.toString() === req.user.id) {
        return res.status(400).json({
          success: false,
          message: "Cannot vote on your own question",
        });
      }

      await question.vote(req.user.id, voteType);

      res.json({
        success: true,
        message: "Vote recorded successfully",
        data: {
          voteCount: question.voteCount,
          hasVoted: question.hasVoted(req.user.id),
        },
      });
    } catch (error) {
      console.error("Vote question error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

// @route   GET /api/questions/trending
// @desc    Get trending questions
// @access  Public
router.get("/trending", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const questions = await Question.getTrending(limit);

    res.json({
      success: true,
      data: questions,
    });
  } catch (error) {
    console.error("Get trending questions error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

module.exports = router;
