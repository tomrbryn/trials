<script lang="ts">
    import { Game } from "./Game";
    import { pushDialog, userStore, updateUserStore } from "./GameStore";
    import { type LevelScoreType, ticksToTimeString } from "../Utils"

// 🏆 👑 🥇  🥈  🥉    


    export let game: Game;
    let levels: LevelScoreType[] = [];

    async function fetchLevels() {
        levels = await (await fetch(`/trials/api/levels/user/${$userStore?.id ?? -1}`)).json();
    }
    fetchLevels();    


    async function handleOpen(level: LevelScoreType) {
        await game.fetchAndLoadLevel(level);
        game.play();
        pushDialog("game");
    }

    async function handleHighscores(level: LevelScoreType) {
        await game.fetchAndLoadLevel(level);
        pushDialog("levelHighscores");
    }

    const handleSignOut = async () => {
        console.log(await (await fetch('/trials/api/user/logout', {method: "POST"})).text());
        await updateUserStore();
    }

</script>

<div class="modal-overlay">
    <dialog open style="min-width: 20rem; max-width: 80%">
        <h2>Levels</h2>
        <div class="flex_row">
            <div>username: {$userStore?.username ?? "guest"}</div>
            <button class="btn" on:click={() => pushDialog("login")}>Sign in</button>
            <button class="btn" on:click={() => handleSignOut()}>Sign out</button>
        </div>
    
        <table>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Tries</th>
                    <th>Time</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                {#each levels as level}
                    <tr>
                        <td>{level.info.name}</td>
                        <td>{level.tries}</td>
                        <td>{ticksToTimeString(level.ticks)}</td>
                        <td>
                            <button class="btn" on:click={() => handleOpen(level)}><div class="icon">▶</div></button>
                            <button class="btn" on:click={() => handleHighscores(level)}><div class="icon">🏆</div></button>
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </dialog>    
</div>


<style>
</style>
