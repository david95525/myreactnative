import {useIsFocused} from '@react-navigation/native';
import React, {useEffect, useRef, useState} from 'react';
import {Alert, StyleSheet, Text, View} from 'react-native';
import {Camera, useCameraDevice} from 'react-native-vision-camera';

interface Datatype {
  blob: {
    ICON: string[];
    Text: string[];
    merged_numbers: string[];
  };
}
export const ScanPage: React.FC = () => {
  const [hasPermission, setHasPermission] = useState(false);
  const [sys, setSys] = useState('');
  const cameraRef = useRef<Camera>(null);
  const device = useCameraDevice('back');
  const isFocused = useIsFocused();

  useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      setHasPermission(status === 'granted');
    })();
  }, []);

  useEffect(() => {
    if (hasPermission && isFocused) {
      const timer = setTimeout(async () => {
        try {
          const photo = await cameraRef.current?.takePhoto();

          if (photo?.path) {
            // 可以在這裡加條件判斷是否真的要上傳（例如光線足夠等等）
            uploadPhoto(photo.path);
          }
        } catch (e) {
          console.warn('Failed to take photo', e);
        }
      }, 2000); // 2秒自動截圖

      return () => clearInterval(timer);
    }
  }, [hasPermission, isFocused]);

  const uploadPhoto = async (path: string) => {
    const data = new FormData();
    data.append('file', {
      uri: 'file://' + path,
      type: 'image/jpeg',
    });
    try {
      let res = await fetch('', {
        method: 'POST',
        body: data,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.ok) {
        let values: Datatype = await res.json();
        setSys(values.blob.merged_numbers[0]);
      }
      let result = await res.json();
      Alert.alert(result);
    } catch (e) {
      console.warn('Upload failed', e);
      Alert.alert('Upload failed' + e);
    }
  };

  if (device == null || !hasPermission) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={isFocused}
        photo={true}
      />
      <View style={styles.scanBox} />
      <View>
        <Text>SYS</Text>
        <Text>{sys}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scanBox: {
    position: 'absolute',
    top: '30%',
    left: '15%',
    width: '70%',
    height: '30%',
    borderWidth: 2,
    borderColor: 'lime',
    borderRadius: 12,
  },
});
