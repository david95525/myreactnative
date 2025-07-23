// BpmBleService.ts
import {Buffer} from 'buffer';
import {BleManager, Device, Subscription} from 'react-native-ble-plx';

const Constants = {
    SERVICE_UUID: '0000fff0-0000-1000-8000-00805f9b34fb',
    NOTIFY_CHARACTERISTIC_UUID: '0000fff1-0000-1000-8000-00805f9b34fb',
    WRITE_CHARACTERISTIC_UUID: '0000fff2-0000-1000-8000-00805f9b34fb',
    MAX_SCAN_ATTEMPTS: 3,
    RESPONSE_TIMEOUT: 10000,
};

export class BpmBleService {
    private manager: BleManager;
    private device: Device | null = null;
    private notifySubscription: Subscription | null = null;

    constructor(manager: BleManager) {
        this.manager = manager;
    }

    async connect(deviceId: string) {
        this.device = await this.manager.connectToDevice(deviceId);
        await this.device.discoverAllServicesAndCharacteristics();
    }
    async disconnect() {
        if (this.notifySubscription) {
            this.notifySubscription.remove();
            this.notifySubscription = null;
        }

        if (this.device) {
            try {
                await this.device.cancelConnection();
            } catch (error) {
                console.warn('取消連線時發生錯誤:', error);
            }
            this.device = null;
        }
    }
    subscribeToResponse(callback: (bytes: number[]) => void) {
        if (!this.device) throw new Error('Device not connected');

        this.notifySubscription = this.device.monitorCharacteristicForService(
            Constants.SERVICE_UUID,
            Constants.NOTIFY_CHARACTERISTIC_UUID,
            (error, characteristic) => {
                if (error) {
                    console.error('Notify Error:', error);
                    return;
                }

                const base64 = characteristic?.value ?? '';
                const buffer = Buffer.from(base64, 'base64');
                const bytes = Array.from(buffer);
                callback(bytes);
            }
        );
    }

    private buildCommandPacket(cmd: number, data: number[] = []): number[] {
        const HEADER = 0x4D;
        const DEVICE = 0xFF;
        const length = 1 + data.length + 1; // CMD + Data + Checksum
        const lengthH = (length >> 8) & 0xff;
        const lengthL = length & 0xff;

        const payload = [HEADER, DEVICE, lengthH, lengthL, cmd, ...data];
        const checksum = payload.reduce((sum, b) => (sum + b) & 0xff, 0);
        payload.push(checksum);

        return payload;
    }

    async sendCommand(cmd: number, data: number[] = []) {
        if (!this.device) throw new Error('Device not connected');

        const packet = this.buildCommandPacket(cmd, data);
        const base64Data = Buffer.from(packet).toString('base64');

        await this.device.writeCharacteristicWithResponseForService(
            Constants.SERVICE_UUID,
            Constants.WRITE_CHARACTERISTIC_UUID,
            base64Data
        );
    }

    // ------- 指令封裝 ---------

    /** CMD 0x00 - 讀取所有歷史紀錄 */
    async readHistory() {
        await this.sendCommand(0x00);
    }

    /** CMD 0x03 - 清除所有歷史紀錄 */
    async clearHistory() {
        await this.sendCommand(0x03);
    }

    /** CMD 0x04 - 中斷藍牙連線 */
    async disconnectDevice() {
        await this.sendCommand(0x04);
    }

    /** CMD 0x05 - 讀取 User ID 與版本 */
    async readUserInfo() {
        await this.sendCommand(0x05);
    }

    /** CMD 0x0C - 讀取裝置時間 */
    async readDeviceTime() {
        await this.sendCommand(0x0C);
    }

    /** CMD 0x0D - 寫入當前時間到裝置 */
    async writeDeviceTimeNow() {
        const now = new Date();
        const year = now.getFullYear() - 2000; // 例如 2025 → 0x19
        const data = [
            year & 0xff,
            now.getMonth() + 1,
            now.getDate(),
            now.getHours(),
            now.getMinutes(),
            now.getSeconds(),
        ];
        await this.sendCommand(0x0D, data);
    }

    /** CMD 0x0F + 0x00 - 讀取序號 */
    async readSerialNumber() {
        await this.sendCommand(0x0F, [0x00]);
    }
}
