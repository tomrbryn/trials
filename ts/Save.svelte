<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { type LevelEntry, type RiderEntry } from './Entry.js';
    import Dialog from "./Dialog.svelte";

    let dialog: Dialog;
    const dispatch = createEventDispatcher();
    
    export let crudEndpoint: string;
    export let entry: LevelEntry | RiderEntry;
    export let createNewEntry: (entryName: string) => LevelEntry | RiderEntry;
    $: entryId = entry.id;
    let entryName = entry.info?.name ?? "?";

    const confirmSave = () => dialog.showConfirmationDialog("Save", "Are you sure you want to overwrite?", save);

    async function save() {
        if (entryId && entryId >= 0) {
            let newEntry = createNewEntry(entryName);
            await fetch(crudEndpoint + '/' + entryId, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(newEntry),
            });
            dispatch('save', newEntry);
        }
    }

    async function saveAs() {
        let newEntry = createNewEntry(entryName);
        console.log('saveAs', crudEndpoint, newEntry);
        let result = await (await fetch(crudEndpoint, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(newEntry),
        })).json();
        newEntry.id = result.id;
        dispatch('save', newEntry);
    }
</script>

<div class="container">
    <h1 style="margin: 0; color: #2e7d32;">Save</h1>
    <div>Name</div>
    <input type="text" bind:value={entryName} class="input">
    <div class="buttons">
        <button on:click={confirmSave} class="btn" disabled={!entryId || entryId < 0}>Save</button>
        <button on:click={saveAs} class="btn">Save as copy</button>    
        <button on:click={() => dispatch("close")} class="btn">Cancel</button>
    </div>    
</div>

<Dialog bind:this={dialog}></Dialog>

<style>
    .container {
        flex: 1;
        padding: 1rem;
        display: flex;
        flex-direction: column;
    }
    .input {
        width: 100%; 
        padding: 0.5rem; 
        font-size: 1.25rem;        
    }

    .buttons {
        display: flex; 
        justify-content: flex-end; 
        gap: 0.5rem; 
        margin-top: 1rem;        
    }
</style>
