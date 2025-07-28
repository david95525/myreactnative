// ChartWebView.tsx
import React, {useRef} from 'react';
import {StyleSheet, View} from 'react-native';
import {WebView, WebViewMessageEvent} from 'react-native-webview';

interface ChartWebViewProps {
  onChartReady: (base64Image: string) => void;
}

export const ChartWebView: React.FC<ChartWebViewProps> = ({onChartReady}) => {
  const webviewRef = useRef<WebView>(null);

  const htmlContent = `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
      </head>
      <body style="margin:0;padding:0;">
        <canvas id="myChart" width="400" height="200"></canvas>
        <script>
          const ctx = document.getElementById('myChart').getContext('2d');
          const chart = new Chart(ctx, {
            type: 'line',
            data: {
              labels: ['Apr', 'May', 'Jun', 'Jul'],
              datasets: [
                {
                  label: 'SYS',
                  data: [120, 124, 126, 123],
                  borderColor: '#007bff',
                  fill: false
                },
                {
                  label: 'DIA',
                  data: [80, 82, 85, 84],
                  borderColor: '#ff0000',
                  fill: false
                }
              ]
            },
            options: {
              responsive: false,
              maintainAspectRatio: false
            }
          });

          setTimeout(() => {
            const base64 = document.getElementById('myChart').toDataURL();
            window.ReactNativeWebView.postMessage(base64);
          }, 1500);
        </script>
      </body>
    </html>
  `;

  const handleMessage = (event: WebViewMessageEvent) => {
    onChartReady(event.nativeEvent.data);
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webviewRef}
        originWhitelist={['*']}
        source={{html: htmlContent}}
        onMessage={handleMessage}
        style={styles.webview}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {height: 220, width: '100%'},
  webview: {flex: 1, backgroundColor: 'transparent'},
});
