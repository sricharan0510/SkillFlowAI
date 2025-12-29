const mongoose = require("mongoose");

const MaterialSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      enum: ["exams", "resume", "notes"], 
      required: true
    },

    fileUrl: {
      type: String,
      required: true,
    },

    extractedText: {
      type: String,
      required: true,
    },

    pageCount: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["processing", "completed", "failed"],
      default: "processing",
    },
    
    summary: {
      type: String,
      default: null, 
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Material", MaterialSchema);