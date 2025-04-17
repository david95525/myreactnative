// HealthDashboard.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useState} from 'react';
import {ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';

export default function HealthDashboard() {
  const [data, setData] = useState({
    name: 'Bianca Beasley',
    age: '83',
    gender: 'MALE',
    heightFeet: '6',
    heightInches: '1',
    weight: '157.9',
    temperature: '',
    bpSystolic: '130',
    bpDiastolic: '84',
    pulse: '88',
    spo2: '98',
    pulse2: '86',
    respiratoryRate: '',
    glucose: '',
    painLevel: '8',
  });

  const handleChange = (key: keyof typeof data, value: string) => {
    setData({ ...data, [key]: value });
  };

  const saveData = async () => {
    try {
      await AsyncStorage.setItem('@healthData', JSON.stringify(data));
      alert('Saved!');
    } catch (e) {
      alert('Failed to save.');
    }
  };

  const loadData = async () => {
    try {
      const saved = await AsyncStorage.getItem('@healthData');
      if (saved) {setData(JSON.parse(saved));}
      else {alert('No saved data.');}
    } catch (e) {
      alert('Failed to load.');
    }
  };

  const InfoCard = ({ label, value, unit, onChange }: { label: string; value: string; unit?: string; onChange: (val: string) => void }) => (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <TextInput style={styles.valueInput} value={value} onChangeText={onChange} keyboardType="numeric" />
      {unit && <Text style={styles.unit}>{unit}</Text>}
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Resident Header */}
      <View style={styles.headerCard}>
        <View style={styles.avatar} />
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{data.name}</Text>
          <Text style={styles.info}>Age: {data.age}</Text>
          <Text style={styles.info}>{data.gender}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.subInfo}>Height</Text>
          <Text>{data.heightFeet} ft {data.heightInches} in</Text>
          <Text style={styles.subInfo}>Weight</Text>
          <Text>{data.weight} lb</Text>
        </View>
      </View>

      {/* Card Sections */}
      <View style={styles.row}>
        <InfoCard label="Body Temperature" value={data.temperature} unit="°F" onChange={(v) => handleChange('temperature', v)} />
        <InfoCard label="Blood Pressure" value={`${data.bpSystolic} / ${data.bpDiastolic}`} unit="mmHg" onChange={() => {}} />
        <InfoCard label="Pulse" value={data.pulse} unit="bpm" onChange={(v) => handleChange('pulse', v)} />
      </View>

      <View style={styles.row}>
        <InfoCard label="SpO2" value={data.spo2} unit="%" onChange={(v) => handleChange('spo2', v)} />
        <InfoCard label="Pulse" value={data.pulse2} unit="bpm" onChange={(v) => handleChange('pulse2', v)} />
        <InfoCard label="Respiratory Rate" value={data.respiratoryRate} unit="Breaths/min" onChange={(v) => handleChange('respiratoryRate', v)} />
        <InfoCard label="Blood Glucose" value={data.glucose} unit="mg/dL" onChange={(v) => handleChange('glucose', v)} />
      </View>

      {/* Pain Level */}
      <View style={styles.card}>
        <Text style={styles.label}>Pain Level</Text>
        <TextInput
          style={styles.valueInput}
          value={data.painLevel}
          onChangeText={(v) => handleChange('painLevel', v)}
          keyboardType="numeric"
        />
      </View>

      {/* Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.button} onPress={saveData}>
          <Text style={styles.buttonText}>Save</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, { backgroundColor: '#888' }]} onPress={loadData}>
          <Text style={styles.buttonText}>Load</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 10 },
  headerCard: {
    backgroundColor: '#dceeff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    backgroundColor: '#aaa',
    borderRadius: 30,
    marginRight: 15,
  },
  name: { fontSize: 18, fontWeight: 'bold' },
  info: { fontSize: 14, color: '#333' },
  subInfo: { fontSize: 12, color: '#666' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    margin: 5,
    flex: 1,
    alignItems: 'center',
    elevation: 2,
  },
  label: { fontSize: 14, color: '#555' },
  valueInput: {
    fontSize: 20,
    fontWeight: 'bold',
    borderBottomWidth: 1,
    borderColor: '#ccc',
    minWidth: 60,
    textAlign: 'center',
  },
  unit: { fontSize: 12, color: '#999', marginTop: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  buttonRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  button: {
    backgroundColor: '#0066cc',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginHorizontal: 10,
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});
