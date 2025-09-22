const jwt = require('../utils/jwt');
const { User } = require('../config/modelsConfig');

const isAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const token = authHeader.split(' ')[1];

        const decodedToken = jwt.tokenVerification('access', token);

        if (!decodedToken) {
            return res.status(401).json({ message: 'Invalid token' });
        }

        const user = await User.findOne({ where: { email: decodedToken.email } });

        if (!user || user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
};

module.exports = isAuth;
