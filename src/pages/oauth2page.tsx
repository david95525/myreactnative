import AsyncStorage from '@react-native-async-storage/async-storage'; // Using AsyncStorage for token storage
import React, {useEffect, useState} from 'react';
import {Button, Linking, Text, View} from 'react-native';
const config = {
  authorizationEndpoint:
    'https://accountdev.microlifecloud.com/OAuth2/Authorize',
  tokenEndpoint: 'https://accountdev.microlifecloud.com/OAuth2/Token',
};
const auth2config = {
  issuer: '<YOUR_ISSUER_URL>',
  clientId: 'f36072a1b969496ebc3cd9b50ba769c4',
  redirectUrl: 'myapp://oauth2redirect',
  scopes: [''],
};
// --- Storage Keys ---
const ACCESS_TOKEN_KEY = 'oauth2_access_token';
const REFRESH_TOKEN_KEY = 'oauth2_refresh_token';
const ACCESS_TOKEN_EXPIRY_KEY = 'oauth2_access_token_expiry';

const getAuthorizationUrl = () => {
  const url = new URL(config.authorizationEndpoint);
  url.searchParams.append('client_id', auth2config.clientId);
  url.searchParams.append('redirect_uri', auth2config.redirectUrl);
  url.searchParams.append('response_type', 'code');
  url.searchParams.append('lang', 'en');
  url.searchParams.append('region', 'tw');
  return url.toString();
};
const OAuth2Login = () => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [accessTokenExpiry, setAccessTokenExpiry] = useState<number | null>(
    null,
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  // --- Load tokens from storage on app start ---
  useEffect(() => {
    const loadTokens = async () => {
      try {
        const storedAccessToken = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
        const storedRefreshToken = await AsyncStorage.getItem(
          REFRESH_TOKEN_KEY,
        );
        const storedAccessTokenExpiry = await AsyncStorage.getItem(
          ACCESS_TOKEN_EXPIRY_KEY,
        );

        setAccessToken(storedAccessToken);
        setRefreshToken(storedRefreshToken);
        setAccessTokenExpiry(
          storedAccessTokenExpiry
            ? parseInt(storedAccessTokenExpiry, 10)
            : null,
        );
      } catch (err: unknown) {
        if (typeof err === 'string') {
          console.error('Failed to load tokens from storage:', err);
        } else if (err instanceof Error) {
          console.error('Failed to load tokens from storage:', err.message);
        } else {
          console.error('Failed to load tokens from storage:', err);
        }
        setError('Failed to load session.');
      } finally {
        setLoading(false);
      }
    };
    loadTokens();
  }, []);
  //Handle deep linking for redirect URI
  useEffect(() => {
    //exchange authorization code for tokens
    const exchangeCodeForTokens = async (code: string) => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(config.tokenEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: auth2config.redirectUrl,
            client_id: auth2config.clientId,
            // client_secret: 'YOUR_CLIENT_SECRET',
          }).toString(),
        });

        let data = await response.json();

        if (response.ok) {
          console.log('Tokens received:', data);
          const newAccessToken = data.access_token;
          const newRefreshToken = data.refresh_token;
          const expiresIn = data.expires_in; // Time in seconds until access token expires
          // Calculate expiry time in milliseconds
          let newAccessTokenExpiry = Date.now() + expiresIn * 1000;
          // Store tokens and expiry
          await AsyncStorage.setItem(ACCESS_TOKEN_KEY, newAccessToken);
          if (newRefreshToken) {
            // Refresh token might not always be returned
            await AsyncStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
          }
          await AsyncStorage.setItem(
            ACCESS_TOKEN_EXPIRY_KEY,
            newAccessTokenExpiry.toString(),
          );

          setAccessToken(newAccessToken);
          setRefreshToken(newRefreshToken);
          setAccessTokenExpiry(newAccessTokenExpiry);
          setError(null);
          console.error('Error exchanging code for tokens:', data);
          setError(
            `Failed to get tokens: ${
              data.error_description || data.error || 'Unknown error'
            }`,
          );
          // Clear potentially invalid tokens
          await clearTokens();
        }
      } catch (err: unknown) {
        if (typeof err === 'string') {
          console.error('Network error:', err);
        } else if (err instanceof Error) {
          console.error('Network error:', err.message);
        } else {
          console.error('Network error:', err);
        }
        await clearTokens();
      } finally {
        setLoading(false);
      }
    };
    const handleDeepLink = async (event: {url: string}) => {
      const url = event.url;
      if (url && url.startsWith(auth2config.redirectUrl)) {
        try {
          const code = new URL(url).searchParams.get('code');
          if (code) {
            console.log('Authorization code received:', code);
            // 使用 code 換取 token
            await exchangeCodeForTokens(code);
          } else {
            console.error('No authorization code found in redirect URL');
            setError('Authentication failed: No code received.');
          }
        } catch (err: unknown) {
          if (typeof err === 'string') {
            console.error('Error processing deep link:', err);
          } else if (err instanceof Error) {
            console.error('Error processing deep link:', err.message);
          } else {
            console.error('Error processing deep link:', err);
          }
          setError('Authentication failed: Invalid redirect URL.');
        }
      }
    };
    // 監聽深層連結事件
    const addListener = Linking.addEventListener('url', handleDeepLink);
    // 初始啟動時檢查是否有深層連結
    Linking.getInitialURL().then(url => {
      if (url) {
        handleDeepLink({url});
      }
    });
    // 清除監聽器
    return () => {
      addListener.remove();
    };
  }, []);

  // --- Function to refresh the access token ---
  const refreshAccessToken = async () => {
    if (!refreshToken) {
      console.warn('No refresh token available.');
      setError('Cannot refresh token: No refresh token found.');
      await clearTokens(); // Clear if no refresh token exists but we tried to refresh
      return false; // Indicate failure
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(config.tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          client_id: auth2config.clientId,
          // Include client_secret if required
          // client_secret: 'YOUR_CLIENT_SECRET',
        }).toString(),
      });
      const data = await response.json();
      if (response.ok) {
        console.log('Token refreshed:', data);
        const newAccessToken = data.access_token;
        const newRefreshToken = data.refresh_token; // Provider might issue a new refresh token
        const expiresIn = data.expires_in;

        const newAccessTokenExpiry = Date.now() + expiresIn * 1000;

        // Store new tokens and expiry
        await AsyncStorage.setItem(ACCESS_TOKEN_KEY, newAccessToken);
        await AsyncStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken); // Store potentially new refresh token
        await AsyncStorage.setItem(
          ACCESS_TOKEN_EXPIRY_KEY,
          newAccessTokenExpiry.toString(),
        );

        setAccessToken(newAccessToken);
        setRefreshToken(newRefreshToken);
        setAccessTokenExpiry(newAccessTokenExpiry);
        setError(null);
        return true; // Indicate success
      } else {
        console.error('Error refreshing token:', data);
        setError(
          `Failed to refresh token: ${data.error_description || data.error}`,
        );
        // If refresh fails, the refresh token might be invalid, so clear all tokens
        await clearTokens();
        return false; // Indicate failure
      }
    } catch (err: unknown) {
      if (typeof err === 'string') {
        console.error('Network or other error during token refresh:', err);
      } else if (err instanceof Error) {
        console.error(
          'Network or other error during token refresh:',
          err.message,
        );
      } else {
        console.error('不明錯誤:', err);
      }
      setError('Network error during refresh');
      await clearTokens();
      return false; // Indicate failure
    } finally {
      setLoading(false);
    }
  };

  // --- Function to clear all tokens ---
  const clearTokens = async () => {
    try {
      await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
      await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
      await AsyncStorage.removeItem(ACCESS_TOKEN_EXPIRY_KEY);
      setAccessToken(null);
      setRefreshToken(null);
      setAccessTokenExpiry(null);
      console.log('Tokens cleared from storage.');
    } catch (err: unknown) {
      if (typeof err === 'string') {
        console.error('Failed to clear tokens from storage', err);
      } else if (err instanceof Error) {
        console.error('Failed to clear tokens from storage', err.message);
      } else {
        console.error('Failed to clear tokens from storage:', err);
      }
      setError('Failed to clear tokens from storage');
    }
  };

  // --- Check if access token is expired ---
  const isAccessTokenExpired = () => {
    if (!accessToken || !accessTokenExpiry) {
      return true; // Consider expired if no token or expiry
    }
    return Date.now() >= accessTokenExpiry;
  };

  // --- Function to get a valid access token (refreshing if necessary) ---
  const getValidAccessToken = async () => {
    if (loading) {
      console.log('Waiting for authentication process to complete...');
      // You might want to wait or return null/throw error depending on UX
      return null;
    }

    if (accessToken && !isAccessTokenExpired()) {
      console.log('Using existing valid access token.');
      return accessToken;
    }

    if (refreshToken) {
      console.log('Access token expired or missing, attempting to refresh...');
      const success = await refreshAccessToken();
      if (success) {
        return accessToken; // Return the newly set access token
      } else {
        console.warn('Failed to refresh token. User needs to re-authenticate.');
        return null;
      }
    } else {
      console.warn('No refresh token available. User needs to authenticate.');
      return null;
    }
  };
  const handleLogin = async () => {
    setError(null);
    try {
      const authUrl = getAuthorizationUrl();
      let supported = await Linking.canOpenURL(authUrl);

      if (supported) {
        await Linking.openURL(authUrl);
      } else {
        console.error(`Don't know how to open URL:${authUrl}`);
        setError('Cannot open authentication URL.');
      }
    } catch (err: unknown) {
      if (typeof err === 'string') {
        console.error('Error opening authentication URL:', err);
        setError(`Error initiating login: ${err}`);
      } else if (err instanceof Error) {
        console.error('Error opening authentication URL:', err.message);
        setError(`Error initiating login:'${err.message}`);
      } else {
        console.error('Error initiating login:', err);
        setError(`Error initiating login: ${err}`);
      }
    }
  };

  // --- Handle Logout ---
  const handleLogout = async () => {
    setLoading(true);
    await clearTokens();
    setLoading(false);
    setError(null);
    console.log('User logged out.');
    // Optionally, redirect user or update UI
  };
  // --- Render UI ---
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
      }}>
      <Text style={{fontSize: 20, marginBottom: 20}}>
        OAuth2 Authentication Example
      </Text>

      {loading && <Text>Loading...</Text>}
      {error && (
        <Text style={{color: 'red', marginBottom: 10}}>Error: {error}</Text>
      )}

      {accessToken ? (
        <View style={{alignItems: 'center'}}>
          <Text>Logged In!</Text>
          <Text>Access Token: {accessToken.substring(0, 10)}...</Text>{' '}
          {/* Show truncated token */}
          {accessTokenExpiry && (
            <Text>Expires: {new Date(accessTokenExpiry).toLocaleString()}</Text>
          )}
          <Button title="Logout" onPress={handleLogout} disabled={loading} />
          <Button
            title="Test Get Valid Token"
            onPress={async () => {
              const token = await getValidAccessToken();
              if (token) {
                console.log(
                  'Successfully got valid token:',
                  token.substring(0, 10) + '...',
                );
                // You can now use this token to make API calls
              } else {
                console.log('Could not get a valid token.');
              }
            }}
            disabled={loading}
          />
        </View>
      ) : (
        <Button
          title="Login with OAuth2"
          onPress={handleLogin}
          disabled={loading}
        />
      )}

      {!loading && accessToken && isAccessTokenExpired() && (
        <Text style={{color: 'orange', marginTop: 10}}>
          Access token expired. Attempting refresh or need re-login.
        </Text>
      )}
    </View>
  );
};

export default OAuth2Login;
