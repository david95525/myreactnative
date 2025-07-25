import {config} from '../constants/authConfig';
import {AuthService} from './AuthService';

type WebViewSource = {
    uri: string;
    headers: {[key: string]: string};
};

export const BloodpressureService = {
    scanBP: async (
        setError: (msg: string | null) => void
    ): Promise<WebViewSource | null> => {
        try {
            const baseUrl = 'https://phrdev2.microlifecloud.com/scanbp';
            const token = await AuthService.getValidToken(setError);
            if (!token) {throw new Error('No valid access token');}

            const url = new URL(baseUrl);
            url.searchParams.append('redirect_uri', config.redirectUrl);

            const headers = {
                Authorization: `Bearer ${token.accessToken}`,
                'Content-Type': 'application/json',
            };

            return {
                uri: url.toString(),
                headers,
            };
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Unknown error occurred during scanBP');
            }
            return null;
        }
    },
};

