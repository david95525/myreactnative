import {
  BlePage,
  ChartsDisplayPage,
  ECGPage,
  HomePage,
  PdfPage,
} from '@pages/index.tsx';
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
        case 'Ble':
          iconName = 'bluetooth';
          break;
        case 'Pdf':
          iconName = 'file-pdf-box';
          break;
        case 'ECG':
          iconName = 'heart-pulse';
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
      <Tab.Screen name="Home" component={HomePage} />
      <Tab.Screen name="ChartsDisplay" component={ChartsDisplayPage} />
      <Tab.Screen name="Ble" component={BlePage} />
      <Tab.Screen name="Pdf" component={PdfPage} />
      <Tab.Screen name="ECG" component={ECGPage} />
    </Tab.Navigator>
  );
}
