const crypto = require('crypto');
const User = require('../models/userModel');
const RefreshToken = require('../models/refreshTokenModel');
const { generateAccessToken, generateRefreshToken } = require('../utils/tokenUtils');
const { hashValue } = require('../utils/hashUtils');

async function findOrCreateGoogleUser({ id: googleId, displayName, emails, photos }) {
    const email = (emails && emails[0] && emails[0].value) || null;
    if (!email) throw new Error('Google account did not provide email');

    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (!user) {
        user = await User.create({
            fullName: displayName || 'Google User',
            email,
            passwordHash: crypto.randomBytes(16).toString('hex'),
            authProvider: 'google',
            googleId,
            isEmailVerified: true,
            planType: 'free',
            credits: {
                pdfUploadsRemaining: 2,
                examsRemaining: 2,
                interviewsRemaining: 1,
            },
        });
    } else if (!user.googleId) {
        user.googleId = googleId;
        user.isEmailVerified = true;
        await user.save();
    }

    return user;
}

async function createTokensForUser(user, { userAgent, ipAddress }) {
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

    return { accessToken, refreshToken };
}

module.exports = {
    findOrCreateGoogleUser,
    createTokensForUser,
};
