const BP_HEADER_SIZE = 5; //5 bytes (header+device+lenH+lenL+cmd)
const METADATA_SIZE = 37; //37 bytes metadata
export const TOTAL_HEADER_SKIP = BP_HEADER_SIZE + METADATA_SIZE;
export type BpMode = 'Single' | 'Single_AFib' | 'MAM' | 'MAM_AFib';
export type GSensorStatus = 'None' | 'Normal' | 'Up' | 'Down' | 'MAM_UpDown';
export interface DRecord {
    sys: number;
    dia: number;
    pulse: number;
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    cuffOk: boolean;
    ihb: boolean;
    afib: boolean;
    mode: BpMode;
    gSensor: GSensorStatus;
}