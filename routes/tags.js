const express = require("express");
const Question = require("../models/Question");

const router = express.Router();

// @route   GET /api/tags
// @desc    Get all tags with usage statistics
// @access  Public
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || "";
    const sortBy = req.query.sortBy || "count";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

    const skip = (page - 1) * limit;

    // Aggregate to get tag statistics
    const pipeline = [
      { $unwind: "$tags" },
      {
        $group: {
          _id: "$tags",
          count: { $sum: 1 },
          questions: { $push: "$_id" },
        },
      },
    ];

    if (search) {
      pipeline.unshift({
        $match: {
          tags: { $regex: search, $options: "i" },
        },
      });
    }

    pipeline.push(
      { $sort: { [sortBy]: sortOrder } },
      { $skip: skip },
      { $limit: limit }
    );

    const tags = await Question.aggregate(pipeline);

    // Get total count for pagination
    const totalPipeline = [
      { $unwind: "$tags" },
      { $group: { _id: "$tags" } },
      { $count: "total" },
    ];

    if (search) {
      totalPipeline.unshift({
        $match: {
          tags: { $regex: search, $options: "i" },
        },
      });
    }

    const totalResult = await Question.aggregate(totalPipeline);
    const total = totalResult[0]?.total || 0;

    res.json({
      success: true,
      data: tags.map((tag) => ({
        name: tag._id,
        count: tag.count,
        questionsCount: tag.questions.length,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get tags error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   GET /api/tags/popular
// @desc    Get popular tags
// @access  Public
router.get("/popular", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const popularTags = await Question.aggregate([
      { $unwind: "$tags" },
      {
        $group: {
          _id: "$tags",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: limit },
    ]);

    res.json({
      success: true,
      data: popularTags.map((tag) => ({
        name: tag._id,
        count: tag.count,
      })),
    });
  } catch (error) {
    console.error("Get popular tags error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   GET /api/tags/:name
// @desc    Get questions by tag
// @access  Public
router.get("/:name", async (req, res) => {
  try {
    const tagName = req.params.name.toLowerCase();
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sortBy = req.query.sortBy || "lastActivity";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

    const skip = (page - 1) * limit;

    const questions = await Question.find({ tags: tagName })
      .populate("author", "username firstName lastName avatar reputation")
      .populate("answers")
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit);

    const total = await Question.countDocuments({ tags: tagName });

    // Get tag statistics
    const tagStats = await Question.aggregate([
      { $unwind: "$tags" },
      { $match: { tags: tagName } },
      {
        $group: {
          _id: "$tags",
          count: { $sum: 1 },
          totalViews: { $sum: "$views" },
          totalVotes: { $sum: { $size: "$votes.upvotes" } },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        tag: tagName,
        questions,
        stats: tagStats[0] || { count: 0, totalViews: 0, totalVotes: 0 },
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get tag questions error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   GET /api/tags/search/:query
// @desc    Search tags
// @access  Public
router.get("/search/:query", async (req, res) => {
  try {
    const query = req.params.query;
    const limit = parseInt(req.query.limit) || 10;

    const tags = await Question.aggregate([
      { $unwind: "$tags" },
      {
        $match: {
          tags: { $regex: query, $options: "i" },
        },
      },
      {
        $group: {
          _id: "$tags",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: limit },
    ]);

    res.json({
      success: true,
      data: tags.map((tag) => ({
        name: tag._id,
        count: tag.count,
      })),
    });
  } catch (error) {
    console.error("Search tags error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

module.exports = router;
