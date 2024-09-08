import { Level, Rider, TrialsGame } from "./GameStructGeneratedCode";
import { InputRecording } from "./InputRecording";

export async function createPhysics(): Promise<Physics> {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = '/trials/physics.js';
        document.body.appendChild(script);

        script.onload = async () => resolve(new Physics(await createPhysicsModule()));      
        script.onerror = (error) => reject(new Error(`Failed to load script: ${error}`));
    });
}

export class Physics {
    levelHeapPtr: number = 0;
    riderHeapPtr: number = 0;
    trialsGame: TrialsGame;
    level: Level;
    rider: Rider;
    inputRecording = new InputRecording();

    constructor(public module) {
        let gamePtr = module._getGamePtr();
        this.trialsGame = new TrialsGame(new DataView(module.HEAPU8.buffer, gamePtr, TrialsGame.SIZE), 0);
    }

    setData(levelData: ArrayBuffer, riderData: ArrayBuffer) {
        console.log("setData", levelData.byteLength, riderData.byteLength);
        if (this.levelHeapPtr) {
            console.log("freeing levelHeapPtr", this.levelHeapPtr);
            this.module._free(this.levelHeapPtr);
        }
        if (this.riderHeapPtr) {
            console.log("freeing riderHeapPtr", this.riderHeapPtr);
            this.module._free(this.riderHeapPtr);
        }

        const levelUint8 = new Uint8Array(levelData);
        this.levelHeapPtr = this.module._malloc(levelUint8.length);
        this.module.HEAPU8.set(levelUint8, this.levelHeapPtr);
    
        const riderUint8 = new Uint8Array(riderData);
        this.riderHeapPtr = this.module._malloc(riderUint8.length);
        this.module.HEAPU8.set(riderUint8, this.riderHeapPtr);
    
        this.module._setData(this.levelHeapPtr, this.riderHeapPtr);

        this.level = new Level(new DataView(this.module.HEAPU8.buffer, this.levelHeapPtr, levelUint8.length));
        this.rider = new Rider(new DataView(this.module.HEAPU8.buffer, this.riderHeapPtr, riderUint8.length));
    }

    tick(input: number) {
        this.inputRecording.record(input);
        this.module._tick(input);
    }

    newGame() {
        this.inputRecording.clear();
        this.module._newGame();
    }
}