import { setupReload } from '../ServerSideEvents';
import GameUI from './Game.svelte';
import { updateUserStore, playbackStore, playbackTickStore, playbackIterationStore } from './GameStore';
import { get } from 'svelte/store';
import { JsonGame } from './JsonGame';

const game = new JsonGame();

// don't show default context menu in browser
document.addEventListener('contextmenu', (event) => event.preventDefault());
document.addEventListener('DOMContentLoaded', async () => {
    setupReload();
    await updateUserStore();
    let levels = await (await fetch("/trials/api/levels")).json();
    console.log("levels", levels);
    let dropLevel = levels.find(level => level.info.name.toLowerCase().includes("drop"));

    game.fetchAndLoadLevel(levels[0]);

    // if (dropLevel) {
    //     game.fetchAndLoadLevel(dropLevel);
    // } else if (levels.length > 0) {
    //     game.fetchAndLoadLevel(levels[0]);
    // }

    new GameUI({target: document.body, props: {game: game}});
});

