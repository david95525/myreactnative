import {DrawerScreenProps} from '@react-navigation/drawer';
import {CompositeScreenProps} from '@react-navigation/native';
import {StackScreenProps} from '@react-navigation/stack';
import React, {useEffect, useState} from 'react';
import {Button, Linking, StyleSheet, Text, View} from 'react-native';
import {AuthService} from '../services/authService.ts';
import {MemberService} from '../services/memberService.ts';
import {RootDrawerParamList, WebViewStackParamList} from '../types/index.ts';
import {MemberData} from '../types/member.ts';
type OAuth2ScreenProps = CompositeScreenProps<
  DrawerScreenProps<RootDrawerParamList, 'OAuth2Login'>,
  StackScreenProps<WebViewStackParamList, 'WebViewMain'>
>;
const url =
  'https://phrdev.microlifecloud.com/scanbp?redirect_uri=myreactnative://oauth2redirect';

export const OAuth2Login = ({navigation, route}: OAuth2ScreenProps) => {
  const {sys, dia, pul} = route.params ?? {};
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
  const openURL = () => {
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        console.log('無法開啟 ' + url);
      }
    });
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>OAuth2 Authentication Example</Text>
      {loading && <Text>Loading...</Text>}
      {!loading && accessToken ? (
        accessTokenExpiry &&
        AuthService.isAccessTokenExpired(accessTokenExpiry) ? (
          <View style={styles.content}>
            <Button
              title="Refresh Token"
              onPress={loadTokens}
              disabled={loading}
            />
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
        <View style={styles.content}>
          <Button
            title="Login with OAuth2"
            onPress={handleLogin}
            disabled={loading}
          />
        </View>
      )}
      {accessToken && <Text>Access Token: {accessToken}</Text>}
      {accessTokenExpiry && (
        <Text>Expires: {new Date(accessTokenExpiry).toLocaleString()}</Text>
      )}
      {error && <Text style={styles.error}>Error: {error}</Text>}
      {state && <Text>State: {state}</Text>}
      <View style={styles.content}>
        <Button
          title="open with browser"
          onPress={openURL}
          disabled={loading}
        />
      </View>
      <View style={styles.content}>
        <Button
          title="open with webview"
          onPress={() =>
            navigation.navigate('WebViewStack', {
              screen: 'WebViewMain',
              params: {uri: url},
            })
          }
        />
        <Text>sys:{sys}</Text>
        <Text>dia:{dia}</Text>
        <Text>pul:{pul}</Text>
      </View>
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
  content: {flex: 1, alignItems: 'center'},
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
