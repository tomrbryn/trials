<script lang="ts">
    import { Editor } from './Editor';
    import { scaleFactorStore, modeStore, modes } from './EditorStore';
    import { createEventDispatcher } from 'svelte';
    import Open from './Open.svelte';
    import Save from './Save.svelte';
    import Grid from './Grid.svelte';

    export let editor: Editor;
    
    let showOpen = false;
    let showSave = false;
    let showGrid = false;
    let openMenu;
    let saveMenu;
    let gridMenu;
    let gridButton;

    const dispatch = createEventDispatcher();

    let modeMap = {
        addCheckpoint: '┃<sup>✔</sup>',
        addCircle: '⚫',//'⚪',
        addLineArray: '┌─┘',
        movePoint: "↔", //'◦ ↔ ◦'
    }

    let overlayVisible = true;

    window.addEventListener('keydown', (event) => {
        if (event.key === 'F1') {
            event.preventDefault();
            overlayVisible = !overlayVisible;
        }
    });    

    async function toggleOpenMenu() {
        showOpen = !showOpen;
        if (showOpen) {
            showSave = false;
            showGrid = false;
        }
    }

    async function toggleSaveMenu() {
        console.log("toggleSaveMenu");
        showSave = !showSave;
        if (showSave) {
            showOpen = false;
            showGrid = false;
        }
    }
    
    async function toggleGridMenu(event) {
        console.log("toggleGridMenu");
        showGrid = !showGrid;
        if (showGrid) {
            const btnRect = gridButton.getBoundingClientRect();
            const btnParentRect = gridButton.parentElement.getBoundingClientRect();
            let menuRect = gridMenu.getBoundingClientRect();;
            gridMenu.style.top = Math.min(btnRect.top, btnParentRect.bottom - menuRect.height) + "px";

            showOpen = false;
            showSave = false;
        }
    }

    document.addEventListener('mousedown', (event) => {
        if (!openMenu?.contains(event.target)) {
            showOpen = false;
        }
        if (!saveMenu?.contains(event.target)) {
            showSave = false;
        }
        if (!gridMenu?.contains(event.target)) {
            showGrid = false;
        }        
    });
    
    function toPercent(scale: number) {
        return (scale * 100).toFixed(0) + "%";
    }
</script>

<div class="toolbar">
    <div style="height: 1rem"></div>
    <button on:click|preventDefault|stopPropagation={() => dispatch("new")} class="btn">
        <div class="icon">📄</div>
    </button>
    <button on:mousedown|preventDefault|stopPropagation={toggleOpenMenu} class="btn" class:selected={showOpen}>
        <div class="icon">📂</div>
        <div class="btn-arrow">►</div>
    </button>
    <button on:mousedown|preventDefault|stopPropagation={toggleSaveMenu} class="btn" class:selected={showSave}>
        <div class="icon">💾</div>
        <div class="btn-arrow">►</div>
    </button>
    <button on:click|preventDefault|stopPropagation={() => dispatch("undo")} class="btn">
        <div class="icon">↺</div>
    </button>
    <button on:click|preventDefault|stopPropagation={() => dispatch("redo")} class="btn">
        <div class="icon">↻</div>
    </button>
    <button on:click|preventDefault|stopPropagation={() => dispatch("play")} class="btn">
        <div class="icon">▶</div>
    </button>
    <button bind:this={gridButton} on:mousedown|preventDefault|stopPropagation={toggleGridMenu} class="btn" class:selected={showGrid}>
        <div class="icon">#</div>
        <div class="btn-arrow">►</div>
    </button>
    <div style="height: 1rem"></div>
    <hr>
    <div style="height: 1rem"></div>
    {#each modes as mode}
        <button class="btn" class:mode_selected={$modeStore == mode} on:click|preventDefault|stopPropagation={() => $modeStore = mode}>
            <div class="icon"> {@html modeMap[mode] || mode}</div>
        </button>
    {/each}

    <button class="btn" style="margin-top: auto; text-align: center;">
        <div class="icon2" style="padding: 0.5rem 0;">🔍️ {toPercent($scaleFactorStore)}</div>
    </button>
    {#if showOpen}
        <div class="btn-big-menu" bind:this={openMenu}>
            <Open on:close={() => showOpen = false} />
        </div>
    {/if}        
    <div class="btn-small-menu" class:hidden={!showGrid} bind:this={gridMenu}>
        <Grid on:close={() => showGrid = false} />
    </div>

    {#if showSave}
        <div class="btn-small-menu" bind:this={saveMenu}>
            <Save on:close={() => showSave = false} />
        </div>
    {/if}      
</div>
<!-- 
<button on:click|preventDefault|stopPropagation={() => dispatch("play")} class="icon">⚙🔍️⛶#🔍🔎⏷▾▼▶▸►🚲🏍️</button>
-->
<style>
    .toolbar {
        background-color: #9cb; 
        width: 5rem; 
        height: 100%; 
        display: flex; 
        flex-direction: column; 
        position: relative;
    }
    .label {
        font-size: 0.8rem;
        font-weight: 600;
        margin-top: 0.5rem;
    }

    .icon {
        padding: 0.25rem;
        font-size: 1.75rem;
        white-space: nowrap;
        overflow: hidden;
    }

    .btn {
        padding: 0.25rem;
        position: relative;
        display: inline-block;
    }
    .btn:hover {
        /* background-color: #e8f5e9; */
        background-color: #7fa1b2;
        /* background-color: #b3c7d4; */
        /* background-color: #a9d4cb; */
    }

    .btn-arrow {
        position: absolute;
        top: 50%;
        right: 5%;
        transform: translateY(-50%);
        white-space: nowrap;
    }
    .selected {
        background-color: #e8f5e9;
    }
    .mode_selected {
        background-color: #ff7043;
        opacity: 0.8;
    }
    .btn-big-menu {
        display: flex;
        background-color: #e8f5e9;
        position: absolute;
        top: 5%;
        left: 100%;
        white-space: nowrap;
        max-height: 90%;
    }
    .btn-small-menu {
        background-color: #e8f5e9;
        position: absolute;
        top: 0;
        left: 100%;
        white-space: nowrap;
        /* height: 100%; */
    }
    .hidden {
        /* display: none; */
        visibility: hidden;
    }

  /* Container query based on width */
  @container (min-width: 500px) {
    .container {
      background-color: lightblue;
    }
  }    
</style>
