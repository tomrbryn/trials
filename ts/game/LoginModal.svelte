<script>
    import CreateAccount from './CreateAccount.svelte'; // Import the Create Account component

    let showModal = true;
    let isCreatingAccount = false;

    let nick = "";
    let password = "";

    function toggleModal() {
        showModal = !showModal;
        if (!showModal) {
            nick = "";
            password = "";
            isCreatingAccount = false;
        }
    }

    function handleLogin() {
        console.log("Logging in with nick:", nick);
        toggleModal();
    }

    function switchToCreateAccount() {
        isCreatingAccount = true;
    }

    function switchToLogin() {
        isCreatingAccount = false;
    }
</script>

<style>
    dialog {
        padding: 2rem;
        border: 1px solid #ccc;
        border-radius: 10px;
    }
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .modal-content {
        background-color: white;
        padding: 2rem;
        border-radius: 10px;
        max-width: 400px;
        width: 100%;
    }
    .actions {
        margin-top: 1rem;
        display: flex;
        justify-content: space-between;
    }
    .modal-toggle {
        margin-bottom: 10px;
    }
    button {
        padding: 0.5rem 1rem;
        cursor: pointer;
        border: none;
        border-radius: 5px;
    }
</style>

<button class="modal-toggle" on:click={toggleModal}>
    {isCreatingAccount ? "Create Account" : "Login"}
</button>

{#if showModal}
    <div class="modal-overlay" on:click={toggleModal}>
        <dialog open class="modal-content" on:click|stopPropagation>
            {#if isCreatingAccount}
                <CreateAccount on:cancel={switchToLogin} on:createAccount={toggleModal} />
            {:else}
                <h2>Login</h2>
                <form on:submit|preventDefault={handleLogin}>
                    <label>
                        Nickname:
                        <input type="text" bind:value={nick} required />
                    </label>
                    <br />
                    <label>
                        Password:
                        <input type="password" bind:value={password} required />
                    </label>
                    <div class="actions">
                        <button type="submit">Login</button>
                        <button type="button" on:click={switchToCreateAccount}>Create Account</button>
                    </div>
                </form>
            {/if}
        </dialog>
    </div>
{/if}
