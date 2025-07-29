import Sidebar from '@components/Sidebar.tsx';
import {
  HealthDashboard,
  OAuth2Page,
  ScanPage,
  WebViewScreen,
} from '@pages/index.tsx';
import {
  createDrawerNavigator,
  DrawerContentComponentProps,
} from '@react-navigation/drawer';
import {createStackNavigator} from '@react-navigation/stack';
import {RootDrawerParamList, WebViewStackParamList} from '@types';
import React from 'react';
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
      <Drawer.Screen name="OAuth2Page" component={OAuth2Page} />
      <Drawer.Screen
        name="WebViewStack"
        component={WebViewStackScreen}
        options={{title: 'WebView'}}
      />
      <Drawer.Screen name="ScanPage" component={ScanPage} />
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
