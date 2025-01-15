import { writable, derived } from 'svelte/store';
import type { LevelScoreType } from '../Utils';
import type { Level } from '../GameStructGeneratedCode';
import type { Playback } from '../Playback';

export const playbackTickStore = writable<number>(30);
export const physicsLevelStore = writable<Level | null>(null);
export const playbackStore = writable<Playback | null>(null);
export const playbackPlayingStore = writable<boolean>(true);

export const triesStore = writable<number>(0);
export const ticksStore = writable<number>(0);
export const currentLevelStore = writable<any | null>(null);
export const currentLevelScoreStore = writable<LevelScoreType | null>(null);

export const userStore = writable<any | null>(null);
export async function updateUserStore() {
    let response = await fetch("/trials/api/session");
    if (response.ok) {
        userStore.set(await response.json());
    } else {
        userStore.set(null);
    }
}

export type Dialog = 'levelList' | 'levelHighscores' | 'game' | 'login' | 'createAccount';

export const dialogStack = writable<string[]>(["game"]);
export const dialogStackTop = derived(dialogStack, $dialogStack => {
    return $dialogStack.length > 0 ? $dialogStack[$dialogStack.length - 1] : null;
});

export function pushDialog(dialog: Dialog) {
    dialogStack.update($dialogStack => {
        return [...$dialogStack, dialog];
    });
}

export function popDialog() {
    dialogStack.update($dialogStack => {
        return $dialogStack.slice(0, $dialogStack.length - 1);
    });
}

export function popPushDialog(dialog: Dialog) {
    dialogStack.update($dialogStack => {
        return [...$dialogStack.slice(0, $dialogStack.length - 1), dialog];
    });
}