const { v4: uuidv4 } = require('uuid');

const checkAndSetCookie = (req, res, cookieName, value = null) => {
    const cookieValue = req.cookies[cookieName];

    if (cookieValue) {
        return false;
    }

    const newValue = value || uuidv4();
    res.cookie(cookieName, newValue, {
        maxAge: 6 * 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
    });

    return true;
};

module.exports = { checkAndSetCookie };
