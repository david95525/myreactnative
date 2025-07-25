import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import {CustomDrawerNavigator} from './Drawer';
export function Navigation() {
  const linking = {
    prefixes: ['myreactnative://'],
    config: {
      screens: {
        HealthDashboard: 'health',
        Scan: 'scan',
        OAuth2Login: 'oauth2redirect',
      },
    },
  };
  return (
    <NavigationContainer linking={linking}>
      <CustomDrawerNavigator />
    </NavigationContainer>
  );
}
