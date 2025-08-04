import TextRecognition from '@react-native-ml-kit/text-recognition';
import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useFrameProcessor,
} from 'react-native-vision-camera';
import {Worklets, useSharedValue} from 'react-native-worklets-core';
export const OCRLivePage = () => {
  const [hasPermission, setHasPermission] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const device = useCameraDevice('back');
  const lastProcessed = useSharedValue(0);

  // 相機權限
  useEffect(() => {
    Camera.requestCameraPermission().then(res => {
      setHasPermission(res === 'granted');
    });
  }, []);

  // OCR 執行邏輯（傳入 frame 畫面）
  const processOCR = Worklets.createRunOnJS(async (frame: any) => {
    try {
      const result = await TextRecognition.recognize(frame);
      const text = result.blocks.map(block => block.text).join('\n');
      setRecognizedText(text);
    } catch (err) {
      setRecognizedText('OCR failed: ' + String(err));
    }
  });
  // Frame Processor (每幾百 ms 取一次畫面進行 OCR)
  const frameProcessor = useFrameProcessor(
    frame => {
      'worklet';
      const now = Date.now();
      if (now - lastProcessed.value < 1000) return;

      lastProcessed.value = now;

      processOCR(frame);
    },
    [processOCR],
  );
  if (!device || !hasPermission) {
    return <Text>相機初始化中...</Text>;
  }

  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        frameProcessor={frameProcessor}
      />
      <View style={styles.overlay}>
        <Text style={styles.ocrText}>辨識結果：</Text>
        <Text style={styles.ocrResult}>{recognizedText}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  overlay: {
    position: 'absolute',
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 12,
    width: '100%',
  },
  ocrText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  ocrResult: {
    color: '#fff',
    marginTop: 6,
  },
});
