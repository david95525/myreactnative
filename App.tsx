import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Icon from 'react-native-vector-icons/FontAwesome';
import TabBar from './src/components/tabbar';
import Home from './src/pages/home';
import ProfileScreen from './src/pages/profilescreen';
import Scan from './src/pages/scan';
const Tab = createBottomTabNavigator();
function App(): React.JSX.Element {
  return (
    <NavigationContainer>
      <Tab.Navigator
        tabBar={props => <TabBar {...props} />}
        screenOptions={{tabBarActiveTintColor: 'red'}}>
        <Tab.Screen
          name="Home"
          component={Home}
          options={{
            tabBarIcon: ({color, size}) => (
              <Icon name="home" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen name="Profile" component={ProfileScreen} />
        <Tab.Screen name="Scan" component={Scan} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default App;
