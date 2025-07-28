import {PermissionsAndroid, Platform} from 'react-native';
import RNFS from 'react-native-fs';

export async function saveToDownloads(base64: string) {
    if (Platform.OS === 'android') {
        // 請求權限
        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
            {
                title: '需要存取權限',
                message: '允許存取檔案以儲存 PDF',
                buttonPositive: 'OK',
            }
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            const path = `${RNFS.DownloadDirectoryPath}/microlife_report.pdf`;
            await RNFS.writeFile(path, base64, 'base64');
            alert(`PDF 已儲存於: ${path}`);
        } else {
            alert('未授權存取權限');
        }
    } else {
        // iOS：使用 DocumentDirectoryPath
        const path = `${RNFS.DocumentDirectoryPath}/microlife_report.pdf`;
        await RNFS.writeFile(path, base64, 'base64');
        alert(`PDF 已儲存於: ${path}`);
    }
}
