import { writable, Writable } from 'svelte/store';
import type { LevelEntry } from './LevelEntry';
import { createDefaultLevelEntry } from './LevelEntry';

export const levelEntryStore = writable<LevelEntry>(createDefaultLevelEntry());

export function clampedWritable(initialValue: number, min: number, max: number): Writable<number> {
    const { subscribe, set, update } = writable(initialValue);
    const fix = (value: number) => parseFloat(Math.min(max, Math.max(min, value)).toFixed(3));

    return {
        subscribe,
        set: (value: number) => set(fix(value)),
        update: (fn: (value: number) => number) => update(value => fix(fn(value)))
    };
}

// Create a writable store for the grid value
export const defaultGrid = 128;
export const gridStore = writable<number>(defaultGrid);
export const scaleFactorStore = clampedWritable(0.25, 0.05, 10);

export const modes = ["addLineArray", "addCircle", "addCheckpoint", "movePoint"];
export const modeStore = writable<"addLineArray" | "addCircle" | "addCheckpoint" | "movePoint">("addLineArray");
