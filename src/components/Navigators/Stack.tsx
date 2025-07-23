import {createStackNavigator} from '@react-navigation/stack';
import {CustomBottomTabNavigator} from './BottomTabs.tsx';
import {CustomDrawerNavigator} from './Drawer.tsx';
const Stack = createStackNavigator();

export function HomeStackNavigator() {
  return (
    <Stack.Navigator initialRouteName="CustomBottomTabNavigator">
      <Stack.Screen
        name="CustomBottomTabNavigator"
        component={CustomBottomTabNavigator}
      />
      <Stack.Screen name="OAuth2Login" component={CustomDrawerNavigator} />
    </Stack.Navigator>
  );
}
