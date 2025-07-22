import React from 'react';
import {View} from 'react-native';
//import {ChartKit} from '../components/ChartKit';
import {ChartVictoryNative} from '../components/ChartVictoryNative';

const ChartsDisplay: React.FC = () => {
  return (
    <View>
      {/* <ChartKit /> */}
      <ChartVictoryNative />
    </View>
  );
};

export default ChartsDisplay;
