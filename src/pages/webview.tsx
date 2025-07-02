// WebViewScreen.tsx
import {DrawerNavigationProp} from '@react-navigation/drawer';
import type {NavigatorScreenParams} from '@react-navigation/native';
import {StackScreenProps} from '@react-navigation/stack';
import React, {useRef, useState} from 'react';
import {
  Alert,
  Button,
  Linking,
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
} from 'react-native';
import {WebView, WebViewMessageEvent} from 'react-native-webview';
import type {OnShouldStartLoadWithRequest} from 'react-native-webview/lib/WebViewTypes';
import {RootDrawerParamList, WebViewStackParamList} from '../../App';
type WebViewScreenProps = StackScreenProps<
  WebViewStackParamList,
  'WebViewMain'
>;
type DrawerRouteWithoutParams = {
  [K in keyof RootDrawerParamList]: undefined extends RootDrawerParamList[K]
    ? K
    : never;
}[keyof RootDrawerParamList];
const deepLinkToRouteMap: Record<string, keyof RootDrawerParamList> = {
  health: 'HealthDashboard',
  home: 'Home',
  scan: 'Scan',
  oauth2redirect: 'OAuth2Login',
  webview: 'WebViewStack',
};
function WebViewScreen({route, navigation}: WebViewScreenProps) {
  const [sys, setSys] = useState('');
  const [dia, setDia] = useState('');
  const [pul, setPul] = useState('');
  const [Req, setreq] = useState('');
  const [cameraReady, setCameraReady] = useState(false);
  const {uri} = route.params;
  React.useEffect(() => {
    ensureCameraAndMic();
  }, [navigation]);
  const webviewRef = useRef<WebView>(null);
  const handleMessage = (e: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(e.nativeEvent.data);
      setSys(data.sys);
      setDia(data.dia);
      setPul(data.pul);
    } catch (err) {
      console.warn('Invalid JSON from WebView', err);
    }
  };
  const sendToWeb = (text: string) => {
    webviewRef.current?.injectJavaScript(`
    (function() {
      if (window.onRNMessage) {
        window.onRNMessage(${JSON.stringify(text)});
      }
    })();
  `);
  };
  const ensureCameraAndMic = async () => {
    if (Platform.OS !== 'android') {
      return;
    }
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      setCameraReady(true);
    } else {
      Alert.alert(
        '需要相機權限',
        '請允許相機權限才能使用掃描功能',
        [
          {
            text: '去設定',
            onPress: () =>
              Linking.openSettings().catch(() => Alert.alert('無法開啟設定')),
          },
        ],
        {cancelable: false},
      );
    }
  };
  const handleShouldStart: OnShouldStartLoadWithRequest = req => {
    if (req.url.startsWith('https://phrdev.microlifecloud.com/redirect')) {
      try {
        const routeName = deepLinkToRouteMap.oauth2redirect;
        const parentNav =
          navigation.getParent<DrawerNavigationProp<RootDrawerParamList>>();
        if (!parentNav) {
          return false;
        }
        setreq(`${routeName as DrawerRouteWithoutParams}`);
        if (routeName === 'WebViewStack') {
          parentNav.navigate('WebViewStack', {
            screen: 'WebViewMain',
            params: {uri: '.'},
          } satisfies NavigatorScreenParams<WebViewStackParamList>);
        } else {
          parentNav.navigate(routeName as DrawerRouteWithoutParams);
        }
        return false;
      } catch (err) {
        console.error('URL 解析錯誤:', err);
        return false;
      }
    }
    return true;
  };
  return (
    <SafeAreaView style={styles.container}>
      <Button title="sendToWeb" onPress={() => sendToWeb('Hello from RN')} />
      <Text>sys:{sys}</Text>
      <Text>dia:{dia}</Text>
      <Text>pul:{pul}</Text>
      <Text>{Req}</Text>
      {!cameraReady ? (
        <Text>準備相機中…</Text>
      ) : (
        <WebView
          ref={webviewRef}
          source={{uri: uri}}
          style={styles.webview}
          onLoadStart={() => console.log('WebView 開始載入...')}
          onLoadEnd={() => console.log('WebView 載入完成。')}
          onError={syntheticEvent => {
            const {nativeEvent} = syntheticEvent;
            console.warn('WebView 錯誤: ', nativeEvent);
          }}
          javaScriptEnabled
          onMessage={handleMessage}
          mediaPlaybackRequiresUserAction={false}
          mediaCapturePermissionGrantType="grantIfSameHostElsePrompt"
          allowsInlineMediaPlayback
          onShouldStartLoadWithRequest={req => handleShouldStart(req)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
});

export default WebViewScreen;
