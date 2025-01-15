import { writable } from 'svelte/store';
import { Edge, Vertex } from '../RiderCreator';
import { createDefaultRiderEntry, type RiderEntry } from '../Entry';
import { UndoRedoManager } from '../UndoRedoManager';

export const undoRedoManager = new UndoRedoManager();

export const riderEntryStore = writable<RiderEntry>(createDefaultRiderEntry());
export const overEdge = writable<Edge | null>(null);
export const overVertex = writable<Vertex | null>(null);
export const selectedEdge = writable<Edge | null>(null);
export const selectedVertex = writable<Vertex | null>(null);

export const modes = ["addVertex", "addEdge", "movePoint"];
export const modeStore = writable<"addVertex" | "addEdge" | "movePoint">("addVertex");

export const leaning = writable<boolean>(false);
