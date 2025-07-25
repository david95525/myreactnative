import {authorize} from 'react-native-app-auth';
import {config} from '../constants/authConfig';
import {TokenData} from '../types/auth';
import {TokenManager} from './TokenManager';

const tokenManager = new TokenManager(config);

export const AuthService = {
    login: async (setError?: (msg: string) => void): Promise<TokenData | null> => {
        try {
            let result = await authorize(config);
            let token: TokenData = {
                accessToken: result.accessToken,
                refreshToken: result.refreshToken,
                accessTokenExpirationDate: result.accessTokenExpirationDate,
                idToken: result.idToken,
                tokenType: result.tokenType,
            };
            await tokenManager.saveToken(token);
            return token;
        } catch (e) {
            setError?.('Login failed: ' + (e as Error).message);
            return null;
        }
    },

    logout: async (): Promise<boolean> => {
        return await tokenManager.clearToken();
    },

    isAccessTokenExpired: (expiry: string) => {
        return new Date(expiry).getTime() < Date.now();
    },

    getValidToken: async (setError?: (msg: string) => void): Promise<TokenData | null> => {
        try {
            return await tokenManager.refreshTokenIfNeeded();
        } catch (e) {
            setError?.('Token refresh failed: ' + (e as Error).message);
            return null;
        }
    },
};

