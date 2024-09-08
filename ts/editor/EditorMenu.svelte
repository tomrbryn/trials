<script lang="ts">
    import { gridStore, scaleFactorStore, modeStore, modes } from './EditorStore';
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();

    let gridOptions = [0, 32, 64, 128, 256];
    let modeMap = {
        addCheckpoint: '┃✔',
        addCircle: '⚫',//'⚪',
        addLineArray: '┌─┘',
        movePoint: '◦ ↔ ◦'
    }

    let overlayVisible = true;

    window.addEventListener('keydown', (event) => {
        if (event.key === 'F1') {
            event.preventDefault();
            overlayVisible = !overlayVisible;
        }
    });    
</script>

<div style="position: absolute; top: 0; left: 0; margin: 0.5rem;">
    <button on:click={() => overlayVisible = !overlayVisible} style="min-width: 3rem; min-height: 3rem; font-size: 1.5rem;">☰</button>
    {#if (overlayVisible)}
    <div id="overlay" class="rounded" style="background-color: rgba(200, 200, 200, 1.0); 
            border: 1px solid #000; box-shadow: 0.5rem 0.5rem 1rem rgba(0, 0, 0, 0.4);">
             
        <div style="display: flex; gap: 0.5rem;">
            <button on:click|preventDefault|stopPropagation={() => dispatch("new")} class="icon">📄</button>
            <button on:click|preventDefault|stopPropagation={() => dispatch("open")} class="icon">📂</button>
            <button on:click|preventDefault|stopPropagation={() => dispatch("save")} class="icon">💾</button>
            <button on:click|preventDefault|stopPropagation={() => dispatch("undo")} class="icon">↺</button>
            <button on:click|preventDefault|stopPropagation={() => dispatch("redo")} class="icon">↻</button>
            <button on:click|preventDefault|stopPropagation={() => dispatch("play")} class="icon">▶</button> 
            <button on:click|preventDefault|stopPropagation={() => dispatch("play")} class="icon">⚙</button> 
            <button on:click|preventDefault|stopPropagation={() => dispatch("play")} class="icon">⛶#</button>
            <button on:click|preventDefault|stopPropagation={() => dispatch("play")} class="icon">🔍️🔍🔎⏷▾▼▶▸►🚲🏍️</button>
            
                                   
        </div>    
    
        <div class="label">Modes:</div>
        <div style="display: flex; gap: 0.5rem">
            {#each modes as mode}
                <button on:click|preventDefault|stopPropagation={() => $modeStore = mode}
                        style="padding: 0.5rem; min-width: 2.7rem;
                            {$modeStore == mode ? 'background-color:#339933' : ''}
                            ; color: {$modeStore == mode ? '#fff' : '#000'}">
                    {modeMap[mode] || mode}
                </button>
            {/each}
        </div>
        
    
        <div class="label">Grid:</div>
        <div style="display: flex; gap: 0.5rem">
            {#each gridOptions as gridOption}
                <button on:click|preventDefault|stopPropagation={() => $gridStore = gridOption}
                        style="padding: 0.5rem; min-width: 2.7rem;
                             {$gridStore == gridOption ? 'background-color: #339933;' : ''}
                            ; color: {$gridStore == gridOption ? '#fff' : '#000'}">
                    {gridOption}
                </button>
            {/each}
        </div>
    
        <div class="label">Scale:</div>
        <div style="display: flex; gap: 0.5rem;">
            <input type="number" bind:value={$scaleFactorStore} min="0.1" step="0.1" style="flex: 1; width: 0px;">
            <button on:click|preventDefault|stopPropagation={() => $scaleFactorStore = 0.25} style="min-width: 3rem;">0.25</button>
            <button on:click|preventDefault|stopPropagation={() => $scaleFactorStore = 1} style="min-width: 3rem;">1</button>
            <button on:click|preventDefault|stopPropagation={() => $scaleFactorStore = 5} style="min-width: 3rem;">5</button>
        </div>    
    </div>        
    {/if}
    
</div>


<style>
    .label {
        font-size: 0.8rem;
        font-weight: 600;
        margin-top: 0.5rem;
    }

    .icon {
        padding: 0rem;
        min-width: 3rem;
        min-height: 3rem;
        font-size: 2rem;
        background-color: inherit;
    }
</style>
