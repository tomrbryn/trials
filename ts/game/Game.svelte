<script lang="ts">
    import { onMount } from 'svelte';
    import { Game } from './Game';
    import LevelList from './LevelList.svelte';
    import LevelHighscores from './LevelHighscores.svelte';
    import Login from './Login.svelte';
    import { dialogStackTop, pushDialog, userStore, updateUserStore, triesStore, ticksStore, playbackTickStore, playbackStore, playbackPlayingStore } from './GameStore';
    import CreateAccount from './CreateAccount.svelte';
    import { ticksToTimeString } from '../Utils';
    import Slider from './Slider.svelte';

    export let game: Game;
    let canvas: HTMLCanvasElement;
    let tickSlider: Slider;
    let sliderMax = 101;

    function tickSliderChanged(value) {
        console.log("tickSliderChanged", value);
        $playbackPlayingStore = false;
    }

    $: {
        console.log("playback changed", $playbackStore);
        if (tickSlider) {
            console.log("setting max", $playbackStore?.recording.recording.length);
            sliderMax = $playbackStore?.recording.recording.length ?? 200;
        }
    }

    onMount(() => {
        game.start(canvas);
        console.log("Game started", $playbackStore);
        sliderMax = $playbackStore?.getTickIdx() ?? 100;
    });
    // ⏱️ ❌ ☠️ 💔
</script>

<div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex;">
    <canvas bind:this={canvas} style="flex: 1; min-width: 0; min-height: 0;"></canvas>
</div>

<div id="overlay" style="position: absolute; top: 1rem; left: 1rem; display: flex; gap: 1rem;">
    <div class="status">
        <div class="status_icon">⏱️</div>
        <div class="status_text" style="width: 4.75em; ">{ticksToTimeString($ticksStore)}</div>
    </div>
    <div class="status">
        <div class="status_icon">☠️</div>
        <div class="status_text" style="width: 1.75em;">{$triesStore}</div>
    </div>     
</div>

<div id="sliders" style="position: absolute; bottom: 0; left: 0; right: 0; display: flex; gap: 1rem;">
    <Slider bind:this={tickSlider} text="Tick" bind:max={sliderMax} bind:value={$playbackTickStore} on:sliderChange={tickSliderChanged}></Slider>

</div>

{#if $dialogStackTop === 'levelList'}
    <LevelList />
{:else if $dialogStackTop === 'levelHighscores'}
    <LevelHighscores />
{:else if $dialogStackTop === 'login'}
    <Login />
{:else if $dialogStackTop === 'createAccount'}
    <CreateAccount />
{:else if $dialogStackTop === 'game'}

{:else}
    <LevelList />
{/if}

<style>
    .status {
        background-color: #e8f5e9d0;
        color: black;
        font-size: 1.25rem;
        display: flex;
        padding: 0.5rem;
        border-radius: 2.5rem;
        align-items: baseline;
        gap: 0.25rem;
    }
    .status_icon {
    }
    .status_text {
        text-align: center;
    }
</style>