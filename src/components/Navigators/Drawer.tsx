import Sidebar from '@components/Sidebar.tsx';
import {
  createDrawerNavigator,
  DrawerContentComponentProps,
} from '@react-navigation/drawer';
import {NavigatorScreenParams} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import {
  HealthDashboard,
  OAuth2Login,
  WebViewScreen,
} from '../../pages/index.tsx';
export type OAuth2Params = Record<string, string>;
export type WebViewStackParamList = {
  WebViewMain: {uri: string}; // WebView 堆疊中的主畫面
};
export type RootDrawerParamList = {
  HealthDashboard: undefined;
  OAuth2Login: OAuth2Params | undefined;
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
export function CustomDrawerNavigator() {
  const rendersidebar = (props: DrawerContentComponentProps) => {
    return <Sidebar {...props} />;
  };
  return (
    <Drawer.Navigator
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
      <Drawer.Screen name="OAuth2Login" component={OAuth2Login} />
      <Drawer.Screen
        name="WebViewStack"
        component={WebViewStackScreen}
        options={{title: 'WebView'}}
      />
    </Drawer.Navigator>
  );
}
