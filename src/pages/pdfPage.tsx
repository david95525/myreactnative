// ReportScreen.tsx
import {ChartWebView} from '@components/ChartWebView';
import {readings} from '@constants/bpmData.ts';
import {
  calculateAvg,
  calculateEveningAvg,
  calculateMorningAvg,
  getDateRange,
} from '@utils/index.ts';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import React, {useState} from 'react';
import {
  ActivityIndicator,
  Button,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import RNFS from 'react-native-fs';
import {logobase64} from '../assets/logobase64.ts';
pdfMake.vfs = pdfFonts.vfs;

const mockData = {
  name: 'ML Test',
  age: 30,
  dateRange: getDateRange(readings),
  avg: calculateAvg(readings),
  morning: calculateMorningAvg(readings),
  evening: calculateEveningAvg(readings),
  readings: readings,
};

export const PdfPage = () => {
  const [chartBase64, setChartBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const generatePdf = async () => {
    if (!chartBase64) {
      alert('圖表尚未生成');
      return;
    }
    setLoading(true);
    const readingsPerPage = 20;

    // 將 readings 拆成多個分頁 table
    const readingTables = [];
    for (let i = 0; i < mockData.readings.length; i += readingsPerPage) {
      const chunk = mockData.readings.slice(i, i + readingsPerPage);
      readingTables.push({
        table: {
          headerRows: 1,
          widths: ['auto', 'auto', 'auto', 'auto', 'auto'],
          body: [
            ['Date', 'Time', 'SYS', 'DIA', 'Pulse'],
            ...chunk.map(r => [r.date, r.time, r.sys, r.dia, r.pulse]),
          ],
        },
        fontSize: 9,
        margin: [0, 0, 0, 10],
      });

      // 若不是最後一頁，強制換頁
      if (i + readingsPerPage < mockData.readings.length) {
        readingTables.push({text: '', pageBreak: 'after'});
      }
    }

    const docDefinition: any = {
      pageSize: 'A4',
      pageMargins: [40, 100, 40, 60],
      header: {
        margin: [40, 20],
        columns: [{image: logobase64, width: 380, alignment: 'center'}],
      },
      content: [
        {text: 'Microlife Test Report', style: 'header'},
        {
          text: `Name: ${mockData.name}   Age: ${mockData.age}`,
          style: 'subheader',
        },
        {text: `Date Range: ${mockData.dateRange}`, style: 'subheader'},
        {text: 'Average Readings', style: 'sectionHeader'},
        {
          table: {
            widths: ['*', '*', '*'],
            body: [
              ['Type', 'SYS', 'DIA'],
              ['Day Avg', `${mockData.avg.sys}`, `${mockData.avg.dia}`],
              [
                'Morning Avg',
                `${mockData.morning.sys}`,
                `${mockData.morning.dia}`,
              ],
              [
                'Evening Avg',
                `${mockData.evening.sys}`,
                `${mockData.evening.dia}`,
              ],
            ],
          },
        },
        {text: 'Trend Chart', style: 'sectionHeader', margin: [0, 20, 0, 10]},
        {image: chartBase64, width: 400, alignment: 'center'},
        {text: 'Readings', style: 'sectionHeader', margin: [0, 20, 0, 10]},
        ...readingTables,
      ],
      styles: {
        header: {fontSize: 18, bold: true, alignment: 'center'},
        subheader: {fontSize: 12, margin: [0, 5, 0, 5]},
        sectionHeader: {fontSize: 14, bold: true},
      },
    };

    const pdfDocGenerator = pdfMake.createPdf(docDefinition);
    pdfDocGenerator.getBase64(async (base64: string) => {
      const path = `${RNFS.DownloadDirectoryPath}/microlife_report.pdf`;
      await RNFS.writeFile(path, base64, 'base64');
      alert(`PDF 已儲存於: ${path}`);
      setLoading(false);
    });
  };
  return (
    <View style={{flex: 1}}>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Microlife Report Generator</Text>
        <ChartWebView onChartReady={base64 => setChartBase64(base64)} />
        <Button title="生成 PDF" onPress={generatePdf} />
      </ScrollView>
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={{color: '#fff', marginTop: 10}}>正在產生 PDF...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, padding: 20},
  title: {fontSize: 20, fontWeight: 'bold', marginBottom: 20},
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
