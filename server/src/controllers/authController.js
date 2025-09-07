const authController = require('express').Router();
const bcrypt = require('bcrypt');
const uuid = require('uuid');
const { sendResetEmail } = require('../utils/zohoEmails');

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

        const sessionToken = uuid.v4();
        const expiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 1 week (7 days)

        await user.addSessionToken(sessionToken, expiryDate);
        await user.cleanupExpiredTokens();

        res.cookie('adminSession', sessionToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.json({
            message: 'Login successful.',
        });
    } catch (err) {
        next(err);
    }
});

authController.post('/logout', async (req, res, next) => {
    try {
        const sessionToken = req.cookies.adminSession;

        if (sessionToken) {
            const users = await User.findAll();
            const user = users.find((u) => {
                const tokens = u.sessionTokens || [];
                return tokens.some((t) => t.token === sessionToken);
            });

            if (user) {
                await user.removeSessionToken(sessionToken);
            }
        }

        res.clearCookie('adminSession', {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
        });

        return res.json({ message: 'Logout successful.' });
    } catch (error) {
        next(error);
    }
});

authController.post('/request-reset-password', async (req, res, next) => {
    try {
        const { email } = req.body;

        if (email !== process.env.ADMIN_EMAIL) {
            return res.status(404).json({ message: 'There is no user registered with that email address.' });
        }

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

authController.post('/reset-password-with-token', async (req, res, next) => {
    try {
        const { resetToken, newPassword } = req.body;

        if (!resetToken || !newPassword) {
            return res.status(400).json({ message: 'Reset token and new password are required.' });
        }

        // Find user by reset token
        const user = await User.findOne({
            where: {
                resetToken: resetToken,
                tokenExpiration: {
                    [Op.gt]: new Date(), // Token not expired
                },
            },
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset token.' });
        }

        // Hash new password
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        // Update password and clear reset token
        await user.update({
            password: hashedNewPassword,
            resetToken: null,
            tokenExpiration: null,
        });

        return res.json({ message: 'Password reset successfully.' });
    } catch (error) {
        next(error);
    }
});

authController.post('/reset-password', isAuth, async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // Verify current password
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, req.user.password);
        if (!isCurrentPasswordValid) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        // Hash new password
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        await req.user.update({ password: hashedNewPassword });

        return res.json({ message: 'Password changed successfully' });
    } catch (error) {
        next(error);
    }
});

module.exports = authController;
