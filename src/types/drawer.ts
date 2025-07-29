import {NavigatorScreenParams} from '@react-navigation/native';
export type OAuth2Params = Record<string, string>;
export type WebViewStackParamList = {
    WebViewMain: {uri: string}; // WebView 堆疊中的主畫面
};
export type RootDrawerParamList = {
    HealthDashboard: undefined;
    TabNavigator: undefined;
    OAuth2Page: OAuth2Params | undefined;
    ScanPage: undefined;
    WebViewStack: NavigatorScreenParams<WebViewStackParamList>;
};