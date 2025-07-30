import React, {useEffect, useRef, useState} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import Svg, {Line, Path} from 'react-native-svg';

// 公用設定
const WIDTH = 300;
const HEIGHT = 200;
const MAX_POINTS = 50;

// 假 ECG 波形產生器
const generateECGValue = () => {
  const rand = Math.random();
  if (rand < 0.02) return 90 + Math.random() * 10;
  if (rand < 0.1) return 40 + Math.random() * 10;
  return 10 + Math.random() * 5;
};

// 假 BP 資料產生器
const generateBPData = () => {
  return {
    sys: 120 + Math.round(Math.random() * 10),
    dia: 80 + Math.round(Math.random() * 5),
  };
};

// ECG 折線圖
const ECGChart: React.FC = () => {
  const [data, setData] = useState<number[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setData(prev => {
        const newY = generateECGValue();
        const next = [...prev, newY];
        if (next.length > MAX_POINTS) next.shift();
        return next;
      });
    }, 50); // ECG 更新速度快
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const buildPath = () => {
    const step = WIDTH / MAX_POINTS;
    return data.reduce((path, y, i) => {
      const x = i * step;
      const yPos = HEIGHT - y;
      return path + (i === 0 ? `M${x},${yPos}` : ` L${x},${yPos}`);
    }, '');
  };

  return (
    <View style={styles.chartWrapper}>
      <Text style={styles.label}>ECG</Text>
      <Svg width={WIDTH} height={HEIGHT} style={styles.svg}>
        <Path d={buildPath()} stroke="lime" strokeWidth={2} fill="none" />
      </Svg>
    </View>
  );
};

// SYS/DIA 折線圖
const BpmChart: React.FC = () => {
  const [sysData, setSysData] = useState<number[]>([]);
  const [diaData, setDiaData] = useState<number[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const {sys, dia} = generateBPData();
      setSysData(prev => {
        const next = [...prev, sys];
        if (next.length > MAX_POINTS) next.shift();
        return next;
      });
      setDiaData(prev => {
        const next = [...prev, dia];
        if (next.length > MAX_POINTS) next.shift();
        return next;
      });
    }, 1000); // 每秒更新一筆

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const buildPath = (data: number[]) => {
    const stepX = WIDTH / (MAX_POINTS - 1);
    const maxY = 140;
    const minY = 60;

    return data.reduce((path, y, i) => {
      const x = i * stepX;
      const yNorm = ((y - minY) / (maxY - minY)) * HEIGHT;
      const yPos = HEIGHT - yNorm;
      return path + (i === 0 ? `M${x},${yPos}` : ` L${x},${yPos}`);
    }, '');
  };

  return (
    <View style={styles.chartWrapper}>
      <Text style={styles.label}>SYS / DIA</Text>
      <Svg width={WIDTH} height={HEIGHT} style={styles.svg}>
        <Line
          x1="0"
          y1={HEIGHT / 2}
          x2={WIDTH}
          y2={HEIGHT / 2}
          stroke="#ccc"
          strokeDasharray="4 2"
        />
        <Path d={buildPath(diaData)} stroke="red" strokeWidth={2} fill="none" />
        <Path
          d={buildPath(sysData)}
          stroke="#007bff"
          strokeWidth={2}
          fill="none"
        />
      </Svg>
    </View>
  );
};

// 主頁面
export const CombinedChartPage: React.FC = () => {
  return (
    <ScrollView contentContainerStyle={styles.page}>
      <ECGChart />
      <BpmChart />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  page: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  chartWrapper: {
    marginVertical: 20,
    alignItems: 'center',
  },
  svg: {
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
  },
  label: {
    marginBottom: 8,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
