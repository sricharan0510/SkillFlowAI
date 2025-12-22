const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const oauthController = require('../controllers/oauthController');
const authenticate = require('../middleware/authMiddleware');


router.post('/register', authController.register);
router.post('/verify-email', authController.verifyEmail);
router.post('/login', authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/logout', authenticate, authController.logout);

router.get('/google', oauthController.googleAuth);
router.get('/google/callback', oauthController.googleCallback);

router.get('/me', authenticate, authController.getMe);

module.exports = router;
