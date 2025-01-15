import { setupReload } from '../ServerSideEvents';
import { createSchema, schemaDefinition } from "../Schema";
import { createLevel, levelToBinary, riderToBinary }  from "../LevelCreator";
import { GameCanvas } from './GameCanvas';
import { KeyState } from '../KeyState';
import { createPhysics, Physics } from '../Physics';
import GameUI from './Game.svelte';
import { currentLevelStore, currentLevelScoreStore, dialogStackTop, popDialog, pushDialog, updateUserStore, userStore, physicsLevelStore, playbackStore, playbackTickStore, playbackPlayingStore } from './GameStore';
import { get } from 'svelte/store';
import { base64ToArrayBuffer, numbersToBase64, type Highscore, type LevelScoreType } from '../Utils';
import type { InputRecording } from '../InputRecording';
import { RiderCreator } from '../RiderCreator';
import { Playback } from '../Playback';


// don't show default context menu in browser
document.addEventListener('contextmenu', (event) => event.preventDefault());
document.addEventListener('DOMContentLoaded', async () => {
    setupReload();
    await updateUserStore();
    Game.instance.physics = await createPhysics();
    new GameUI({target: document.body, props: {game: Game.instance}});
});

playbackTickStore.subscribe(tick => {
    let playback = get(playbackStore);
    if (tick !== null && playback) {
        // console.log("game update playback tick", tick, playback.getTickIdx());
        playback.setTickIdx(tick);
    }
});

export class Game {


    static async loadLevel(level: LevelScoreType) {
        let data = await (await fetch('/trials/api/levels/' + level.id)).json();
        Game.instance.loadLevel(base64ToArrayBuffer(data.base64));
        currentLevelStore.set(level);
        currentLevelScoreStore.set(level);
        console.log("loadLevel", level);
    }
    

    static instance: Game = new Game();

    physics: Physics
    riderData: ArrayBuffer;
    

    start(c: HTMLCanvasElement) {
        let canvas = new GameCanvas(c);
        let keyState = new KeyState(pressEvent => {
            if (pressEvent.key == "Enter") {
                this.physics.newGame();
            } else  if (pressEvent.key == "Escape") {
                popDialog();
            }
        });
    
        let schema = createSchema(schemaDefinition);
        let levelData = levelToBinary(schema, createLevel());
        this.riderData = riderToBinary(schema, new RiderCreator().createDefault());
        this.physics.setData(levelData, this.riderData);

        let prevState = -1;
    
        const step = (timeStampMs: number) => {
            let playback = get(playbackStore);
            if (playback) {
                if (get(playbackPlayingStore)) {                    
                    playback.setTickIdx(playback.getTickIdx() + 1);
                    playbackTickStore.set(playback.getTickIdx());
                }
            } else {
                let input = keyState.encodeGameInput();
                this.physics.tick(input);
                let state = this.physics.trialsGame.getState();
                if (state != prevState) {
                    let user = get(userStore);
                    if (state == 2 && user) {
                        // finished
                        let ticks = this.physics.trialsGame.getTickIdx();
                        let tries = this.physics.trialsGame.getTries();
                        let encodedRecording = this.physics.inputRecording.runlengthEncode();
                        //let inputRecording = new Uint8Array(encodedRecording);
                        let encodedBase64 = numbersToBase64(encodedRecording);
    
                        // max 30 minutes and 1000 tries
                        let maxTicks = 30 * 60 * 60;
                        let highscore: Highscore = {
                            userId: user.userId,
                            levelId: get(currentLevelStore).id,
                            score: ticks + tries * maxTicks,
                            ticks: ticks,
                            tries: tries,
                            inputRecording: encodedBase64
                        };
                        // post highscore
                        fetch("/trials/api/highscores", {
                            method: 'POST',
                            headers: {'Content-Type': 'application/json'},
                            body: JSON.stringify(highscore)
                        });
                    }
                    prevState = state;
                }    
            }

            canvas.paint(this.physics.trialsGame, this.physics.level, this.physics.rider);
            requestAnimationFrame(step);
        }
    
        requestAnimationFrame(step);
    }

    loadLevel(levelData: ArrayBuffer) {
        this.physics.setData(levelData, this.riderData);
    }

    play() {
        playbackStore.set(null);
        this.physics.newGame();
    }

    replay(inputRecording: InputRecording) {
        console.log("replay", inputRecording);
        playbackStore.set(new Playback(this.physics, inputRecording));
        playbackPlayingStore.set(true);
    }
}
