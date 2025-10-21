import { setupReload } from '../ServerSideEvents';
import { createPhysics } from '../Physics';
import GameUI from './Game.svelte';
import { updateUserStore, playbackStore, playbackTickStore } from './GameStore';
import { get } from 'svelte/store';
import { Game } from './Game';

const game = new Game();

// don't show default context menu in browser
document.addEventListener('contextmenu', (event) => event.preventDefault());
document.addEventListener('DOMContentLoaded', async () => {
    setupReload();
    await updateUserStore();
    game.physics = await createPhysics();
    new GameUI({target: document.body, props: {game: game}});
});

playbackTickStore.subscribe((tick: number) => {
    let playback = get(playbackStore);
    if (tick !== null && playback) {
        // console.log("game update playback tick", tick, playback.getTickIdx());
        playback.setTickIdx(tick);
    }
});
