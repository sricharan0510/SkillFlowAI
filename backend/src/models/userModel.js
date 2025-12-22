const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },

    authProvider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
    },
    googleId: { type: String },
    avatar: { type: String },

    isEmailVerified: { type: Boolean, default: false },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },

    planType: { type: String, enum: ['free', 'premium'], default: 'free' },
    planExpiresAt: { type: Date },

    credits: {
      pdfUploadsRemaining: { type: Number, default: 0 },
      examsRemaining: { type: Number, default: 0 },
      interviewsRemaining: { type: Number, default: 0 },
    },

    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);
