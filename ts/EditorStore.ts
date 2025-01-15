import { writable } from 'svelte/store';
import { clampedWritable } from './SvelteUtils';

// Create a writable store for the grid value
export const defaultGrid = 128;
export const gridStore = writable<number>(defaultGrid);
export const scaleFactorStore = clampedWritable(0.25, 0.05, 10);
