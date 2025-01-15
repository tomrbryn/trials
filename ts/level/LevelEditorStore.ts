import { writable } from 'svelte/store';
import type { LevelEntry } from '../Entry';
import { createDefaultLevelEntry } from '../Entry';

export const levelEntryStore = writable<LevelEntry>(createDefaultLevelEntry());

export const modes = ["addLineArray", "addCircle", "addCheckpoint", "movePoint"];
export const modeStore = writable<"addLineArray" | "addCircle" | "addCheckpoint" | "movePoint">("addLineArray");
