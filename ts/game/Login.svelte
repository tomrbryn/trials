<script>
    import { createEventDispatcher } from 'svelte';
    import { dialogStackTop, popDialog, popPushDialog, updateUserStore } from './GameStore';
    const dispatch = createEventDispatcher();

    let username = "";
    let password = "";

    function reset() {
        username = "";
        password = "";
    }

    const login = async () => {
        let response = await fetch("/trials/user/login", {
            method: "POST",
            headers: {"Content-Type": "application/json",},
            body: JSON.stringify({username, password}),
        });
        if (response.ok) {
            await updateUserStore();
            popDialog();
        } else {
            console.log("Login failed", await response.text());
            reset();
        }
    }
</script>

<div class="modal-overlay" on:click={() => popDialog()}>
    <dialog style="max-width: 28rem;" open on:click|stopPropagation>
        <h2>Login</h2>
        <form on:submit|preventDefault={login}>
            <div class="tiny_text">Name:</div>
            <input class="grow_input" type="text" bind:value={username} required />
            <div class="tiny_text">Password:</div>
            <input class="grow_input" type="password" bind:value={password} required />
            <a href="#" on:click={() => popPushDialog("createAccount")}>Create account...</a> 
            <div class="dialog-buttons">
                <button class="btn" type="submit">Login</button>
                <button class="btn" type="button" on:click={() => popDialog()}>Cancel</button>
            </div>
        </form>
    </dialog>
</div>

<style>
    .flex_column {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }
</style>
