module.exports = {
    zoho: {
        accountId: process.env.ZOHO_ACCOUNT_ID,
        clientId: process.env.ZOHO_CLIENT_ID,
        clientSecret: process.env.ZOHO_CLIENT_SECRET,
        refreshToken: process.env.ZOHO_REFRESH_TOKEN,
        baseUrl: 'https://mail.zoho.eu/api/accounts',
        tokenUrl: 'https://accounts.zoho.eu/oauth/v2/token',
    },

    email: {
        fromAddress: 'info@pensa.club',
        frontendUrl: process.env.FRONTEND_SERVER,
    },
};
