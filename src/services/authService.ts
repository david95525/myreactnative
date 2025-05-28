import React from 'react';
import {authorize} from 'react-native-app-auth';
import {api_url, config} from '../config/authConfig';
import {TokenData} from '../types/auth';
import {TokenManager} from './TokenManager';

const tokenManager = new TokenManager(config);

export const AuthService = {
    login: async (setError: React.Dispatch<React.SetStateAction<string | null>>): Promise<TokenData | null> => {
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
        } catch (err: unknown) {
            if (typeof err === 'string') {
                setError(`Error initiating login: ${err}`);
            } else if (err instanceof Error) {
                setError(`Error initiating login:'${err.message}`);
            } else {
                setError(`Error initiating login: ${err}`);
            }
            return null;
        }
    },

    logout: async (): Promise<void> => {
        await tokenManager.clearToken();
    },

    getValidToken: async (setError: React.Dispatch<React.SetStateAction<string | null>>): Promise<TokenData | null> => {
        try {
            let result = await tokenManager.refreshTokenIfNeeded();
            return result;
        } catch (err: unknown) {
            if (typeof err === 'string') {
                setError(`Token refresh failed: ${err}`);
            } else if (err instanceof Error) {
                setError(`Token refresh failed: ${err.message}`);
            } else {
                setError(`Token refresh failed: ${err}`);
            }
            return null;
        }
    },
    isAccessTokenExpired: () => {
        return tokenManager.isTokenExpired;
    },
    getBaseMemberData: async (token: string, setError: React.Dispatch<React.SetStateAction<string | null>>): Promise<any> => {
        try {
            let query = new URLSearchParams({
                client_id: config.clientId ?? '',
                client_secret: config.clientSecret ?? '',
            }).toString();
            const url = `${api_url.member_base_data}?${query}`;
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            let data = await response.json();
            return data;
        } catch (err: unknown) {
            if (typeof err === 'string') {
                setError(`Failed to fetch member data: ${err}`);
            } else if (err instanceof Error) {
                setError(`Failed to fetch member data:'${err.message}`);
            } else {
                setError(`Failed to fetch member data: ${err}`);
            }
        }
    },
};
