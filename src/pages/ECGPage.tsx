import React, {useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import Svg, {Path} from 'react-native-svg';

export const ECGPage = () => {
  const [data, setData] = useState<number[]>([]);
  const maxPoints = 100; // 顯示的資料點數量
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 模擬資料流進
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setData(prev => {
        const newY = generateECGValue();
        const newData = [...prev, newY];
        if (newData.length > maxPoints) {
          newData.shift(); // 移除最前面的
        }
        return newData;
      });
    }, 50); // 每 50ms 模擬一筆資料
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // 將資料轉為 Path 字串
  const buildPath = () => {
    if (data.length === 0) return '';
    const width = 300;
    const height = 100;
    const step = width / maxPoints;

    return data.reduce((path, y, i) => {
      const x = i * step;
      const yPos = height - y; // Y 軸反轉
      return path + (i === 0 ? `M${x},${yPos}` : ` L${x},${yPos}`);
    }, '');
  };

  return (
    <View>
      <Svg width={300} height={100} style={{backgroundColor: 'black'}}>
        <Path d={buildPath()} stroke="lime" strokeWidth={2} fill="none" />
      </Svg>
    </View>
  );
};

// 假的 ECG 波形（你可以用更複雜邏輯）
const generateECGValue = () => {
  const rand = Math.random();
  if (rand < 0.02) return 90 + Math.random() * 10; // 突刺（R波）
  if (rand < 0.1) return 40 + Math.random() * 10; // P波或 T波
  return 10 + Math.random() * 5; // 平穩區
};
