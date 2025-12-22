const authService = require('../services/authService');

// ------------------ REGISTER ------------------  
exports.register = async (req, res, next) => {
    try {
        const { fullName, email, password } = req.body;

        if (!fullName || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const user = await authService.registerUser({ fullName, email, password });
        await authService.createAndSendEmailOtp(user);

        res.status(201).json({
            message: 'Registration successful. OTP sent to email.',
        });
    } catch (err) {
        next(err);
    }
};

// ------------------ VERIFY EMAIL OTP ------------------ 
exports.verifyEmail = async (req, res, next) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: 'Email and OTP are required' });
        }

        await authService.verifyEmailOtp({ email, otp });

        res.json({ message: 'Email verified successfully' });
    } catch (err) {
        next(err);
    }
};

// ------------------ LOGIN ------------------  
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const { user, accessToken, refreshToken } =
            await authService.loginUser({
                email,
                password,
                userAgent: req.headers['user-agent'],
                ipAddress: req.ip,
            });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            secure: false,
            path: '/',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.json({
            accessToken,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                planType: user.planType,
            },
        });
    } catch (err) {
        next(err);
    }
};

// ------------------ REFRESH TOKEN ------------------ 
exports.refreshToken = async (req, res, next) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.status(401).json({ message: 'Refresh token missing' });
        }

        const { accessToken } = await authService.refreshTokens({ refreshToken });

        res.json({ accessToken });
    } catch (err) {
        next(err);
    }
};

// ------------------ FORGOT PASSWORD ------------------ 
exports.forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        await authService.createPasswordResetToken(email);

        res.json({
            message: 'If the email exists, a reset link has been sent.',
        });
    } catch (err) {
        next(err);
    }
};

// ------------------ RESET PASSWORD ------------------ 
exports.resetPassword = async (req, res, next) => {
    try {
        const { userId, token, newPassword } = req.body;

        if (!userId || !token || !newPassword) {
            return res.status(400).json({ message: 'Invalid request' });
        }

        await authService.resetPassword({ userId, token, newPassword });

        res.json({ message: 'Password reset successful' });
    } catch (err) {
        next(err);
    }
};

// ------------------ LOGOUT ------------------ 
exports.logout = async (req, res, next) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.sendStatus(204);
        }

        await authService.logout({
            userId: req.user.id,
            refreshToken,
        });

        res.clearCookie('refreshToken');
        res.json({ message: 'Logged out successfully' });
    } catch (err) {
        next(err);
    }
};

// ------------------ RESEND OTP ------------------ 
exports.resendOtp = async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = generateOtp();
    const otpHash = await hashOtp(otp);

    await EmailOtp.create({
        userId: user._id,
        otpHash,
        purpose: "email_verification",
        expiresAt: Date.now() + 5 * 60 * 1000
    });

    await sendEmail({
        to: email,
        subject: "Your new verification code",
        text: `Your new OTP is: ${otp}`
    });

    res.json({ message: "OTP resent successfully" });
};


// ------------------ GET CURRENT USER ------------------ 
exports.getMe = async (req, res) => {
    res.json({ user: req.user });
};