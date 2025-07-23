import React, {useEffect, useRef, useState} from 'react';
import {
  Button,
  FlatList,
  PermissionsAndroid,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {BleManager, Device} from 'react-native-ble-plx';
import {BpmBleService} from '../services/BpmBleService';

export const BluetoothPage = () => {
  const bleManagerRef = useRef(new BleManager());
  const [devices, setDevices] = useState<Device[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [deviceTime, setDeviceTime] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [statusMsg, setstatusMsg] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const bpmServiceRef = useRef<BpmBleService | null>(null);
  const seenDeviceIdsRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    bpmServiceRef.current = new BpmBleService(bleManagerRef.current);
    requestPermissions();
    return () => {
      bleManagerRef.current.destroy();
    };
  }, []);

  const requestPermissions = async () => {
    if (Platform.OS === 'android' && Platform.Version >= 31) {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]);
    } else if (Platform.OS === 'android') {
      await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
    }
  };

  const scanDevices = () => {
    if (isScanning) return;
    setIsScanning(true);
    setstatusMsg('掃描中');
    setDevices([]);
    setErrorMsg(null);
    seenDeviceIdsRef.current.clear();
    bleManagerRef.current.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.error('掃描錯誤:', error);
        setErrorMsg(`掃描錯誤: ${error.message}`);
        setIsScanning(false);
        return;
      }
      if (device?.name && !seenDeviceIdsRef.current.has(device.id)) {
        seenDeviceIdsRef.current.add(device.id);
        setDevices(prev => [...prev, device]);
      }
    });
    setTimeout(() => {
      bleManagerRef.current.stopDeviceScan();
      setstatusMsg('掃描結束');
      setIsScanning(false);
    }, 5000);
  };
  const scanForSpecificDevice = (targetDeviceId: string, timeout = 5000) => {
    if (isScanning) return;
    setIsScanning(true);
    setstatusMsg(`掃描中，尋找裝置 ${targetDeviceId}`);
    setDevices([]);
    setErrorMsg(null);
    seenDeviceIdsRef.current.clear();

    let found = false;
    const timer = setTimeout(() => {
      if (!found) {
        bleManagerRef.current.stopDeviceScan();
        setstatusMsg(`超時，未找到裝置 ${targetDeviceId}`);
        setIsScanning(false);
      }
    }, timeout);

    bleManagerRef.current.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.error('掃描錯誤:', error);
        setErrorMsg(`掃描錯誤: ${error.message}`);
        clearTimeout(timer);
        setIsScanning(false);
        return;
      }
      if (device?.id === targetDeviceId) {
        found = true;
        clearTimeout(timer);
        bleManagerRef.current.stopDeviceScan();
        setstatusMsg(`找到目標裝置 ${device.name || device.id}`);
        setDevices([device]); // 只顯示找到的裝置
        setIsScanning(false);
      }
    });
  };
  const connectAndSend = async (device: Device) => {
    try {
      setstatusMsg(`連結裝置 ${device.name} 開始`);
      await bpmServiceRef.current?.connect(device.id);
      setConnectedDevice(device);
      bpmServiceRef.current?.subscribeToResponse(bytes => {
        console.log('收到回傳資料:', bytes);
        setstatusMsg(`收到回傳資料: ${bytes}`);
        if (bytes.length === 13 && bytes[4] === 0x0c) {
          const ready = bytes[5];
          if (ready === 1) {
            const year = 2000 + bytes[6];
            const month = bytes[7];
            const day = bytes[8];
            const hour = bytes[9];
            const minute = bytes[10];
            const second = bytes[11];
            const str = `${year}-${pad(month)}-${pad(day)} ${pad(hour)}:${pad(minute)}:${pad(second)}`;
            setDeviceTime(str);
          } else {
            setDeviceTime('尚未設定時間');
          }
        }
      });
      setstatusMsg(`已連線到裝置：${device.name}`);
      await bpmServiceRef.current?.readHistory(); // 預設執行
    } catch (err) {
      console.error('連線失敗:', err);
      setErrorMsg(
        `連線失敗: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  };
  const disconnectDevice = async () => {
    try {
      await bpmServiceRef.current?.disconnect();
      setConnectedDevice(null);
      setDeviceTime(null);
      setstatusMsg('已斷線');
    } catch (err) {
      console.error('斷線失敗:', err);
      setErrorMsg(
        `斷線失敗: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  };
  const pad = (n: number): string => (n < 10 ? `0${n}` : `${n}`);

  return (
    <View style={{flex: 1, padding: 20}}>
      {!connectedDevice && (
        <>
          <Button
            title={isScanning ? '掃描中...' : '🔍 掃描全部藍牙裝置'}
            onPress={scanDevices}
            disabled={isScanning}
          />
          <Button
            title={isScanning ? '掃描中...' : '🔍 掃描特定藍牙裝置'}
            onPress={() => scanForSpecificDevice('48:23:35:47:EA:04')}
            disabled={isScanning}
          />
          <FlatList
            data={devices}
            keyExtractor={item => item.id}
            renderItem={({item}) => (
              <TouchableOpacity
                style={{padding: 10, borderBottomWidth: 1}}
                onPress={() => connectAndSend(item)}>
                <Text>{item.name || '未命名裝置'}</Text>
                <Text style={{fontSize: 12, color: 'gray'}}>{item.id}</Text>
              </TouchableOpacity>
            )}
          />
        </>
      )}
      {connectedDevice && (
        <View style={{marginTop: 20}}>
          <Text>✅ 已連線：{connectedDevice.name}</Text>
          <Button
            title="📥 讀取裝置時間（CMD 0x0C）"
            onPress={() => bpmServiceRef.current?.readDeviceTime()}
          />
          <Button
            title="📤 寫入目前時間（CMD 0x0D）"
            onPress={() => bpmServiceRef.current?.writeDeviceTimeNow()}
          />
          {deviceTime && (
            <Text style={{marginTop: 10}}>🕒 裝置時間：{deviceTime}</Text>
          )}
          <Button title="❌ 斷線" color="red" onPress={disconnectDevice} />
        </View>
      )}
      {statusMsg && (
        <View
          style={{
            position: 'absolute',
            bottom: 10,
            left: 10,
            right: 10,
            backgroundColor: '#fee',
            padding: 10,
            borderRadius: 5,
          }}>
          <Text style={{color: 'red', fontWeight: 'bold'}}>狀態訊息</Text>
          <Text style={{color: '#333', fontSize: 12}}>{statusMsg}</Text>
        </View>
      )}
      {errorMsg && (
        <View
          style={{
            position: 'absolute',
            bottom: 10,
            left: 10,
            right: 10,
            backgroundColor: '#fee',
            padding: 10,
            borderRadius: 5,
          }}>
          <Text style={{color: 'red', fontWeight: 'bold'}}>⚠️ 錯誤訊息</Text>
          <Text style={{color: '#333', fontSize: 12}}>{errorMsg}</Text>
        </View>
      )}
    </View>
  );
};
