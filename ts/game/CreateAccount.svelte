<script>
    export let onCancel;
    export let onCreateAccount;

    let nick = "";
    let password = "";
    let confirmPassword = "";

    function handleCreateAccount() {
        if (password === confirmPassword) {
            console.log("Creating account with nick:", nick);
            onCreateAccount();
        } else {
            alert("Passwords do not match!");
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
</style>

<h2>Create an Account</h2>
<form on:submit|preventDefault={handleCreateAccount}>
    <label>
        Nickname:
        <input type="text" bind:value={nick} required />
    </label>
    <br />
    <label>
        Password:
        <input type="password" bind:value={password} required />
    </label>
    <br />
    <label>
        Confirm Password:
        <input type="password" bind:value={confirmPassword} required />
    </label>
    <div class="actions">
        <button type="submit">Create Account</button>
        <button type="button" on:click={onCancel}>Back to Login</button>
    </div>
</form>
