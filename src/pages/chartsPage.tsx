import React from 'react';
import {View} from 'react-native';
//import {ChartKit} from '@components/ChartKit';
import {ChartVictoryNative} from '@components/ChartVictoryNative';

export const ChartsDisplayPage = () => {
  return (
    <View>
      {/* <ChartKit /> */}
      <ChartVictoryNative />
    </View>
  );
};
