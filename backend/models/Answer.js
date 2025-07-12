const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, "Answer content is required"],
      minlength: [20, "Content must be at least 20 characters"],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },
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
    isEdited: {
      type: Boolean,
      default: false,
    },
    editedAt: Date,
    isAccepted: {
      type: Boolean,
      default: false,
    },
    acceptedAt: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for vote count
answerSchema.virtual("voteCount").get(function () {
  return this.votes.upvotes.length - this.votes.downvotes.length;
});

// Indexes for performance
answerSchema.index({ question: 1, createdAt: -1 });
answerSchema.index({ author: 1 });
answerSchema.index({ "votes.upvotes": -1 });

// Method to vote
answerSchema.methods.vote = function (userId, voteType) {
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
answerSchema.methods.hasVoted = function (userId) {
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

// Method to mark as accepted
answerSchema.methods.markAsAccepted = function () {
  this.isAccepted = true;
  this.acceptedAt = Date.now();
  return this.save();
};

module.exports = mongoose.model("Answer", answerSchema);
