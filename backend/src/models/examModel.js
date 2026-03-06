const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["mcq", "trueFalse", "fillBlanks", "shortAns"],
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  options: [{
    type: String,
  }],
  correct: {
    type: mongoose.Schema.Types.Mixed, 
    required: true,
  },
});

const ExamSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    materialId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Material",
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    config: {
      scope: {
        type: String,
        enum: ["entire", "specific"],
        required: true,
      },
      specificTopic: String,
      difficulty: {
        type: String,
        enum: ["easy", "medium", "hard", "mixed"],
        required: true,
      },
      questionTypes: {
        mcq: { type: Boolean, default: true },
        trueFalse: { type: Boolean, default: false },
        fillBlanks: { type: Boolean, default: false },
        shortAns: { type: Boolean, default: false },
      },
      mode: {
        type: String,
        enum: ["exam", "practice"],
        required: true,
      },
      includePastMistakes: { type: Boolean, default: false },
    },

    questions: [QuestionSchema],

    status: {
      type: String,
      enum: ["generating", "ready", "failed"],
      default: "generating",
    },

    totalQuestions: {
      type: Number,
      default: 0,
    },

    result: {
      score: Number,
      correctAnswers: Number,
      totalQuestions: Number,
      timeSpent: Number,
      markedForReview: Number,
      notAnswered: Number,
      answers: mongoose.Schema.Types.Mixed,
      completedAt: Date,
      isCompleted: {
        type: Boolean,
        default: false,
      },
    },

    retakeOf: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Exam", ExamSchema);