const emailConfig = require('../config/emailConfig');

async function sendZohoEmailRaw(data) {
    const url = `${emailConfig.zoho.baseUrl}/${emailConfig.zoho.accountId}/messages`;

    if (!process.env.ZOHO_ACCESS_TOKEN) {
        process.env.ZOHO_ACCESS_TOKEN = await getZohoAccessToken();
    }

    let response = await fetch(url, {
        method: 'POST',
        headers: {
            Authorization: `Zoho-oauthtoken ${process.env.ZOHO_ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.json();
        if (errorData.data && errorData.data.errorCode === 'INVALID_OAUTHTOKEN') {
            process.env.ZOHO_ACCESS_TOKEN = await getZohoAccessToken();
            response = await fetch(url, {
                method: 'POST',
                headers: {
                    Authorization: `Zoho-oauthtoken ${process.env.ZOHO_ACCESS_TOKEN}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
        }
        if (!response.ok) {
            throw new Error(`Failed to send email: ${JSON.stringify(errorData)}`);
        }
    }

    return response.json();
}

async function getZohoAccessToken() {
    const { clientId, clientSecret, refreshToken, tokenUrl } = emailConfig.zoho;

    if (!clientId || !clientSecret || !refreshToken) {
        throw new Error('Missing required environment variables for Zoho access token.');
    }

    const params = new URLSearchParams();
    params.append('refresh_token', refreshToken);
    params.append('client_id', clientId);
    params.append('client_secret', clientSecret);
    params.append('grant_type', 'refresh_token');

    try {
        const response = await fetch(tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString(),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Failed to fetch access token: ${errorData.error}`);
        }

        const responseData = await response.json();
        return responseData.access_token;
    } catch (error) {
        console.error('Error fetching access token:', error);
        throw error;
    }
}

module.exports = {
    sendZohoEmailRaw,
    getZohoAccessToken,
};
