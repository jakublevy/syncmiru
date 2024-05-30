export function createMarks(min: number, max: number, step: number, fractionDigits: number, suffix: string): Record<number, string> {
    const record: Record<number, string> = {};
    for (let i = min; i <= max; i += step) {
        record[i] = `${i.toFixed(fractionDigits)}${suffix}`;
    }
    return record;
}