const { tokenVerification } = require('../utils/jwt');
const { User } = require('../config/modelsConfig');

const isAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const token = authHeader.split(' ')[1];

        const decodedToken = tokenVerification('access', token);

        const user = await User.findOne({ where: { email: decodedToken.email } });

        if (!user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
};

module.exports = isAuth;
