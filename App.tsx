import {createDrawerNavigator} from '@react-navigation/drawer';
import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Sidebar from './src/components/Sidebar';
import DataPage from './src/pages/dataPage';
import HealthDashboard from './src/pages/healthDashboard';
import Home from './src/pages/home';
import OAuth2Login from './src/pages/oauth2';
import Scan from './src/pages/scan';

const Drawer = createDrawerNavigator();

function CustomDrawerNavigator() {
  return (
    <Drawer.Navigator
      initialRouteName="Home"
      drawerContent={props => <Sidebar {...props} />}
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
      <Drawer.Screen name="Data" component={DataPage} />
      <Drawer.Screen name="Home" component={Home} />
      <Drawer.Screen name="Scan" component={Scan} />
      <Drawer.Screen name="OAuth2Login" component={OAuth2Login} />
    </Drawer.Navigator>
  );
}
function App(): React.JSX.Element {
  return (
    <NavigationContainer>
      <CustomDrawerNavigator />
    </NavigationContainer>
  );
}

export default App;
