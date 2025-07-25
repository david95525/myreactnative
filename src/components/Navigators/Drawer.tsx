import Sidebar from '@components/Sidebar.tsx';
import {
  createDrawerNavigator,
  DrawerContentComponentProps,
} from '@react-navigation/drawer';
import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import {
  HealthDashboard,
  OAuth2Login,
  WebViewScreen,
} from '../../pages/index.tsx';
import {RootDrawerParamList, WebViewStackParamList} from '../../types/index.ts';
import {CustomBottomTabNavigator} from './BottomTabs.tsx';
const Drawer = createDrawerNavigator<RootDrawerParamList>();
const WebViewStack = createStackNavigator<WebViewStackParamList>();
export function CustomDrawerNavigator() {
  const rendersidebar = (props: DrawerContentComponentProps) => {
    return <Sidebar {...props} />;
  };
  return (
    <Drawer.Navigator
      drawerContent={rendersidebar}
      initialRouteName="TabNavigator"
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
      <Drawer.Screen name="TabNavigator" component={CustomBottomTabNavigator} />
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
