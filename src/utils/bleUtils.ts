//import {TOTAL_HEADER_SKIP} from "@types";
export function pad(n: number): string {
    return n.toString().padStart(2, '0');
}
export function parseBpData(rawBytes: number[]): number[][] {
    const length_L = rawBytes[2] * 256 + rawBytes[3]; // 封包長度（不含前4位）
    const bpCount = Math.floor((length_L - 39) / 10); // 有幾筆 10-byte 血壓紀錄
    // 前面42 bytes要跳過
    // const bpDataBytes = rawBytes.slice(TOTAL_HEADER_SKIP, TOTAL_HEADER_SKIP + bpCount * 10);
    const bpDataBytes = rawBytes;
    // 每 10 bytes 為一筆，切成二維陣列
    const result: number[][] = [];
    for (let i = 0; i < bpDataBytes.length; i += 10) {
        if (i + 10 <= bpDataBytes.length) {
            result.push(bpDataBytes.slice(i, i + 10));
        }
    }
    return result;
}
export function isValidPacket(rawBytes: number[]): number {
    if (rawBytes.length < 5) {
        return 1;
    }
    // const expectedLength = rawBytes[2] * 256 + rawBytes[3];
    // if (rawBytes.length - 4 !== expectedLength) {
    //     console.warn(`Data length does not match expected: expected=${expectedLength}, actual=${rawBytes.length - 4}`);
    //     return 2;
    // }
    // let calculatedChecksum = 0;
    // for (let i = 0; i < rawBytes.length - 1; i++) {
    //     calculatedChecksum += rawBytes[i];
    // }
    // calculatedChecksum &= 0xFF; // 取低 8 位

    // const receivedChecksum = rawBytes[rawBytes.length - 1];
    // if (calculatedChecksum !== receivedChecksum) {
    //     console.error(`Checksum validation failed: received=${receivedChecksum.toString(16).padStart(2, '0')}, calculated=${calculatedChecksum.toString(16).padStart(2, '0')}`);
    //     return 3;
    // }
    return 0;
}