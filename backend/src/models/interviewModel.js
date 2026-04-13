const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true, trim: true },
    type: { type: String, required: true, trim: true },
    difficulty: { type: String, required: true, trim: true },
    answer: { type: String, default: null, trim: true },
    score: { type: Number, default: 0, min: 0, max: 10 },
    feedback: { type: String, default: "", trim: true },
    improvement: { type: String, default: "", trim: true }
  },
  { timestamps: true }
);

const interviewSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    role: { type: String, required: true, trim: true, index: true },
    difficulty: {
      type: String,
      enum: ["basic", "easy", "medium", "hard", "expert"],
      default: "medium"
    },
    experience: { type: String, default: "fresher", trim: true },
    questions: { type: [questionSchema], default: [] },
    currentQuestionIndex: { type: Number, default: 0, min: 0 },
    totalScore: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ["active", "completed", "aborted"],
      default: "active",
      index: true
    },
    report: { type: mongoose.Schema.Types.Mixed, default: null } // Cache the final report
  },
  { timestamps: true }
);

module.exports = mongoose.model("Interview", interviewSchema);