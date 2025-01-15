import { writable, Writable } from 'svelte/store';

export function clampedWritable(initialValue: number, min: number, max: number): Writable<number> {
    const { subscribe, set, update } = writable(initialValue);
    const fix = (value: number) => parseFloat(Math.min(max, Math.max(min, value)).toFixed(3));

    return {
        subscribe,
        set: (value: number) => set(fix(value)),
        update: (fn: (value: number) => number) => update(value => fix(fn(value)))
    };
}
