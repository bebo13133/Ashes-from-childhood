const { User } = require('../config/modelsConfig');

const isAuth = async (req, res, next) => {
    try {
        const sessionToken = req.cookies.adminSession;

        if (!sessionToken) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const users = await User.findAll();
        const user = users.find((u) => {
            const tokens = u.sessionTokens || [];
            return tokens.some((t) => t.token === sessionToken);
        });

        if (!user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const tokens = user.sessionTokens || [];
        const tokenData = tokens.find((t) => t.token === sessionToken);

        if (!tokenData || new Date(tokenData.expiresAt) < new Date()) {
            await user.removeSessionToken(sessionToken);
            return res.status(401).json({ message: 'Session expired' });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
};

module.exports = isAuth;
