<script lang='ts'>
    import { onMount } from 'svelte';

    let type: "message" | "confirmation" = "message";
    let title = "title"
    let message = "message";
    let show = false;
    let callback = () => {};
    let dialogContent: HTMLDivElement;

    export async function showMessageDialog(newTitle: string, newMessage: string) {
        type = "message";
        title = newTitle;
        message = newMessage;
        show = true;
    }    

    export async function showConfirmationDialog(newTitle: string, newMessage: string, newCallback: () => void) {
        type = "confirmation";
        title = newTitle;
        message = newMessage;
        callback = newCallback;
        show = true;
    }    

    function close() {
        show = false;
    }

    function handleClickOutside(event) {
        if (dialogContent && !dialogContent.contains(event.target)) {
            close();
        }
    }

    onMount(() => {
        let closeOnEsc = (event) => {
            if (show) {
                if (event.key === "Enter" && type === "confirmation") {
                    callback();
                }
                if (event.key === 'Escape' || event.key === 'Enter') {
                    event.preventDefault();
                    console.log("close");
                    close();
                }
            }
        };
        window.addEventListener('keydown', closeOnEsc);
        return () => window.removeEventListener('keydown', closeOnEsc);
    });    

</script>
{#if show}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="error-dialog" on:click={handleClickOutside}>
        <div class="dialog-content" bind:this={dialogContent}>
            <div class="title_font">{title}</div>
            <div style="overflow-y: auto; min-height: 0; margin: 1rem 0;">
                {@html message}
            </div>

            <div class="dialog-buttons">
                {#if type === "confirmation"}
                    <button on:click={() => { callback(); close(); }} class="btn">Yes</button>
                    <button on:click={close} class="btn">No</button>
                {:else}
                    <button on:click={close} class="btn">Close</button>
                {/if}
            </div>
        </div>
    </div>
{/if}

<style>
.error-dialog {
    /* Position the dialog on top of everything */
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5); /* Semi-transparent background */
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999; /* High z-index to make sure it's on top */
}

.dialog-content {
    /* Style the dialog content */
    background: var(--bg1);
    padding: 2rem;
    border-radius: 1rem;
    max-height: 100%;
    max-width: 90%;
    display: flex;
    flex-direction: column;
}

.dialog-buttons {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin-top: 1rem;
}
</style>