import {BleConstants} from '@constants/bleConstants.ts';
import {BpmBleService} from '@services/bpmBleService.ts';
import {DRecord} from '@types';
import {eventBus} from '@utils/eventBus';
import React, {useEffect, useRef, useState} from 'react';
import {
  Button,
  FlatList,
  PermissionsAndroid,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {BleManager, Device} from 'react-native-ble-plx';
export const BlePage = () => {
  const bleManagerRef = useRef(new BleManager());
  const [devices, setDevices] = useState<Device[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  //date
  const [deviceTime, setDeviceTime] = useState<string | null>(null);
  const [historyList, setHistoryList] = useState<DRecord[]>([]);
  //msg
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [statusMsg, setstatusMsg] = useState<string | null>(null);
  const [debugMsg, setDebugMsg] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const bpmServiceRef = useRef<BpmBleService | null>(null);
  const seenDeviceIdsRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    bpmServiceRef.current = new BpmBleService(bleManagerRef.current);

    const onError = (msg: string) => setErrorMsg(msg);
    eventBus.on('bleError', onError);
    const onDebug = (msg: string) => setDebugMsg(msg);
    eventBus.on('bleDebug', onDebug);
    const onDisconnect = () => {
      setConnectedDevice(null);
      setDeviceTime(null);
      setDevices([]);
      setstatusMsg('已斷線');
    };
    eventBus.on('bleDisconnect', onDisconnect);
    return () => {
      bleManagerRef.current.destroy();
      eventBus.off('bleError', onError);
      eventBus.off('bleDebug', onDebug);
      eventBus.off('bleDisconnect', onDisconnect);
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

  const scanDevices = (targetDeviceId?: string) => {
    requestPermissions();
    if (isScanning) return;

    setIsScanning(true);
    setstatusMsg(
      targetDeviceId ? `掃描中，尋找裝置 ${targetDeviceId}` : '掃描中',
    );
    setDevices([]);
    setErrorMsg(null);
    seenDeviceIdsRef.current.clear();

    let found = false;
    const timer = setTimeout(() => {
      if (!found) {
        bleManagerRef.current.stopDeviceScan();
        setstatusMsg(
          targetDeviceId ? `超時，未找到裝置 ${targetDeviceId}` : '掃描結束',
        );
        setIsScanning(false);
      }
    }, BleConstants.RESPONSE_TIMEOUT);

    bleManagerRef.current.startDeviceScan(null, null, (error, device) => {
      if (error) {
        setErrorMsg(`掃描錯誤: ${error.message}`);
        clearTimeout(timer);
        setIsScanning(false);
        return;
      }

      if (!device?.id) return;

      // 若有指定目標裝置 ID，則只處理該裝置
      if (targetDeviceId) {
        if (device.id === targetDeviceId) {
          found = true;
          clearTimeout(timer);
          bleManagerRef.current.stopDeviceScan();
          setstatusMsg(`找到目標裝置 ${device.name || device.id}`);
          setDevices([device]);
          setIsScanning(false);
        }
      } else {
        // 無目標裝置，列出所有未見過的裝置
        if (device.name && !seenDeviceIdsRef.current.has(device.id)) {
          seenDeviceIdsRef.current.add(device.id);
          setDevices(prev => [...prev, device]);
        }
      }
    });
  };

  const connectAndSend = async (device: Device) => {
    try {
      setstatusMsg(`連結裝置 ${device.name} 開始`);
      await bpmServiceRef.current?.connect(device.id);
      setConnectedDevice(device);
      setstatusMsg(`已連線到裝置：${device.name}`);
      // 設定 callback
      bpmServiceRef.current!.onTimeReceived = str => {
        setDeviceTime(str);
      };
      bpmServiceRef.current!.onHistoryReceived = records => {
        setHistoryList(records);
      };
      //監聽 Notify
      bpmServiceRef.current?.subscribeToResponse();
      await bpmServiceRef.current?.readHistory();
    } catch (err) {
      setErrorMsg(
        `連線失敗: ${err instanceof Error ? err.message : String(err)}`,
      );
      setDevices([]);
    }
  };
  const disconnectDevice = async () => {
    await bpmServiceRef.current?.disconnectSafely();
  };
  const renderMode = (mode: DRecord['mode']) => {
    switch (mode) {
      case 'Single':
        return '單次測量';
      case 'Single_AFib':
        return '單次測量 + AFib';
      case 'MAM':
        return 'MAM 三次測量';
      case 'MAM_AFib':
        return 'MAM + AFib';
      default:
        return mode;
    }
  };
  return (
    <View style={{flex: 1, padding: 20}}>
      {!connectedDevice && (
        <View style={{marginTop: 65}}>
          <Button
            title={isScanning ? '掃描中...' : '🔍 掃描全部藍牙裝置'}
            onPress={() => scanDevices()}
            disabled={isScanning}
          />
          <Button
            title={isScanning ? '掃描中...' : '🔍 掃描特定藍牙裝置'}
            onPress={() => scanDevices(BleConstants.DEVICE_ID)}
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
        </View>
      )}
      {connectedDevice && (
        <View style={{marginTop: 65}}>
          <Text>✅ 已連線：{connectedDevice.name}</Text>
          <Button
            title="📤讀取裝置時間"
            onPress={() => bpmServiceRef.current?.readDeviceTime()}
          />
          <Button
            title="📥寫入目前時間"
            onPress={() => bpmServiceRef.current?.writeDeviceTimeNow()}
          />
          <Button
            title="📤讀取歷史資料"
            onPress={() => bpmServiceRef.current?.readHistory()}
          />
          <Button title="❌ 斷線" color="red" onPress={disconnectDevice} />
          {deviceTime && (
            <Text style={{marginTop: 10}}>🕒 裝置時間：{deviceTime}</Text>
          )}
          {historyList.length > 0 && (
            <View style={{marginTop: 10}}>
              <Text style={{fontWeight: 'bold'}}>📜 歷史紀錄</Text>
              {historyList.length}
              {historyList.map((record, index) => {
                const datetime = `${record.year}/${String(record.month).padStart(2, '0')}/${String(record.day).padStart(2, '0')} ${String(record.hour).padStart(2, '0')}:${String(record.minute).padStart(2, '0')}`;
                return (
                  <Text key={index} style={{fontSize: 12, marginTop: 4}}>
                    🩺 {record.sys}/{record.dia} | ❤️ {record.pulse} | 🕓{' '}
                    {datetime}
                    {'\n'}✅ CuffOK: {record.cuffOk ? '是' : '否'} | ⚠️ IHB:{' '}
                    {record.ihb ? '是' : '否'} | ⚡ AFib:{' '}
                    {record.afib ? '是' : '否'} | 🧪 模式:{' '}
                    {renderMode(record.mode)}
                  </Text>
                );
              })}
            </View>
          )}
        </View>
      )}
      {debugMsg && (
        <View
          style={{
            position: 'absolute',
            top: 10,
            left: 10,
            right: 10,
            backgroundColor: '#fee',
            padding: 10,
            borderRadius: 5,
            maxHeight: 150,
          }}>
          <Text style={{color: 'red', fontWeight: 'bold'}}>debug訊息</Text>
          <ScrollView>
            <Text style={{color: '#333', fontSize: 12}}>{debugMsg}</Text>
          </ScrollView>
        </View>
      )}
      {statusMsg && (
        <View
          style={{
            position: 'absolute',
            bottom: 20,
            left: 10,
            right: 10,
            backgroundColor: '#fee',
            padding: 10,
            borderRadius: 5,
          }}>
          <Text style={{color: 'blue', fontWeight: 'bold'}}>狀態訊息</Text>
          <ScrollView>
            <Text style={{color: '#333', fontSize: 12}}>{statusMsg}</Text>
          </ScrollView>
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
