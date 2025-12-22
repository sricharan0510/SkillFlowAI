const crypto = require('crypto');
const User = require('../models/userModel');
const EmailOtp = require('../models/emailOtpModel');
const PasswordResetToken = require('../models/passwordResetTokenModel');
const RefreshToken = require('../models/refreshTokenModel');

const generateOtp = require('../utils/generateOtp');
const sendEmail = require('../utils/sendEmail');
const { generateAccessToken, generateRefreshToken } = require('../utils/tokenUtils');
const { hashValue, compareValue } = require('../utils/hashUtils');
const { otpEmailTemplate, resetPasswordTemplate } = require('../utils/emailTemplates');

//  ------------------  REGISTER USER ------------------  
async function registerUser({ fullName, email, password }) {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('User already exists');
  }

  const passwordHash = await hashValue(password);

  const user = await User.create({
    fullName,
    email,
    passwordHash,
    isEmailVerified: false,
    planType: 'free',
    credits: {
      pdfUploadsRemaining: 5,
      examsRemaining: 2,
      interviewsRemaining: 1,
    },
  });

  return user;
}

// ------------------ CREATE & SEND EMAIL OTP ------------------  
async function createAndSendEmailOtp(user) {
  await EmailOtp.updateMany(
    { userId: user._id, used: false },
    { used: true }
  );

  const otp = generateOtp(6);
  const otpHash = await hashValue(otp);

  await EmailOtp.create({
    userId: user._id,
    otpHash,
    purpose: 'email_verification',
    expiresAt: new Date(Date.now() + 10 * 60 * 1000), 
  });

  await sendEmail({
    to: user.email,
    subject: 'Verify your email',
    html: otpEmailTemplate(otp),
  });
}

// ------------------ VERIFY EMAIL OTP ------------------ 
async function verifyEmailOtp({ email, otp }) {
  const user = await User.findOne({ email });
  if (!user) throw new Error('Invalid email');

  const otpRecord = await EmailOtp.findOne({
    userId: user._id,
    used: false,
    purpose: 'email_verification',
  }).sort({ createdAt: -1 });

  if (!otpRecord) throw new Error('OTP not found or expired');

  if (otpRecord.expiresAt < new Date()) {
    throw new Error('OTP expired');
  }

  const isValid = await compareValue(otp, otpRecord.otpHash);
  if (!isValid) throw new Error('Invalid OTP');

  otpRecord.used = true;
  await otpRecord.save();

  user.isEmailVerified = true;
  await user.save();

  return user;
}

// ------------------ LOGIN USER ------------------ 
async function loginUser({ email, password, userAgent, ipAddress }) {
  const user = await User.findOne({ email });
  if (!user) throw new Error('Invalid credentials');

  if (!user.isEmailVerified) {
    throw new Error('Email not verified');
  }

  const isMatch = await compareValue(password, user.passwordHash);
  if (!isMatch) throw new Error('Invalid credentials');

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  const refreshTokenHash = await hashValue(refreshToken);

  await RefreshToken.create({
    userId: user._id,
    refreshTokenHash,
    userAgent,
    ipAddress,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  user.lastLoginAt = new Date();
  await user.save();

  return { user, accessToken, refreshToken };
}

// ------------------ REFRESH TOKEN ------------------ 
async function refreshTokens({ refreshToken }) {
  const jwt = require('jsonwebtoken');

  const decoded = jwt.verify(
    refreshToken,
    process.env.JWT_REFRESH_SECRET
  );

  const userId = decoded.id;

  if (!userId) {
    throw new Error('Invalid refresh token payload');
  }

  const tokenDocs = await RefreshToken.find({
    userId,
    revoked: false,
    expiresAt: { $gt: new Date() },
  });

  let matchedToken = null;
  for (const doc of tokenDocs) {
    const match = await compareValue(refreshToken, doc.refreshTokenHash);
    if (match) {
      matchedToken = doc;
      break;
    }
  }

  if (!matchedToken) throw new Error('Invalid refresh token');

  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  const newAccessToken = generateAccessToken(user);

  return { accessToken: newAccessToken };
}


// ------------------ FORGOT PASSWORD ------------------ 
async function createPasswordResetToken(email) {
  const user = await User.findOne({ email });
  if (!user) return; 

  await PasswordResetToken.updateMany(
    { userId: user._id, used: false },
    { used: true }
  );

  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = await hashValue(rawToken);

  await PasswordResetToken.create({
    userId: user._id,
    tokenHash,
    expiresAt: new Date(Date.now() + 30 * 60 * 1000), 
  });

  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${rawToken}&uid=${user._id}`;

  await sendEmail({
    to: user.email,
    subject: 'Reset your password',
    html: resetPasswordTemplate(resetLink),
  });
}

// ------------------ RESET PASSWORD ------------------ 
async function resetPassword({ userId, token, newPassword }) {
  const tokenDoc = await PasswordResetToken.findOne({
    userId,
    used: false,
    expiresAt: { $gt: new Date() },
  });

  if (!tokenDoc) throw new Error('Invalid or expired reset token');

  const isValid = await compareValue(token, tokenDoc.tokenHash);
  if (!isValid) throw new Error('Invalid or expired reset token');

  const passwordHash = await hashValue(newPassword);

  await User.findByIdAndUpdate(userId, { passwordHash });

  tokenDoc.used = true;
  await tokenDoc.save();

  await RefreshToken.updateMany(
    { userId },
    { revoked: true }
  );
}

// ------------------ LOGOUT ------------------  
async function logout({ userId, refreshToken }) {
  const tokenDocs = await RefreshToken.find({
    userId,
    revoked: false,
  });

  for (const doc of tokenDocs) {
    const match = await compareValue(refreshToken, doc.refreshTokenHash);
    if (match) {
      doc.revoked = true;
      await doc.save();
      break;
    }
  }
}

module.exports = {
  registerUser,
  createAndSendEmailOtp,
  verifyEmailOtp,
  loginUser,
  refreshTokens,
  createPasswordResetToken,
  resetPassword,
  logout,
};
