<script lang="ts">
    import { onMount } from 'svelte';

    type LevelType = {
        info: any;
        tries: number;
        ticks: number;
    }
    let levels: LevelType[] = [];
    let dialog: HTMLDialogElement;

    function openModal() {
        dialog.showModal();
    }

    function closeModal() {
        dialog.close();
    }

    async function fetchLevels() {
        levels = await (await fetch('/trials/api/levels/user/0')).json();
        console.log("Levels2", levels);
    }
    fetchLevels();    

    onMount(() => {
        console.log("LevelList mounted");
        dialog.showModal();
    });

    console.log("LevelList.svelte2");
</script>


<button on:click={openModal}>Show Levels</button>

<div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; z-index: 1000;">
    <dialog bind:this={dialog}>
        <h2>Levels</h2>
        <table>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Tries</th>
                    <th>Time</th>
                </tr>
            </thead>
            <tbody>
                {#each levels as level}
                    <tr>
                        <td>{level.info.name}</td>
                        <td>{level.tries}</td>
                        <td>{level.ticks}</td>
                    </tr>
                {/each}
            </tbody>
        </table>
        <button on:click={closeModal}>Close</button>
    </dialog>    
</div>


<style>
    dialog {
        border: none;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        padding: 20px;
        z-index: 1000;
    }
    table {
        width: 100%;
        border-collapse: collapse;
    }
    th, td {
        border: 1px solid #ddd;
        padding: 8px;
    }
    th {
        background-color: #f2f2f2;
    }
</style>
