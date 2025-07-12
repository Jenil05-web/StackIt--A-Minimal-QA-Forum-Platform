const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Question title is required"],
      trim: true,
      minlength: [10, "Title must be at least 10 characters"],
      maxlength: [300, "Title cannot exceed 300 characters"],
    },
    content: {
      type: String,
      required: [true, "Question content is required"],
      minlength: [20, "Content must be at least 20 characters"],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tags: [
      {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        maxlength: [20, "Tag cannot exceed 20 characters"],
      },
    ],
    votes: {
      upvotes: [
        {
          user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
          createdAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      downvotes: [
        {
          user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
          createdAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
    },
    views: {
      type: Number,
      default: 0,
    },
    answers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Answer",
      },
    ],
    acceptedAnswer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Answer",
      default: null,
    },
    status: {
      type: String,
      enum: ["open", "closed", "duplicate", "on-hold"],
      default: "open",
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    editHistory: [
      {
        editor: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        editedAt: {
          type: Date,
          default: Date.now,
        },
        previousContent: String,
        editReason: String,
      },
    ],
    bounty: {
      amount: {
        type: Number,
        default: 0,
      },
      expiresAt: Date,
      offeredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    featuredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    featuredAt: Date,
    lastActivity: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for vote count
questionSchema.virtual("voteCount").get(function () {
  return this.votes.upvotes.length - this.votes.downvotes.length;
});

// Virtual for answers count
questionSchema.virtual("answersCount").get(function () {
  return this.answers.length;
});

// Virtual for has accepted answer
questionSchema.virtual("hasAcceptedAnswer").get(function () {
  return this.acceptedAnswer !== null;
});

// Virtual for bounty status
questionSchema.virtual("hasActiveBounty").get(function () {
  return this.bounty.amount > 0 && this.bounty.expiresAt > new Date();
});

// Indexes for performance
questionSchema.index({ title: "text", content: "text" });
questionSchema.index({ tags: 1 });
questionSchema.index({ author: 1 });
questionSchema.index({ createdAt: -1 });
questionSchema.index({ lastActivity: -1 });
questionSchema.index({ "votes.upvotes": -1 });
questionSchema.index({ views: -1 });

// Pre-save middleware to update lastActivity
questionSchema.pre("save", function (next) {
  this.lastActivity = new Date();
  next();
});

// Method to add view
questionSchema.methods.addView = function () {
  this.views += 1;
  return this.save();
};

// Method to vote
questionSchema.methods.vote = function (userId, voteType) {
  const upvoteIndex = this.votes.upvotes.findIndex(
    (vote) => vote.user.toString() === userId.toString()
  );
  const downvoteIndex = this.votes.downvotes.findIndex(
    (vote) => vote.user.toString() === userId.toString()
  );

  if (voteType === "upvote") {
    // Remove existing downvote if any
    if (downvoteIndex > -1) {
      this.votes.downvotes.splice(downvoteIndex, 1);
    }

    // Add upvote if not already voted
    if (upvoteIndex === -1) {
      this.votes.upvotes.push({ user: userId });
    } else {
      // Remove upvote if already voted (toggle)
      this.votes.upvotes.splice(upvoteIndex, 1);
    }
  } else if (voteType === "downvote") {
    // Remove existing upvote if any
    if (upvoteIndex > -1) {
      this.votes.upvotes.splice(upvoteIndex, 1);
    }

    // Add downvote if not already voted
    if (downvoteIndex === -1) {
      this.votes.downvotes.push({ user: userId });
    } else {
      // Remove downvote if already voted (toggle)
      this.votes.downvotes.splice(downvoteIndex, 1);
    }
  }

  return this.save();
};

// Method to check if user has voted
questionSchema.methods.hasVoted = function (userId) {
  const hasUpvoted = this.votes.upvotes.some(
    (vote) => vote.user.toString() === userId.toString()
  );
  const hasDownvoted = this.votes.downvotes.some(
    (vote) => vote.user.toString() === userId.toString()
  );

  return {
    hasUpvoted,
    hasDownvoted,
    voteType: hasUpvoted ? "upvote" : hasDownvoted ? "downvote" : null,
  };
};

// Method to accept answer
questionSchema.methods.acceptAnswer = function (answerId) {
  this.acceptedAnswer = answerId;
  return this.save();
};

// Method to add bounty
questionSchema.methods.addBounty = function (
  amount,
  offeredBy,
  expiresInDays = 7
) {
  this.bounty = {
    amount,
    offeredBy,
    expiresAt: new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000),
  };
  return this.save();
};

// Static method to get trending questions
questionSchema.statics.getTrending = function (limit = 10) {
  return this.find({ status: "open" })
    .sort({ views: -1, "votes.upvotes": -1 })
    .limit(limit)
    .populate("author", "username firstName lastName avatar")
    .populate("tags");
};

// Static method to get questions by tag
questionSchema.statics.getByTag = function (tag, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  return this.find({ tags: tag.toLowerCase() })
    .sort({ lastActivity: -1 })
    .skip(skip)
    .limit(limit)
    .populate("author", "username firstName lastName avatar")
    .populate("answers");
};

module.exports = mongoose.model("Question", questionSchema);
