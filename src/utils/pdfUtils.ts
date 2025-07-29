export interface BpReading {
    date: string;
    time: string;
    sys: number;
    dia: number;
    pulse: number;
}
/**
 * 計算平均收縮壓與舒張壓
 */
export function calculateAvg(entries: BpReading[]): {sys: number; dia: number} {
    if (entries.length === 0) return {sys: 0, dia: 0};
    const totalSys = entries.reduce((sum, e) => sum + e.sys, 0);
    const totalDia = entries.reduce((sum, e) => sum + e.dia, 0);
    return {
        sys: Math.round(totalSys / entries.length),
        dia: Math.round(totalDia / entries.length),
    };
}
function filterByHourCondition(readings: BpReading[], predicate: (hour: number) => boolean): BpReading[] {
    return readings.filter(e => predicate(parseInt(e.time.split(':')[0], 10)));
}
/**
 * 計算早上平均值（時間小於 12:00）
 */
export function calculateMorningAvg(readings: BpReading[]) {
    return calculateAvg(filterByHourCondition(readings, h => h < 12));
}
/**
 * 計算晚上平均值（時間大於等於 12:00）
 */
export function calculateEveningAvg(readings: BpReading[]) {
    return calculateAvg(filterByHourCondition(readings, h => h >= 12));
}
/**
 * 取得時間範圍
 */
export function getDateRange(readings: BpReading[]): string | {min: Date, max: Date} {
    const validDates = readings
        .map(e => new Date(`${e.date} ${e.time}`))
        .filter(d => !isNaN(d.getTime())); // 過濾掉 Invalid Date

    if (validDates.length === 0) return '';

    const minDate = new Date(Math.min(...validDates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...validDates.map(d => d.getTime())));

    const format = (d: Date) => d.toISOString().slice(0, 10).replace(/-/g, '/');

    return `${format(minDate)} - ${format(maxDate)}`;
}