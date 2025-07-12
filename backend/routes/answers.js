const express = require("express");
const { body, validationResult } = require("express-validator");
const Answer = require("../models/Answer");
const Question = require("../models/Question");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();

// @route   POST /api/answers
// @desc    Create a new answer
// @access  Private
router.post(
  "/",
  authMiddleware,
  [
    body("content")
      .isLength({ min: 20 })
      .withMessage("Answer content must be at least 20 characters"),
    body("questionId").isMongoId().withMessage("Valid question ID is required"),
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

      const { content, questionId } = req.body;

      // Check if question exists
      const question = await Question.findById(questionId);
      if (!question) {
        return res.status(404).json({
          success: false,
          message: "Question not found",
        });
      }

      // Check if question is open
      if (question.status !== "open") {
        return res.status(400).json({
          success: false,
          message: "Cannot answer a closed question",
        });
      }

      // Check if user already answered this question
      const existingAnswer = await Answer.findOne({
        question: questionId,
        author: req.user.id,
      });

      if (existingAnswer) {
        return res.status(400).json({
          success: false,
          message: "You have already answered this question",
        });
      }

      const answer = await Answer.create({
        content,
        question: questionId,
        author: req.user.id,
      });

      // Add answer to question
      question.answers.push(answer._id);
      await question.save();

      await answer.populate(
        "author",
        "username firstName lastName avatar reputation"
      );

      res.status(201).json({
        success: true,
        message: "Answer created successfully",
        data: answer,
      });
    } catch (error) {
      console.error("Create answer error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

// @route   PUT /api/answers/:id
// @desc    Update answer
// @access  Private
router.put(
  "/:id",
  authMiddleware,
  [
    body("content")
      .isLength({ min: 20 })
      .withMessage("Answer content must be at least 20 characters"),
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

      const answer = await Answer.findById(req.params.id);

      if (!answer) {
        return res.status(404).json({
          success: false,
          message: "Answer not found",
        });
      }

      // Check if user can edit
      if (
        answer.author.toString() !== req.user.id &&
        req.user.role !== "admin"
      ) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to edit this answer",
        });
      }

      const { content } = req.body;

      answer.content = content;
      answer.isEdited = true;
      answer.editedAt = Date.now();

      await answer.save();
      await answer.populate(
        "author",
        "username firstName lastName avatar reputation"
      );

      res.json({
        success: true,
        message: "Answer updated successfully",
        data: answer,
      });
    } catch (error) {
      console.error("Update answer error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

// @route   DELETE /api/answers/:id
// @desc    Delete answer
// @access  Private
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);

    if (!answer) {
      return res.status(404).json({
        success: false,
        message: "Answer not found",
      });
    }

    // Check if user can delete
    if (answer.author.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this answer",
      });
    }

    // Remove answer from question
    const question = await Question.findById(answer.question);
    if (question) {
      question.answers = question.answers.filter(
        (ans) => ans.toString() !== answer._id.toString()
      );
      await question.save();
    }

    await Answer.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Answer deleted successfully",
    });
  } catch (error) {
    console.error("Delete answer error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   POST /api/answers/:id/vote
// @desc    Vote on answer
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

      const answer = await Answer.findById(req.params.id);

      if (!answer) {
        return res.status(404).json({
          success: false,
          message: "Answer not found",
        });
      }

      // Check if user can vote
      if (!req.user.canVote()) {
        return res.status(403).json({
          success: false,
          message: "You need at least 15 reputation to vote",
        });
      }

      // Don't allow voting on own answer
      if (answer.author.toString() === req.user.id) {
        return res.status(400).json({
          success: false,
          message: "Cannot vote on your own answer",
        });
      }

      await answer.vote(req.user.id, voteType);

      res.json({
        success: true,
        message: "Vote recorded successfully",
        data: {
          voteCount: answer.voteCount,
          hasVoted: answer.hasVoted(req.user.id),
        },
      });
    } catch (error) {
      console.error("Vote answer error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

// @route   POST /api/answers/:id/accept
// @desc    Accept answer
// @access  Private
router.post("/:id/accept", authMiddleware, async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);

    if (!answer) {
      return res.status(404).json({
        success: false,
        message: "Answer not found",
      });
    }

    const question = await Question.findById(answer.question);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    // Check if user is question author
    if (question.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Only the question author can accept answers",
      });
    }

    // Check if answer is already accepted
    if (
      question.acceptedAnswer &&
      question.acceptedAnswer.toString() === answer._id.toString()
    ) {
      return res.status(400).json({
        success: false,
        message: "Answer is already accepted",
      });
    }

    // Accept the answer
    question.acceptedAnswer = answer._id;
    await question.save();

    res.json({
      success: true,
      message: "Answer accepted successfully",
    });
  } catch (error) {
    console.error("Accept answer error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

module.exports = router;
