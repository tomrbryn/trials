<script lang="ts">
    import { Game } from "./Game";
    import { currentLevelScoreStore, currentLevelStore, popDialog, popPushDialog, pushDialog } from "./GameStore";
    import { InputRecording } from "../InputRecording";
    import { ticksToTimeString } from "../Utils";

    export let game: Game;
    let highscores = [];

    async function fetchHighscores() {
        highscores = await (await fetch(`/trials/highscores/${$currentLevelScoreStore.id}`)).json();
    }
    fetchHighscores();    

    function handlePlay() {
        game.play();
        pushDialog("game");
    }

    async function handleReplay(highscore) {
        let inputRecordingBinary: ArrayBuffer = await (await fetch(`/trials/highscores/${highscore.id}/inputRecording`)).arrayBuffer();
        let inputRecordingUint8Array: Uint8Array = new Uint8Array(inputRecordingBinary);
        let inputRecordingList: number[] = Array.from(inputRecordingUint8Array);
        let inputRecording = InputRecording.runnlengthDecode(inputRecordingList);
        game.replay(inputRecording);
        pushDialog("game");
    }
</script>

<div class="modal-overlay">
    <dialog open style="min-width: 20rem; max-width: 80%">
        <h2>Highscores {$currentLevelStore?.info?.name ?? "Level not selected"}</h2>
        <table>
            <thead>
                <tr>
                    <th>Rank</th>
                    <th>Name</th>
                    <th>Tries</th>
                    <th>Time</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                {#each highscores as highscore}
                    <tr>
                        <td>{highscore.rank}</td>
                        <td>{highscore.username}</td>
                        <td>{highscore.tries}</td>
                        <td>{ticksToTimeString(highscore.ticks)}</td>
                        <td>
                            <button class="btn" on:click={() => handleReplay(highscore)}><div class="icon">▶</div></button>
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
        <button class="btn" on:click={handlePlay}>Play</button>
        <button class="btn" on:click={() => popDialog()}>Back</button>
    </dialog>
</div>