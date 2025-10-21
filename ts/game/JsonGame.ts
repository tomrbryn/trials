import { type CreatorLevel }  from "../LevelCreator";
import { GameCanvas } from './GameCanvas';
import { KeyState } from '../KeyState';
import { currentLevelStore, currentLevelScoreStore, popDialog, userStore, playbackStore, playbackTickStore, playbackPlayingStore, playbackIterationStore } from './GameStore';
import { get } from 'svelte/store';
import { base64ToArrayBuffer, numbersToBase64, type Highscore, type LevelScoreType } from '../Utils';
import { InputRecording } from '../InputRecording';
import { Playback } from '../Playback';
import { JsonPhysics } from '../JsonPhysics';


console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaa");

export class JsonGame {

    async fetchAndLoadLevel(level: LevelScoreType) {
        let data = await (await fetch('/trials/api/levels/' + level.id)).json();
        this.loadLevel(base64ToArrayBuffer(data.base64), data.json);
        currentLevelStore.set(level);
        currentLevelScoreStore.set(level);
        console.log("json loadLevel", level, data.json);
    }

    physics: JsonPhysics = new JsonPhysics();

    constructor() {
        playbackTickStore.subscribe(tick => {
            let playback = get(playbackStore);
            if (tick !== null && playback) {
                playback.setTickIdx(tick, get(playbackIterationStore));
            }
        });
        playbackIterationStore.subscribe(iteration => {
            let playback = get(playbackStore);
            if (playback) {
                playback.setIterationIdx(iteration);
            }
        });

    }

    start(c: HTMLCanvasElement) {
        let canvas = new GameCanvas(c);
        let keyState = new KeyState(pressEvent => {
            if (pressEvent.key == "Enter") {
                this.play();
            } else  if (pressEvent.key == "Escape") {
                popDialog();
            }
        });
    
        let prevState = -1;
    
        const step = (timeStampMs: number) => {
            let playback = get(playbackStore);
            if (playback) {
                if (get(playbackPlayingStore)) {
                    let nextTickIdx = (playback.getTickIdx() + 1) % playback.recording.recording.length;
                    playback.setTickIdx(nextTickIdx, get(playbackIterationStore));
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

                        this.replay(new InputRecording(this.physics.inputRecording.recording.slice()));
                    }
                    prevState = state;
                }    
            }

            canvas.paint(this.physics.trialsGame, this.physics.level, this.physics.getRider());
            requestAnimationFrame(step);
        }
    
        requestAnimationFrame(step);

        this.play();
    }

    loadLevel(levelData: ArrayBuffer, jsonLevel: CreatorLevel) {
        this.physics.setData(jsonLevel);
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

    togglePlayback() {
        console.log("JsonGame.togglePlayback");
        let playback = get(playbackStore);
        if (playback) {
            this.play();
        } else {
            this.replay(new InputRecording(this.physics.inputRecording.recording.slice()));
        }
    }
}
