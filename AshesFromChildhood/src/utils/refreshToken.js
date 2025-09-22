import { jwtDecode } from 'jwt-decode';

const apiUrl = import.meta.env.VITE_API_URL;

export async function refreshToken(authObject) {
    const token = authObject.token;
    const decodedToken = jwtDecode(token);
    const tokenExpiresIn = new Date(decodedToken.exp * 1000) - new Date();

    if (tokenExpiresIn < 1 * 60 * 1000) {
        const response = await fetch(`${apiUrl}/auth/refresh`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            credentials: 'include',
        });

        const result = await response.json();

        if (response.ok) {
            const updatedAuth = {
                ...authObject,
                token: result.token,
            };
            localStorage.setItem('adminAuth', JSON.stringify(updatedAuth));
            return updatedAuth;
        } else {
            localStorage.removeItem('adminAuth');
            localStorage.removeItem('isAdmin');
            return null;
        }
    } else {
        return authObject;
    }
}
