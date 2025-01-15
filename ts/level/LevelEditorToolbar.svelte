<script lang="ts">
    import { Editor } from './LevelEditor';
    import { scaleFactorStore } from '../EditorStore';
    import { modeStore, modes, levelEntryStore } from './LevelEditorStore';
    import { createSchema, schemaDefinition } from "../Schema.js";
    import { levelToBinary }  from "../LevelCreator.js";
    import { createEventDispatcher } from 'svelte';
    import { type LevelEntry } from '../Entry.js';
    import Open from '../Open.svelte';
    import Save from '../Save.svelte';
    import Grid from '../Grid.svelte';
    
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
        addCheckpoint:"🚩",
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

    function openCallback(event) {
        $levelEntryStore = event.detail;
        showOpen = false;        
    }

    async function toggleSaveMenu() {
        showSave = !showSave;
        if (showSave) {
            showOpen = false;
            showGrid = false;
        }
    }
    
    function saveCallback(event) {
        $levelEntryStore = event.detail;
        showSave = false;        
    }
    
    async function toggleGridMenu(event) {
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


    function createNewEntry(entryName: string): LevelEntry {
        let newInfo = Object.assign({}, $levelEntryStore.info, {name: entryName});
        let newLevelEntry = Object.assign({}, $levelEntryStore, {info: newInfo});
        let schema = createSchema(schemaDefinition);
        let arrayBuffer = levelToBinary(schema, $levelEntryStore.json);
        newLevelEntry.base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
        console.log("createNewEntry", newLevelEntry);
        return newLevelEntry;
    }    

</script>

<div class="toolbar">
    <div style="height: 1rem"></div>
    <button on:click|preventDefault|stopPropagation={() => dispatch("new")} class="toolbar_btn">
        <div class="icon">📄</div>
    </button>
    <button on:mousedown|preventDefault|stopPropagation={toggleOpenMenu} class="toolbar_btn" class:selected={showOpen}>
        <div class="icon">📂</div>
        <div class="toolbar_btn-arrow">►</div>
    </button>
    <button on:mousedown|preventDefault|stopPropagation={toggleSaveMenu} class="toolbar_btn" class:selected={showSave}>
        <div class="icon">💾</div>
        <div class="toolbar_btn-arrow">►</div>
    </button>
    <button on:click|preventDefault|stopPropagation={() => dispatch("undo")} class="toolbar_btn">
        <div class="icon">↺</div>
    </button>
    <button on:click|preventDefault|stopPropagation={() => dispatch("redo")} class="toolbar_btn">
        <div class="icon">↻</div>
    </button>
    <button on:click|preventDefault|stopPropagation={() => dispatch("play")} class="toolbar_btn">
        <div class="icon">▶</div>
    </button>
    <button bind:this={gridButton} on:mousedown|preventDefault|stopPropagation={toggleGridMenu} class="toolbar_btn" class:selected={showGrid}>
        <div class="icon">#</div>
        <div class="toolbar_btn-arrow">►</div>
    </button>
    <div style="height: 1rem"></div>
    <hr>
    <div style="height: 1rem"></div>
    {#each modes as mode}
        <button class="toolbar_btn" class:mode_selected={$modeStore == mode} on:click|preventDefault|stopPropagation={() => $modeStore = mode}>
            <div class="icon"> {@html modeMap[mode] || mode}</div>
        </button>
    {/each}

    <button class="toolbar_btn" style="margin-top: auto; text-align: center;">
        <div class="icon2" style="padding: 0.5rem 0;">🔍️ {toPercent($scaleFactorStore)}</div>
    </button>
    {#if showOpen}
        <div class="toolbar_btn-big-menu" bind:this={openMenu}>
            <Open title="Levels" crudEndpoint='/trials/api/levels' on:open={openCallback} />
        </div>
    {/if}        
    <div class="toolbar_btn-small-menu" class:hidden={!showGrid} bind:this={gridMenu}>
        <Grid on:close={() => showGrid = false} />
    </div>

    {#if showSave}
        <div class="toolbar_btn-small-menu" bind:this={saveMenu}>
            <Save crudEndpoint={"/trials/api/levels"} entry={$levelEntryStore} createNewEntry={createNewEntry} on:save={saveCallback} />
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



    .toolbar_btn {
        padding: 0.25rem;
        position: relative;
        display: inline-block;
    }
    .toolbar_btn:hover {
        /* background-color: #e8f5e9; */
        background-color: var(--bg-hover);
        /* background-color: #b3c7d4; */
        /* background-color: #a9d4cb; */
    }

    .toolbar_btn-arrow {
        position: absolute;
        top: 50%;
        right: 5%;
        transform: translateY(-50%);
        white-space: nowrap;
    }
    .selected {
        background-color: #e8f5e9;
    }
    .toolbar_btn-big-menu {
        display: flex;
        background-color: var(--bg1);
        position: absolute;
        top: 5%;
        left: 100%;
        white-space: nowrap;
        max-height: 90%;
    }
    .toolbar_btn-small-menu {
        background-color: #e8f5e9;
        position: absolute;
        top: 0;
        left: 100%;
        white-space: nowrap;
    }
    .hidden {
        visibility: hidden;
    }

  /* Container query based on width */
  @container (min-width: 500px) {
    .container {
      background-color: lightblue;
    }
  }    
</style>
