const jwt = require('../utils/jwt');
const { user_account } = require('../config/modelsConfig');

function createMiddleware(allowGuest = false) {
    return async function (req, res, next) {
        const authHeader = req.headers.authorization;
        const refreshJwtToken = req.cookies.refreshJwtToken;

        // Guest access flow for limited routes
        if (!authHeader && allowGuest) {
            req.user = null;
            return next();
        }

        // Regular auth flow
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            try {
                const decodedToken = jwt.tokenVerification('access', token);
                if (decodedToken) {
                    if (decodedToken.role === 'admin') {
                        const user = await user_account.findOne({ where: { email: decodedToken.email } });
                        if (user && user.role === 'admin') {
                            req.user = decodedToken;
                            return next();
                        } else {
                            return res.status(403).json({ message: 'Access denied' });
                        }
                    } else {
                        req.user = decodedToken;
                        return next();
                    }
                } else {
                    return res.status(401).json({ message: 'Unauthorized' });
                }
            } catch (err) {
                return next(err);
            }
        } else {
            return res.status(401).json({ message: 'Unauthorized' });
        }
    };
}

// Default middleware that requires valid authentication tokens
const defaultMiddleware = createMiddleware(false);

// Allows both authenticated users and guests - used with rate limiters for public endpoints
defaultMiddleware.allowGuest = createMiddleware(true);

module.exports = defaultMiddleware;
