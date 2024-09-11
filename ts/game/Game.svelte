<script lang="ts">
    import { onMount } from 'svelte';
    import { Game } from './Game';
    import LevelList from './LevelList.svelte';
    import LevelHighscores from './LevelHighscores.svelte';
    import LoginModal from './LoginModal.svelte';
    import { gameState } from './GameStore';

    export let game: Game;
    let canvas: HTMLCanvasElement;

    onMount(() => game.start(canvas));

    console.log("Game.svelte2", $gameState);
</script>

<div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex;">
    <canvas bind:this={canvas} style="flex: 1; min-width: 0; min-height: 0;"></canvas>
</div>

{#if $gameState === 'levelList'}
    <LevelList />
{:else if $gameState === 'levelHighscores'}
    <LevelHighscores />
{:else if $gameState === 'login'}
    <LoginModal />
{/if}