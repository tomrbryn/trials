<script lang="ts">
    import { levelEntryStore } from './EditorStore';
    import { createEventDispatcher } from 'svelte';

    let levels = [];
    let dialog: HTMLDialogElement;    
    let levelToDelete: any = null;
    const dispatch = createEventDispatcher();

    console.log("Open level", $levelEntryStore);


    async function fetchLevels() {
        levels = await (await fetch('/trials/api/levels')).json();
    }
    fetchLevels();


    function prettyDate(dateIso: string): string {
        function pluralize(value: number, unit: string): string {
            return `${value} ${unit}${value === 1 ? '' : 's'} ago`;
        }    

        if (dateIso) {
            let date = new Date(dateIso)
            let diff = (new Date().getTime() - date.getTime()) / 1000 / 60;
            if (diff < 1) return "just now";
            if (diff < 60) return pluralize(diff.toFixed(0), 'minute');
            if (diff < 60 * 24) return pluralize((diff / 60).toFixed(0), 'hour');
            return date.getDate() + " " + date.toLocaleString('default', { month: 'short' }) + " " + date.getFullYear();
        }
        return "";
    }

    async function handleOpen(level) {
        // fetch level data
        let data = await (await fetch('/trials/api/levels/' + level.id)).json();
        console.log("Open level", level, data);
        $levelEntryStore = data;
        console.log("levelStore", $levelEntryStore);
        dispatch('close');
    }

    function confirmDelete(level) {
        levelToDelete = level;
        dialog.showModal();
    }

    async function handleDelete() {
        if (levelToDelete) {
            console.log("Delete level", levelToDelete);
            await fetch('/trials/api/levels/' + levelToDelete.id, { method: 'DELETE' });
            fetchLevels();
            levelToDelete = null;
        }
        dialog.close();
    }

    function cancelDelete() {
        levelToDelete = null;
        dialog.close();
    }</script>


<div class="levels-container">
    <h1 style="margin: 0; color: #2e7d32;">Levels <button class="refresh" on:click={fetchLevels}>↻</button></h1>
    
    
    <div class="levels-list">
        {#each levels as level (level.id)}
            <div class="level-item">
                <div class="level-info">
                    {level.info.name} {prettyDate(level.info.created)}
                </div>
                <div class="level-buttons">
                    <button class="btn" on:click={() => handleOpen(level)}>📂</button>
                    <button class="btn btn-trash" on:click={() => confirmDelete(level)}>🗑️</button>
                </div>
            </div>
        {/each}
    </div>
</div>

<dialog bind:this={dialog}>
    <p>Are you sure you want to delete this level?</p>
    <div class="dialog-buttons">
        <button class="btn" on:click={handleDelete}>Yes</button>
        <button class="btn btn-trash" on:click={cancelDelete}>No</button>
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
        /* #1565c0; */
    }
    .btn:hover {
        background-color: #ff7043;
    }

    .btn-trash {
        /* background-color: #dc3545; */
    }

    .btn:hover {
        opacity: 0.8;
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
