import { refreshToken } from '../../utils/refreshToken.js';

const requester = async (method, url, data) => {
    const options = {
        credentials: 'include',
    };

    if (method !== 'GET') {
        options.method = method;

        if (data) {
            options.headers = {
                'content-type': 'application/json',
            };

            options.body = JSON.stringify(data);
        }
    }

    try {
        const authData = localStorage.getItem('adminAuth');
        if (authData) {
            const auth = JSON.parse(authData);
            if (auth.token) {
                const accessToken = await refreshToken(auth);
                if (!accessToken) return window.location.replace('/');
                options.headers = {
                    ...options.headers,
                    Authorization: `Bearer ${accessToken.token}`,
                };
            }
        }

        const response = await fetch(url, options);

        if (response.status === 401) {
            localStorage.removeItem('adminAuth');
            localStorage.removeItem('isAdmin');
            throw new Error('Unauthorized access');
        }

        if (response.status === 404) {
            throw new Error('Resource not found');
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP Error: ${response.status}`);
        }

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        }

        return await response.json();
    } catch (error) {
        console.error('Request failed:', error);
        throw error;
    }
};

export const requestFactory = () => {
    return {
        get: (url) => requester('GET', url),
        post: (url, data) => requester('POST', url, data),
        put: (url, data) => requester('PUT', url, data),
        patch: (url, data) => requester('PATCH', url, data),
        del: (url) => requester('DELETE', url),
    };
};
