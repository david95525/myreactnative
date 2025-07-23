import {BluetoothPage, ChartsDisplay, Home, ScanPage} from '@pages/index.tsx';
import type {BottomTabNavigationOptions} from '@react-navigation/bottom-tabs';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
const Tab = createBottomTabNavigator();

export function getTabScreenOptions(
  routeName: string,
): BottomTabNavigationOptions {
  return {
    tabBarIcon: ({focused, color, size}) => {
      let iconName: string;

      switch (routeName) {
        case 'Home':
          iconName = 'home';
          break;
        case 'ChartsDisplay':
          iconName = 'chart-areaspline';
          break;
        case 'BluetoothPage':
          iconName = 'bluetooth';
          break;
        case 'ScanPage':
          iconName = 'qrcode-scan';
          break;
        default:
          iconName = 'circle';
      }

      return <Icon name={iconName} size={size} color={color} />;
    },
    tabBarActiveTintColor: '#007AFF',
    tabBarInactiveTintColor: 'gray',
  };
}
export function CustomBottomTabNavigator() {
  return (
    <Tab.Navigator screenOptions={({route}) => getTabScreenOptions(route.name)}>
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="ChartsDisplay" component={ChartsDisplay} />
      <Tab.Screen name="BluetoothPage" component={BluetoothPage} />
      <Tab.Screen name="ScanPage" component={ScanPage} />
    </Tab.Navigator>
  );
}
