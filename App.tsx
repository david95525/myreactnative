import {createDrawerNavigator} from '@react-navigation/drawer';
import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Sidebar from './src/components/Sidebar';
import DataPage from './src/pages/dataPage';
import HealthDashboard from './src/pages/healthDashboard';
import Home from './src/pages/home';
import Scan from './src/pages/scan';

const Drawer = createDrawerNavigator();

function App(): React.JSX.Element {
  return (
    <NavigationContainer>
      <Drawer.Navigator
        drawerContent={props => <Sidebar {...props} />}
        screenOptions={{
          headerShown: false,
          drawerType: 'permanent', // 固定不收起
          drawerStyle: {
            width: 200, // sidebar 寬度，可自訂
            backgroundColor: '#0052CC',
          },
        }}>
        <Drawer.Screen
          name="HealthDashboard"
          component={HealthDashboard}
        />
        <Drawer.Screen name="Data" component={DataPage} />
        <Drawer.Screen name="Home" component={Home} />
        <Drawer.Screen name="Scan" component={Scan} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}

export default App;
