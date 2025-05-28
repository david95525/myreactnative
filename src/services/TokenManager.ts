import {AuthConfiguration, refresh} from 'react-native-app-auth';
import * as Keychain from 'react-native-keychain';
import {TokenData} from '../types/auth';

const STORAGE_KEY = 'auth_token';

export class TokenManager {
    constructor(private config: AuthConfiguration) { }

    async saveToken(token: TokenData): Promise<void> {
        await Keychain.setGenericPassword(STORAGE_KEY, JSON.stringify(token));
    }

    async loadToken(): Promise<TokenData | null> {
        const credentials = await Keychain.getGenericPassword();
        if (!credentials) {return null;}
        try {
            return JSON.parse(credentials.password);
        } catch {
            return null;
        }
    }

    async clearToken(): Promise<void> {
        await Keychain.resetGenericPassword();
    }

    isTokenExpired(token: TokenData): boolean {
        return new Date(token.accessTokenExpirationDate) <= new Date();
    }

    async refreshTokenIfNeeded(): Promise<TokenData | null> {
        const current = await this.loadToken();
        if (!current || !current.refreshToken) {return null;}

        if (!this.isTokenExpired(current)) {
            return current;
        }
        const refreshed = await refresh(this.config, {
            refreshToken: current.refreshToken,
        });
        const updated: TokenData = {
            accessToken: refreshed.accessToken,
            refreshToken: refreshed.refreshToken ?? current.refreshToken,
            accessTokenExpirationDate: refreshed.accessTokenExpirationDate,
            idToken: refreshed.idToken,
            tokenType: refreshed.tokenType,
        };
        await this.saveToken(updated);
        return updated;
    }
}
