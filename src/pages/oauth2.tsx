import React, {useEffect, useState} from 'react';
import {Button, StyleSheet, Text, View} from 'react-native';
import {AuthService} from '../services/authService';
import {MemberService} from '../services/memberService';
import {MemberData} from '../types/member';
const OAuth2Login = () => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [accessTokenExpiry, setAccessTokenExpiry] = useState<string | null>(
    null,
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<string | null>(null);
  const [memberData, setMemberData] = useState<MemberData | null>(null);
  useEffect(() => {
    const loadTokens = async () => {
      const token = await AuthService.getValidToken(setError);
      if (token) {
        setAccessToken(token.accessToken);
        setAccessTokenExpiry(token.accessTokenExpirationDate);
        loadMemberData();
      }
    };
    setLoading(true);
    loadTokens();
    setLoading(false);
  }, []);
  const loadTokens = async () => {
    const token = await AuthService.getValidToken(setError);
    if (token) {
      setAccessToken(token.accessToken);
      setAccessTokenExpiry(token.accessTokenExpirationDate);
      loadMemberData();
    }
  };

  const loadMemberData = async () => {
    setError(null);
    const member = await MemberService.getBaseMemberData(setError);
    if (member) {
      setMemberData(member);
    } else {
      setState('Could not get a valid token.');
    }
  };
  const handleLogin = async () => {
    setError(null);
    const token = await AuthService.login(setError);
    if (token) {
      setAccessToken(token.accessToken);
      setAccessTokenExpiry(token.accessTokenExpirationDate);
      loadMemberData();
    }
  };
  const handleLogout = async () => {
    setLoading(true);
    const islogout = await AuthService.logout();
    if (islogout) {
      setAccessToken(null);
      setAccessTokenExpiry(null);
      setMemberData(null);
    }
    setLoading(false);
    setError(null);
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>OAuth2 Authentication Example</Text>
      {loading && <Text>Loading...</Text>}
      {!loading && accessToken ? (
        accessTokenExpiry &&
        AuthService.isAccessTokenExpired(accessTokenExpiry) ? (
          <View>
            <Button title="Refresh Token" onPress={loadTokens} disabled={loading} />
            <Text>
              Access token expired. Attempting refresh or need re-login.
            </Text>
          </View>
        ) : (
          <View style={styles.content}>
            <Button title="Logout" onPress={handleLogout} disabled={loading} />
            <Button
              title="Get MemberData"
              onPress={loadMemberData}
              disabled={loading}
            />
            {memberData && (
              <View>
                <Text style={styles.label}>姓名:</Text>
                <Text style={styles.value}>{memberData.name}</Text>
                <Text style={styles.label}>Email:</Text>
                <Text style={styles.value}>{memberData.email}</Text>
              </View>
            )}
          </View>
        )
      ) : (
        <Button
          title="Login with OAuth2"
          onPress={handleLogin}
          disabled={loading}
        />
      )}
      {accessToken && <Text>Access Token: {accessToken}</Text>}
      {accessTokenExpiry && (
        <Text>Expires: {new Date(accessTokenExpiry).toLocaleString()}</Text>
      )}
      {error && <Text style={styles.error}>Error: {error}</Text>}
      {state && <Text>State: {state}</Text>}
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
  },
  error: {color: 'red', marginBottom: 10},
  content: {alignItems: 'center'},
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    color: '#333',
  },
  value: {
    fontSize: 18,
    color: '#000',
  },
});
export default OAuth2Login;
