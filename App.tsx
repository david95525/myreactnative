import {
  createDrawerNavigator,
  DrawerContentComponentProps,
} from '@react-navigation/drawer';
import {
  NavigationContainer,
  NavigatorScreenParams,
} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import Sidebar from './src/components/Sidebar.tsx';
import ChartsDisplay from './src/pages/ChartsDisplay';
import HealthDashboard from './src/pages/healthDashboard';
import Home from './src/pages/home';
import OAuth2Login from './src/pages/oauth2';
import Scan from './src/pages/scan';
import WebViewScreen from './src/pages/webview';

export type OAuth2Params = Record<string, string>;
export type WebViewStackParamList = {
  WebViewMain: {uri: string}; // WebView 堆疊中的主畫面
};
export type RootDrawerParamList = {
  HealthDashboard: undefined;
  Home: undefined;
  Scan: undefined;
  OAuth2Login: OAuth2Params | undefined;
  ChartsDisplay: undefined;
  WebViewStack: NavigatorScreenParams<WebViewStackParamList>;
};
const Drawer = createDrawerNavigator<RootDrawerParamList>();
const WebViewStack = createStackNavigator<WebViewStackParamList>();
function WebViewStackScreen() {
  return (
    <WebViewStack.Navigator initialRouteName="WebViewMain">
      <WebViewStack.Screen
        name="WebViewMain"
        component={WebViewScreen}
        options={{headerShown: false}}
      />
    </WebViewStack.Navigator>
  );
}

function CustomDrawerNavigator() {
  const rendersidebar = (props: DrawerContentComponentProps) => {
    return <Sidebar {...props} />;
  };
  return (
    <Drawer.Navigator
      initialRouteName="Home"
      drawerContent={rendersidebar}
      screenOptions={({route}) => {
        const isHealthDashboard = route.name === 'HealthDashboard';
        return {
          headerShown: true,
          drawerType: isHealthDashboard ? 'permanent' : 'front',
          drawerStyle: {
            width: 200,
            backgroundColor: '#0052CC',
          },
        };
      }}>
      <Drawer.Screen name="HealthDashboard" component={HealthDashboard} />
      <Drawer.Screen name="Home" component={Home} />
      <Drawer.Screen name="Scan" component={Scan} />
      <Drawer.Screen name="OAuth2Login" component={OAuth2Login} />
      <Drawer.Screen name="ChartsDisplay" component={ChartsDisplay} />
      <Drawer.Screen
        name="WebViewStack"
        component={WebViewStackScreen}
        options={{title: 'WebView'}}
      />
    </Drawer.Navigator>
  );
}
const linking = {
  prefixes: ['myreactnative://'],
  config: {
    screens: {
      HealthDashboard: 'health',
      Home: 'home',
      Scan: 'scan',
      OAuth2Login: 'oauth2redirect',
    },
  },
};
function App(): React.JSX.Element {
  return (
    <NavigationContainer linking={linking}>
      <CustomDrawerNavigator />
    </NavigationContainer>
  );
}

export default App;
