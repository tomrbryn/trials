<script lang="ts">
    import { createSchema, schemaDefinition } from "../Schema.js";
    import { createLevel, levelToBinary }  from "../LevelCreator.ts";
    import { levelEntryStore } from './EditorStore';
    import { createEventDispatcher } from 'svelte';
    import { type LevelEntry } from './LevelEntry';

    let dialog: HTMLDialogElement;    
    const dispatch = createEventDispatcher();
    
    let level = $levelEntryStore;
    let levelId = level.id;
    let levelName = level.info?.name ?? "?";
    $: console.log("Level", level, levelId, levelName);

    function createNewLevelEntry(): LevelEntry {
        let newInfo = Object.assign({}, $levelEntryStore.info, {name: levelName});
        let newLevelEntry = Object.assign({}, $levelEntryStore, {info: newInfo});
        let schema = createSchema(schemaDefinition);
        let arrayBuffer = levelToBinary(schema, createLevel());
        newLevelEntry.base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
        return newLevelEntry;
    }    

    async function save() {
        if (levelId && levelId >= 0) {
            let newEntry = createNewLevelEntry();
            await fetch('/trials/api/levels/' + levelId, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(newEntry),
            });
            $levelEntryStore = newEntry;
            dispatch('close');
        }
    }

    async function saveAs() {
        let newEntry = createNewLevelEntry();
        let result = await (await fetch('/trials/api/levels', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(newEntry),
        })).json();
        newEntry.id = result.id;
        $levelEntryStore = newEntry;
        dispatch('close');
    }
</script>

<div class="levels-container">
    <h1 style="margin: 0; color: #2e7d32;">Save</h1>
    <div>Name</div>
    <input type="text" bind:value={levelName} style="width: 100%; padding: 0.5rem; font-size: 1.25rem;">
    <div style="display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1rem;">
        <button on:click={() => dialog.showModal()} class="btn" disabled={!levelId || levelId < 0}>Save</button>
        <button on:click={saveAs} class="btn">Save as copy</button>    
        <button on:click={() => dispatch("close")} class="btn">Cancel</button>
    </div>    
</div>

<dialog bind:this={dialog}>
    <p>Are you sure you want to overwrite the level?</p>
    <div class="dialog-buttons">
        <button class="btn" on:click={save}>Yes</button>
        <button class="btn" on:click={() => dialog.close()}>No</button>
    </div>
</dialog>

<style>
    .levels-container {
        flex: 1;
        padding: 1rem;
        display: flex;
        flex-direction: column;
    }

    .levels-list {
        flex: 1;
        overflow-y: auto;
        min-height: 0;
    }

    .level-item {
        display: flex;
        gap: 1rem;
        align-items: center;
        justify-content: space-between;
        background-color: #fff;
        padding: 0.5rem;
        margin-bottom: 0.5rem;
        border-radius: 5px;
    }

    .level-item:last-child {
        margin-bottom: 0;
    }    

    .level-info {
        flex-grow: 1;
        color: #424242 !important;
    }

    .level-buttons {
        display: flex;
        gap: 0.5rem;
    }

    .btn {
        font-size: 1.25rem;
        padding: 0.5rem 1rem;
        border-radius: 5px;
        background-color: #1565c0;
        color: #fff;
        /* #1565c0; */
    }
    .btn:hover {
        background-color: #ff7043;
        opacity: 0.8;
    }

    .btn:disabled {
        /* background-color: #cfd8dc; */
        background-color: #90a4ae;
        /* background-color: #cccccc; */
        cursor: not-allowed;
        color: #eee;
        /* opacity: 0.6; */
    }    

    dialog {
        border: none;
        border-radius: 5px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        padding: 1rem;
    }

    .dialog-buttons {
        display: flex;
        justify-content: flex-end;
        gap: 0.5rem;
    }    
</style>
