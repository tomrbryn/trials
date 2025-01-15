<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { prettyDate } from './Utils';
    import type { LevelEntry } from './Entry';
    import Dialog from './Dialog.svelte';

    export let title: string;
    export let crudEndpoint: string;

    let entries: LevelEntry[] = [];
    let dialog: Dialog | undefined;
    const dispatch = createEventDispatcher();


    async function fetchEntries() {
        entries = await (await fetch(crudEndpoint)).json();
    }
    fetchEntries();

    async function handleOpen(partialEntry: LevelEntry) {
        dispatch('open', await (await fetch(crudEndpoint + "/" + partialEntry.id)).json());
    }

    function confirmDelete(level: LevelEntry) {
        dialog?.showConfirmationDialog("Delete level", "Are you sure you want to delete this level?", () => handleDelete(level));
    }

    async function handleDelete(level: LevelEntry) {
        if (level) {
            await fetch(crudEndpoint + "/" + level.id, { method: 'DELETE' });
            fetchEntries();
        }
    }
</script>

<div class="entrylist-panel">
    <h1 style="margin: 0; color: #2e7d32;">{title} <button class="refresh" on:click={fetchEntries}>↻</button></h1>
    <div class="entrylist-items">
        {#each entries as level (level.id)}
            <div class="entrylist-item">
                <div class="entrylist-item-info">
                    <div class="entrylist-item-date">
                        {prettyDate(level.info.created)}
                    </div>
                    <div>
                        {level.info.name} 
                    </div>
                    
                </div>
                <div class="entrylist-item-buttons">
                    <button class="btn" on:click={() => handleOpen(level)}>📂</button>
                    <button class="btn btn-trash" on:click={() => confirmDelete(level)}>🗑️</button>
                </div>
            </div>
        {/each}
    </div>
</div>

<Dialog bind:this={dialog}></Dialog>

<style>
/* Titled list used in Open with a date, name and buttons for each item */
.entrylist-panel {
    flex: 1;
    padding: 1rem;
    display: flex;
    flex-direction: column;
}
.entrylist-items {
    flex: 1;
    overflow-y: auto;
    min-height: 0;
}
.entrylist-item {
    display: flex;
    gap: 1rem;
    align-items: center;
    justify-content: space-between;
    background-color: #fff;
    padding: 0.5rem;
    margin-bottom: 0.5rem;
    border-radius: 5px;
}
.entrylist-item:last-child {
    margin-bottom: 0;
}
.entrylist-item-info {
    flex-grow: 1;
    color: #424242 !important;
}
.entrylist-item-date {
    font-size: 0.85rem;
    font-weight: 600;
    padding-bottom: 0.25rem;        
}
.entrylist-item-buttons {
    display: flex;
    gap: 0.5rem;
}

</style>
