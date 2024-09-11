import { setupReload } from '../ServerSideEvents';
import { createSchema, schemaDefinition } from "../Schema";
import { createLevel, levelToBinary, riderToBinary }  from "../LevelCreator";
import { GameCanvas } from './GameCanvas';
import { KeyState } from '../KeyState';
import { createPhysics, Physics } from '../Physics';
import GameUI from './Game.svelte';

console.log("Game.ts");
// don't show default context menu in browser
document.addEventListener('contextmenu', (event) => event.preventDefault());
document.addEventListener('DOMContentLoaded', async () => {
    setupReload();
    let physics = await createPhysics();
    let game = new Game(physics);
    new GameUI({target: document.body, props: {game}});
});

export class Game {
    constructor(public physics: Physics) {
    }

    start(c: HTMLCanvasElement) {
        let canvas = new GameCanvas(c);
        let keyState = new KeyState(pressEvent => {
            if (pressEvent.key == "Enter") {
                this.physics.newGame();
            }
        });
    
        let schema = createSchema(schemaDefinition);
        let levelData = levelToBinary(schema, createLevel());
        let riderData = riderToBinary(schema);
        this.physics.setData(levelData, riderData);
    
        const step = (timeStampMs: number) => {
            this.physics.tick(keyState.encodeGameInput());
            canvas.paint(this.physics.trialsGame, this.physics.level, this.physics.rider);
            requestAnimationFrame(step);
        }
    
        requestAnimationFrame(step);
    }
}
