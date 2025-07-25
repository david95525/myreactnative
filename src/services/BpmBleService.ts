import {Buffer} from 'buffer';
import {BleManager, Device, Subscription} from 'react-native-ble-plx';
import {BleConstants} from "../constants/bleConstants.ts";
import {BpMode, DRecord, GSensorStatus} from "../types/index.ts";
import {eventBus, isValidPacket, pad, parseBpData} from '../utils/index.ts';
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
            BleConstants.SERVICE_UUID,
            BleConstants.WRITE_CHARACTERISTIC_UUID,
            base64Data
        );
    }

    // ------- 指令封裝 ---------
    /** CMD 0x00 - 讀取所有歷史紀錄 */
    async readHistory(user: number = 0xFD): Promise<void> {
        const CMD_READ_ALL_HISTORY = 0x00;
        const data = [
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00,// Reserved
            user // Select User: 0x01 / 0x02 / 0xFD
        ];
        await this.sendCommand(CMD_READ_ALL_HISTORY, data);
    }
    /** CMD 0x03 - 清除所有歷史紀錄 */
    async clearHistory() {
        await this.sendCommand(0x03);
    }
    /** CMD 0x04 - 中斷藍牙連線 */
    private isDisconnecting = false;
    async disconnectSafely() {
        if (this.isDisconnecting) return;
        this.isDisconnecting = true;
        //通知設備斷線
        try {
            await this.sendCommand(0x04);
        } catch (e) {
            eventBus.emit('bleError', `設備 CMD04 回應失敗，但仍進行中斷:${e}`);
        }
        //移除 notify subscription（避免記憶體洩漏）
        if (this.notifySubscription) {
            this.notifySubscription.remove();
            this.notifySubscription = null;
        }
        //中斷 BLE 實體連線
        if (this.device) {
            try {
                await this.device.cancelConnection();
            } catch (error) {
                eventBus.emit('bleError', `取消連線時發生錯誤:${error}`);
            }
            this.device = null;
        }
        this.isDisconnecting = false;
        eventBus.emit('bleDisconnect');
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

    // ------- notify---------  
    public onTimeReceived?: (str: string) => void;
    public onHistoryReceived?: (records: DRecord[]) => void;
    subscribeToResponse() {
        if (!this.device) throw new Error('Device not connected');
        this.notifySubscription = this.device.monitorCharacteristicForService(
            BleConstants.SERVICE_UUID,
            BleConstants.NOTIFY_CHARACTERISTIC_UUID,
            (error, characteristic) => {
                if (error) {
                    if (error.errorCode == 201) {
                        eventBus.emit('bleDisconnect');
                    }
                    return;
                }
                const base64 = characteristic?.value ?? '';
                const rawBytes = Array.from(Buffer.from(base64, 'base64'));
                const str = rawBytes.join(",");
                eventBus.emit('bleDebug', `length:${rawBytes.length} row:${str}`);
                const validresult = isValidPacket(rawBytes);
                if (isValidPacket(rawBytes) == 1) {
                    eventBus.emit('bleError', `length:${rawBytes.length} row:${str} Invalid packet: too short'`);
                    return;
                }
                this.dispatchResponse(rawBytes);
            }
        );
    }
    /** 根據 cmd 分派解析*/
    private dispatchResponse(rawBytes: number[]) {
        const cmd = rawBytes[4];
        switch (cmd) {
            case 0x0c:
                this.handleTimeResponse(rawBytes);
                break;
            default:
                this.handleHistoryResponse(rawBytes);
                break;
        }
    }
    /**  解析 CMD 0x0C 裝置時間*/
    private handleTimeResponse(bytes: number[]) {
        const ready = bytes[5];
        if (ready !== 1) {
            this.onTimeReceived?.('尚未設定時間');
            return;
        }
        const year = 2000 + bytes[6];
        const month = bytes[7];
        const day = bytes[8];
        const hour = bytes[9];
        const minute = bytes[10];
        const second = bytes[11];
        const str = `${year}-${pad(month)}-${pad(day)} ${pad(hour)}:${pad(minute)}:${pad(second)}`;
        this.onTimeReceived?.(str);
    }
    /**  解析 CMD 0x00 歷史資料*/
    private handleHistoryResponse(rawBytes: number[]) {
        const records: DRecord[] = [];
        const bpRecords = parseBpData(rawBytes); // 每筆長度固定為 10 bytes
        for (const bytes of bpRecords) {
            if (bytes.length < 10) continue; // 安全檢查，避免錯誤資料
            const sys = bytes[0];
            const dia = bytes[1];
            const pulse = bytes[2];
            const year = 2000 + bytes[3];
            const month = bytes[4];
            const day = bytes[5];
            const hour = bytes[6];
            const minute = bytes[7];
            // 解析 flag byte（第 9 byte）
            const flagByte = bytes[8];
            const cuffOk = (flagByte & 0b10000000) !== 0;
            const ihb = (flagByte & 0b01000000) !== 0;
            const afib = (flagByte & 0b00100000) !== 0;
            const m2 = (flagByte & 0b00010000) >> 4;
            const m1 = (flagByte & 0b00001000) >> 3;
            let mode: BpMode = 'Single';
            if (m2 === 0 && m1 === 1) mode = 'Single_AFib';
            else if (m2 === 1 && m1 === 0) mode = 'MAM';
            else if (m2 === 1 && m1 === 1) mode = 'MAM_AFib';
            const g3 = (flagByte & 0b00000100) >> 2;
            const g2 = (flagByte & 0b00000010) >> 1;
            const g1 = flagByte & 0b00000001;
            const gCode = (g3 << 2) | (g2 << 1) | g1;
            let gSensor: GSensorStatus = 'None';
            switch (gCode) {
                case 0b100: gSensor = 'Normal'; break;
                case 0b101: gSensor = 'Up'; break;
                case 0b110: gSensor = 'Down'; break;
                case 0b111: gSensor = 'MAM_UpDown'; break;
                default: gSensor = 'None'; break;
            }
            records.push({
                sys, dia, pulse, year, month, day, hour, minute,
                cuffOk, ihb, afib, mode, gSensor
            });
        }
        this.onHistoryReceived?.(records);
    }
}