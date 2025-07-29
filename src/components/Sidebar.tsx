import {DrawerContentComponentProps} from '@react-navigation/drawer';
import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const Sidebar = ({navigation}: DrawerContentComponentProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>
        microlife{'\n'}
        <Text style={styles.subLogo}>MultiCare System</Text>
      </Text>
      <View style={styles.menu}>
        <MenuItem
          icon="home"
          label="TabNavigator"
          onPress={() => navigation.navigate('TabNavigator')}
        />
        <MenuItem
          icon="speedometer"
          label="HealthDashboard"
          onPress={() => navigation.navigate('HealthDashboard')}
        />
        <MenuItem
          icon="login"
          label="OAuth2Login"
          onPress={() => navigation.navigate('OAuth2Login')}
        />
        <MenuItem
          icon="qrcode-scan"
          label="ScanPage"
          onPress={() => navigation.navigate('ScanPage')}
        />
      </View>
    </View>
  );
};
const MenuItem = ({icon, onPress}: any) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <Icon name={icon} size={28} color="#fff" />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0052CC',
    paddingTop: 40,
    alignItems: 'center',
  },
  logo: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subLogo: {
    fontSize: 12,
    fontWeight: '300',
  },
  menu: {
    marginTop: 50,
    width: '100%',
    alignItems: 'center',
  },
  menuItem: {
    paddingVertical: 20,
    width: '100%',
    alignItems: 'center',
  },
});

export default Sidebar;
