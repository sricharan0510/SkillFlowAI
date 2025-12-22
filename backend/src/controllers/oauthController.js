const passport = require('passport');
const querystring = require('querystring');
const oauthService = require('../services/oauthService');

exports.googleAuth = passport.authenticate('google', { scope: ['profile', 'email'], prompt: 'select_account' });

exports.googleCallback = async (req, res, next) => {
    passport.authenticate('google', { session: false }, async (err, profile) => {
        try {
            if (err || !profile) {
                return res.status(400).send('Authentication failed');
            }

            const googleProfile = {
                id: profile.id,
                displayName: profile.displayName,
                emails: profile.emails,
                photos: profile.photos,
            };

            const userAgent = req.headers['user-agent'] || '';
            const ipAddress = req.ip;

            const user = await oauthService.findOrCreateGoogleUser(googleProfile);
            const { accessToken, refreshToken } = await oauthService.createTokensForUser(user, { userAgent, ipAddress });

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });

            const redirectUrl = `${process.env.FRONTEND_URL}/oauth2/redirect`;
            return res.redirect(redirectUrl);
        } catch (error) {
            return next(error);
        }
    })(req, res, next);
};
