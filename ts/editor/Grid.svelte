<script lang="ts">
    import { gridStore } from './EditorStore';
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();
    let gridOptions = [0, 32, 64, 128, 256];
</script>

<div class="levels-container">
    <h1 style="margin: 0; color: #2e7d32;">Grid</h1>
    <input type="number" min="0" max="256" step="8" bind:value={$gridStore} />    
    <input type="range" id="grid-slider" min="0" max="256" step="8" bind:value={$gridStore} />
    <div style="display: flex; gap: 0.5rem">
        {#each gridOptions as gridOption}
            <button class="btn" class:selected={$gridStore == gridOption} on:click|preventDefault|stopPropagation={() => $gridStore = gridOption}>
                {gridOption}
            </button>
    {/each}
    </div>
</div>

<style>
    .levels-container {
        flex: 1;
        gap: 0.5rem;
        padding: 1rem;
        display: flex;
        flex-direction: column;
    }

    .btn {
        font-size: 1.25rem;
        padding: 0.5rem 1rem;
        border-radius: 5px;
        /* background-color: #455a64; */
        background-color: #9e9e9e;        
        /* background-color: #90a4ae; */
        color: #fff;
        /* #1565c0; */
    }
    .btn:hover {
        background-color: #ff7043;
        opacity: 0.8;
    }
    .btn.selected {
        background-color: #1565c0;
    }
</style>
