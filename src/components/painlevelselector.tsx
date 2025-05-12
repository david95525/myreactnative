import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';

type Props = {
  value: number;
  onChange: (key: string, val: number) => void;
};

const PainLevelSelector: React.FC<Props> = ({value, onChange}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Pain Level</Text>
      <View style={styles.levelRow}>
        {Array.from({length: 11}).map((_, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => onChange('painLevel', i)}
            style={[styles.levelBox, value === i && styles.selectedBox]}>
            <Text>{i}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.painEmojiRow}>
        <Text style={styles.emoji}>😄</Text>
        <Text style={styles.emoji}>😐</Text>
        <Text style={styles.emoji}>😢</Text>
      </View>
    </View>
  );
};

export default PainLevelSelector;

const styles = StyleSheet.create({
  container: { marginVertical: 10, width: '50%'},
  label: {fontWeight: 'bold', fontSize: 16, marginBottom: 8},
  levelRow: {flexDirection: 'row', flexWrap: 'wrap'},
  levelBox: {
    width: 30,
    height: 30,
    margin: 4,
    borderRadius: 4,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedBox: {
    backgroundColor: '#f43f5e',
  },
  emoji: {
    width: 40,
    height: 40,
    marginTop: 8,
  },
  painEmojiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
});
