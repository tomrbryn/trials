import { writable, Writable } from 'svelte/store';

export type GameState = 'levelList' | 'levelHighscores' | 'playing' | 'login';

export const gameState = writable<GameState>('login');
