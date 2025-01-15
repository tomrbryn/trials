export interface Highscore {
    userId: number;
    levelId: number;
    score: number;
    ticks: number;
    tries: number;
    inputRecording: string;
}

export type LevelScoreType = {
    id: number;
    info: any;
    tries: number;
    ticks: number;
}

export function base64ToArrayBuffer(base64: string): ArrayBuffer {
    let binary = atob(base64);
    let bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
}

export function numbersToBase64(numbers: number[]): string {
    const uint8Array = new Uint8Array(numbers);
   let binaryString = '';
    for (let i = 0; i < uint8Array.length; i++) {
        binaryString += String.fromCharCode(uint8Array[i]);
    }
    return btoa(binaryString);
}

export function ticksToTimeString(ticks: number): string {
    let totalMilliseconds = Math.floor((ticks / 60) * 1000);
    let milliseconds = totalMilliseconds % 1000;
    let seconds = Math.floor(totalMilliseconds / 1000) % 60;
    let minutes = Math.floor(totalMilliseconds / 60000);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${milliseconds.toString().padStart(3, "0")}`;
}

export function prettyDate(dateIso: string | null | undefined): string {
    function pluralize(value: number, unit: string): string {
        return `${value} ${unit}${value === 1 ? '' : 's'} ago`;
    }    

    if (dateIso) {
        let date = new Date(dateIso)
        let diff = (new Date().getTime() - date.getTime()) / 1000 / 60;
        if (diff < 1) return "just now";
        if (diff < 60) return pluralize(diff.toFixed(0), 'minute');
        if (diff < 60 * 24) return pluralize((diff / 60).toFixed(0), 'hour');
        return date.getDate() + " " + date.toLocaleString('default', { month: 'short' }) + " " + date.getFullYear();
    }
    return "";
}
