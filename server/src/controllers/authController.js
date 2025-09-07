const authController = require('express').Router();
const bcrypt = require('bcrypt');
const { tokenVerification, tokenGenerator } = require('../utils/jwt');
const isAuth = require('../middlewares/isAuth');
const uuid = require('uuid');
const { sendResetEmail } = require('../utils/zohoEmails');

const { User } = require('../config/modelsConfig');

authController.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({
            where: { email: email },
        });

        if (!user) return res.status(409).json({ message: 'Username or password are invalid!' });

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) return res.status(409).json({ message: 'Username or password are invalid!' });

        const { token: accessToken } = tokenGenerator('access', user);
        const { token: refreshJwtToken, refreshTokenId, expiryDate: refreshExpiryDate } = tokenGenerator('refresh', user);

        console.log('Before update:', user.refreshTokens);

        await user.addRefreshToken(refreshTokenId, refreshExpiryDate);
        await user.cleanupExpiredTokens();

        console.log('After update - new tokens:', user.refreshTokens);

        res.cookie('refreshJwtToken', refreshJwtToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: refreshExpiryDate - Date.now(),
        });

        return res.json({
            message: 'Login successful',
            accessToken,
        });
    } catch (err) {
        next(err);
    }
});

authController.post('/logout', isAuth, async (req, res, next) => {
    try {
        const refreshJwtToken = req.cookies.refreshJwtToken;

        if (refreshJwtToken) {
            try {
                const decodedToken = tokenVerification('refresh', refreshJwtToken);
                await req.user.removeRefreshToken(decodedToken.refreshTokenId);
            } catch (error) {
                console.log('Invalid refresh token during logout:', error.message);
            }
        }

        res.clearCookie('refreshJwtToken', {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
        });

        return res.json({ message: 'Logout successful' });
    } catch (error) {
        next(error);
    }
});

authController.post('/request-reset-password', async (req, res, next) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ message: 'There is no user registered with that email address.' });
        }

        const resetToken = uuid.v4();
        const expiryTime = new Date(Date.now() + 900000); // 15 min

        await user.update({
            resetToken: resetToken,
            tokenExpiration: expiryTime,
        });

        try {
            await sendResetEmail(email, resetToken);
            return res.status(200).json({ message: `A reset password link has been sent to ${email}.` });
        } catch (emailError) {
            next(new Error(`Error sending email: ${emailError}`));
        }
    } catch (err) {
        next(err);
    }
});

module.exports = authController;
