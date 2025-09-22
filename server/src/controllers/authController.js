const authController = require('express').Router();
const bcrypt = require('bcrypt');
const uuid = require('uuid');
const { sendEmail } = require('../utils/emailTemplates');
const { tokenGenerator, tokenVerification } = require('../utils/jwt');

const { User } = require('../config/modelsConfig');
const isAuth = require('../middlewares/isAuth');
const { Op } = require('sequelize');

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
        const { token: refreshToken, refreshTokenId, expiryDate } = tokenGenerator('refresh', user);

        await user.addRefreshToken(refreshTokenId, expiryDate);
        await user.cleanupExpiredRefreshTokens();

        res.cookie('refreshJwtToken', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: expiryDate - Date.now(),
        });

        return res.json({
            message: 'Login successful.',
            token: accessToken,
            user: {
                email: user.email,
                role: 'admin',
                name: 'Сибел',
            },
        });
    } catch (err) {
        next(err);
    }
});

authController.post('/logout', isAuth, async (req, res, next) => {
    try {
        const refreshToken = req.cookies.refreshJwtToken;

        if (!refreshToken) {
            return res.status(400).json({ message: 'No refresh token found.' });
        }

        const decodedToken = tokenVerification('refresh', refreshToken);

        if (!decodedToken || !decodedToken.refreshTokenId) {
            res.clearCookie('refreshJwtToken', {
                httpOnly: true,
                secure: true,
                sameSite: 'strict',
            });
            return res.status(401).json({ message: 'Invalid refresh token.' });
        }

        // Find user and remove the specific refresh token
        const user = await User.findOne({ where: { email: decodedToken.email } });

        if (user) {
            await user.removeRefreshToken(decodedToken.refreshTokenId);
        }

        res.clearCookie('refreshJwtToken', {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
        });

        return res.json({ message: 'Logout successful.' });
    } catch (error) {
        next(error);
    }
});

authController.post('/forgot-password', async (req, res, next) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ message: 'There is no user registered with that email address.' });
        }

        const resetToken = uuid.v4();
        const expiryTime = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        await user.update({
            resetToken: resetToken,
            tokenExpiration: expiryTime,
        });

        await user.clearAllRefreshTokens();

        try {
            await sendEmail('reset', { email, resetToken });
            return res.status(200).json({ message: `A reset password link has been sent to ${email}.` });
        } catch (emailError) {
            next(new Error(`Error sending email: ${emailError}`));
        }
    } catch (err) {
        next(err);
    }
});

authController.post('/reset-password', async (req, res, next) => {
    try {
        const { resetToken, newPassword } = req.body;

        if (!resetToken || !newPassword) {
            return res.status(400).json({ message: 'Reset token and new password are required.' });
        }

        const user = await User.findOne({
            where: {
                resetToken: resetToken,
                tokenExpiration: {
                    [Op.gt]: new Date(),
                },
            },
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset token.' });
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        await user.update({
            password: hashedNewPassword,
            resetToken: null,
            tokenExpiration: null,
        });

        await user.clearAllRefreshTokens();

        return res.json({ message: 'Password reset successfully.' });
    } catch (error) {
        next(error);
    }
});

authController.put('/change-password', isAuth, async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, req.user.password);
        if (!isCurrentPasswordValid) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        await req.user.update({ password: hashedNewPassword });
        await req.user.clearAllRefreshTokens();

        return res.json({ message: 'Password changed successfully' });
    } catch (error) {
        next(error);
    }
});

authController.post('/refresh', async (req, res, next) => {
    try {
        const refreshJwtToken = req.cookies.refreshJwtToken;

        if (!refreshJwtToken) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        let decodedToken;
        try {
            decodedToken = tokenVerification('refresh', refreshJwtToken);
        } catch (err) {
            res.clearCookie('refreshJwtToken', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
            });
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const user = await User.findOne({ where: { email: decodedToken.email } });

        if (!user) {
            res.clearCookie('refreshJwtToken', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
            });
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const refreshTokens = user.refreshTokens || [];
        const storedToken = refreshTokens.find((t) => t.token === decodedToken.refreshTokenId);

        if (!storedToken || new Date(storedToken.expiresAt) < new Date()) {
            res.clearCookie('refreshJwtToken', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
            });
            return res.status(401).json({ message: 'Unauthorized' });
        }

        await user.cleanupExpiredRefreshTokens();

        const newRefreshToken = tokenGenerator('refresh', user);
        const newAccessToken = tokenGenerator('access', user);

        await user.removeRefreshToken(decodedToken.refreshTokenId);
        await user.addRefreshToken(newRefreshToken.refreshTokenId, newRefreshToken.expiryDate);

        res.cookie('refreshJwtToken', newRefreshToken.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: newRefreshToken.expiryDate - Date.now(),
        });

        return res.json({ token: newAccessToken.token });
    } catch (error) {
        next(error);
    }
});

module.exports = authController;
