import {config} from '../config/authConfig';
import {AuthService} from './authService';

export const ApiService = {
    authorizedFetch: async (
        url: string,
        options: RequestInit = {},
        setError: (msg: string | null) => void
    ): Promise<Response | null> => {
        try {
            const token = await AuthService.getValidToken(setError);
            if (!token) {throw new Error('No valid access token');}
            const urlObj = new URL(url);
            urlObj.searchParams.append('client_id', config.clientId);
            urlObj.searchParams.append('client_secret', config.clientSecret ?? '');
            const response = await fetch(urlObj.toString(), {
                ...options,
                headers: {
                    ...options.headers,
                    Authorization: `Bearer ${token.accessToken}`,
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {throw new Error(`HTTP error: ${response.status}`);}
            return response;
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Unknown error occurred during authorizedFetch');
            }
            return null;
        }
    },
};
