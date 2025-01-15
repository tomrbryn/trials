<script>
    import { popDialog } from './GameStore';
    let username = "";
    let password = "";
    let confirmPassword = "";
    let error = "";
    $: error = username !== password ? "Passwords do not match!" : "";

    function reset() {
        username = "";
        password = "";
        confirmPassword = "";
    }

    const createAccount = async () => {
        if (password === confirmPassword) {
            console.log("Creating account with username:", username);
            let response = await fetch("/trials/user/register", {
                method: "POST",
                headers: {"Content-Type": "application/json",},
                body: JSON.stringify({username, password}),
            });
            if (response.ok) {
                console.log("Login successful", await response.text());
                popDialog()
            } else {
                error = (await response.json()).error;
                console.log("Login failed", error);
                reset();
            }
        }
    }
</script>

<style>
    .actions {
        margin-top: 1rem;
        display: flex;
        justify-content: space-between;
    }
    button {
        padding: 0.5rem 1rem;
        cursor: pointer;
        border: none;
        border-radius: 5px;
    }
    .hidden {
        visibility: hidden;
    }
</style>

<div class="modal-overlay" on:click={() => popDialog()}>
    <dialog style="max-width: 28rem;" open class="modal-content flex_column" on:click|stopPropagation>
        <h2>Create an Account</h2>
        <form on:submit|preventDefault={createAccount}>
            <div class="tiny_text">Username</div>
            <input class="grow_input" type="text" bind:value={username} required />
            <div class="tiny_text">Password</div>
            <input class="grow_input" type="password" bind:value={password} required />
            <div class="tiny_text">Confirm Password</div>
            <input class="grow_input" type="password" bind:value={confirmPassword} required />
            <div class="form_error" class:hidden={error === ""}>Error: {error}</div>
            <div class="dialog-buttons">
                <button class="btn" type="submit">Create Account</button>
                <button class="btn" type="button" on:click={() => popDialog()}>Cancel</button>
            </div>
        </form>
    </dialog>
</div>

