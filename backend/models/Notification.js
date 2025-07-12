const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "answer",
        "comment",
        "vote",
        "accept",
        "mention",
        "bounty",
        "system",
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
    },
    answer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Answer",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: Date,
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ sender: 1 });

// Method to mark as read
notificationSchema.methods.markAsRead = function () {
  this.isRead = true;
  this.readAt = Date.now();
  return this.save();
};

// Static method to create notification
notificationSchema.statics.createNotification = function (data) {
  return this.create(data);
};

// Static method to create answer notification
notificationSchema.statics.createAnswerNotification = function (
  questionAuthor,
  answerAuthor,
  question,
  answer
) {
  return this.create({
    recipient: questionAuthor,
    sender: answerAuthor,
    type: "answer",
    title: "New answer to your question",
    message: `${answerAuthor.username} answered your question "${question.title}"`,
    question: question._id,
    answer: answer._id,
  });
};

// Static method to create vote notification
notificationSchema.statics.createVoteNotification = function (
  contentAuthor,
  voter,
  content,
  voteType,
  contentType
) {
  const contentTitle =
    contentType === "question" ? content.title : "your answer";
  const voteText = voteType === "upvote" ? "upvoted" : "downvoted";

  return this.create({
    recipient: contentAuthor,
    sender: voter,
    type: "vote",
    title: `Your ${contentType} was ${voteText}`,
    message: `${voter.username} ${voteText} your ${contentType} "${contentTitle}"`,
    question: contentType === "question" ? content._id : content.question,
    answer: contentType === "answer" ? content._id : undefined,
  });
};

// Static method to create accept notification
notificationSchema.statics.createAcceptNotification = function (
  answerAuthor,
  questionAuthor,
  question,
  answer
) {
  return this.create({
    recipient: answerAuthor,
    sender: questionAuthor,
    type: "accept",
    title: "Your answer was accepted",
    message: `${questionAuthor.username} accepted your answer to "${question.title}"`,
    question: question._id,
    answer: answer._id,
  });
};

// Static method to create mention notification
notificationSchema.statics.createMentionNotification = function (
  mentionedUser,
  mentioner,
  content,
  contentType
) {
  return this.create({
    recipient: mentionedUser,
    sender: mentioner,
    type: "mention",
    title: "You were mentioned",
    message: `${mentioner.username} mentioned you in a ${contentType}`,
    question: contentType === "question" ? content._id : content.question,
    answer: contentType === "answer" ? content._id : undefined,
  });
};

// Static method to create system notification
notificationSchema.statics.createSystemNotification = function (
  recipient,
  title,
  message,
  metadata = {}
) {
  return this.create({
    recipient,
    sender: recipient, // System notifications don't have a sender
    type: "system",
    title,
    message,
    metadata,
  });
};

// Pre-save middleware to update readAt
notificationSchema.pre("save", function (next) {
  if (this.isModified("isRead") && this.isRead && !this.readAt) {
    this.readAt = Date.now();
  }
  next();
});

module.exports = mongoose.model("Notification", notificationSchema);
