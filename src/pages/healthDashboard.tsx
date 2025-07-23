import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useState} from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import PainLevelSelector from '../components/painlevelselector';

export const HealthDashboard = () => {
  const {width, height} = useWindowDimensions();
  const isLandscape = width > height;

  const [data, setData] = useState({
    name: 'Bianca Beasley',
    age: '83',
    gender: 'MALE',
    heightFt: '6',
    heightIn: '1',
    weight: '157.9',
    temperature: '98.6',
    bpSystolic: '130',
    bpDiastolic: '84',
    pulse: '88',
    spo2: '98',
    pulse2: '86',
    respiratoryRate: '',
    glucose: '',
    painLevel: 8,
  });

  const handleChange = (key: string, value: string | number) => {
    setData(prev => ({...prev, [key]: value}));
  };

  const saveData = async () => {
    try {
      await AsyncStorage.setItem('healthData', JSON.stringify(data));
      Alert.alert('Saved!');
    } catch (e) {
      console.error('Save failed', e);
    }
  };

  const loadData = async () => {
    try {
      const stored = await AsyncStorage.getItem('healthData');
      if (stored) {
        setData(JSON.parse(stored));
      } else {
        Alert.alert('No saved data.');
      }
    } catch (e) {
      console.error('Load failed', e);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.cardHeader}>
        <View style={styles.basic}>
          <Text style={styles.name}>{data.name}</Text>
          <Text style={styles.info}>
            Age: {data.age} | {data.gender}
          </Text>
        </View>
        <View style={styles.height}>
          <Text style={styles.label}>Height</Text>
          <TextInput
            value={data.heightFt}
            keyboardType="numeric"
            style={styles.inlineInput}
            onChangeText={v => handleChange('heightFt', v)}
          />
          <Text>ft</Text>
          <TextInput
            value={data.heightIn}
            keyboardType="numeric"
            style={styles.inlineInput}
            onChangeText={v => handleChange('heightIn', v)}
          />
          <Text>inch</Text>
        </View>
        <View style={styles.weight}>
          <Text style={styles.label}>Weight</Text>
          <TextInput
            value={data.weight}
            keyboardType="numeric"
            style={styles.inlineInput}
            onChangeText={v => handleChange('weight', v)}
          />
          <Text>lb</Text>
        </View>
      </View>
      <View style={[styles.cardGrid, isLandscape && styles.cardGridLandscape]}>
        <View style={styles.card}>
          <Text>Body Temperature</Text>
          <TextInput
            style={styles.valueInput}
            value={data.temperature}
            onChangeText={v => handleChange('temperature', v)}
            keyboardType="numeric"
          />{' '}
          <Text>°F</Text>
        </View>
        <View style={styles.bpmcard}>
          <View>
            <Text>Blood Pressure</Text>
            <TextInput
              style={styles.valueInput}
              value={data.bpSystolic}
              onChangeText={v => handleChange('bpSystolic', v)}
              keyboardType="numeric"
            />
            <Text>/</Text>
            <TextInput
              style={styles.valueInput}
              value={data.bpDiastolic}
              onChangeText={v => handleChange('bpDiastolic', v)}
              keyboardType="numeric"
            />
          </View>
          <Text>mmHg</Text>
          <Text>Pulse</Text>
          <TextInput
            style={styles.valueInput}
            value={data.pulse}
            onChangeText={v => handleChange('pulse', v)}
            keyboardType="numeric"
          />
          <Text>bpm</Text>
        </View>
        <View style={styles.card}>
          <Text>SpO2</Text>
          <TextInput
            style={styles.valueInput}
            value={data.spo2}
            onChangeText={v => handleChange('spo2', v)}
            keyboardType="numeric"
          />
          <Text>%</Text>
          <Text>Pulse</Text>
          <TextInput
            style={styles.valueInput}
            value={data.pulse2}
            onChangeText={v => handleChange('pulse2', v)}
            keyboardType="numeric"
          />
          <Text>bpm</Text>
        </View>
        <View style={styles.card}>
          <Text>Resiratory Rate</Text>
          <TextInput
            style={styles.valueInput}
            value={data.respiratoryRate}
            onChangeText={v => handleChange('respiratoryRate', v)}
            keyboardType="numeric"
          />
          <Text>Breaths/min</Text>
        </View>
        <View style={styles.card}>
          <Text>Blood Glucose</Text>
          <TextInput
            style={styles.valueInput}
            value={data.glucose}
            onChangeText={v => handleChange('glucose', v)}
            keyboardType="numeric"
          />
          <Text>mg/dL</Text>
        </View>
      </View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
        }}>
        <View style={{flex: 1}}>
          <PainLevelSelector value={data.painLevel} onChange={handleChange} />
        </View>
        <TouchableOpacity style={styles.saveButton} onPress={saveData}>
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton} onPress={loadData}>
          <Text style={styles.saveText}>Load</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {padding: 10},
  cardHeader: {
    flexDirection: 'row',
    backgroundColor: '#e3f2fd',
    padding: 10,
  },
  name: {fontSize: 20, fontWeight: 'bold'},
  info: {fontSize: 14, color: '#333'},
  basic: {flexDirection: 'column', width: '70%'},
  height: {flexDirection: 'column', flexWrap: 'wrap', width: '10%'},
  weight: {flexDirection: 'column', flexWrap: 'wrap'},
  label: {fontWeight: 'bold', marginTop: 4},
  inlineInput: {
    borderBottomWidth: 1,
    minWidth: 30,
    textAlign: 'center',
    marginHorizontal: 2,
  },
  cardGrid: {flexDirection: 'column', flexWrap: 'wrap'},
  cardGridLandscape: {flexDirection: 'row'},
  card: {
    backgroundColor: '#fff',
    padding: 10,
    margin: 5,
    borderRadius: 12,
    shadowColor: '#ccc',
    shadowOffset: {width: 1, height: 1},
    shadowOpacity: 0.5,
    width: '30%',
  },
  bpmcard: {
    backgroundColor: '#fff',
    padding: 10,
    margin: 5,
    borderRadius: 12,
    shadowColor: '#ccc',
    shadowOffset: {width: 1, height: 1},
    shadowOpacity: 0.5,
    width: '65%',
  },
  valueInput: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    borderBottomWidth: 1,
    marginVertical: 5,
  },

  saveButton: {
    backgroundColor: '#0033A0',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginLeft: 16,
  },
  saveText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
