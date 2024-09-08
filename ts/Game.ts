import { setupReload } from './ServerSideEvents';
import { createSchema, schemaDefinition } from "./Schema";
import { createLevel, levelToBinary, riderToBinary }  from "./LevelCreator";
import { GameCanvas } from './GameCanvas';
import { KeyState } from './KeyState';
import { createPhysics, Physics } from './Physics';

(async () => {
    setupReload();
    let physics = await createPhysics();
    startGame(physics);
})();

function startGame(physics: Physics) {
    let keyState = new KeyState(pressEvent => {
        if (pressEvent.key == "Enter") {
            physics.newGame();
        }
    });

    let schema = createSchema(schemaDefinition);
    let levelData = levelToBinary(schema, createLevel());
    let riderData = riderToBinary(schema);
    physics.setData(levelData, riderData);

    const canvas = new GameCanvas(document.getElementById("gameCanvas"));

    function step(timeStampMs: number) {
        physics.tick(keyState.encodeGameInput());
        canvas.paint(physics.trialsGame, physics.level, physics.rider);
        requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
}
