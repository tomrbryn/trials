import type { InputRecording } from "./InputRecording";
import type { Physics } from "./Physics";

export class Playback {
    constructor(public physics: Physics, public recording: InputRecording) {
        this.physics.newGame();
    }

    getTickIdx() {
        return this.physics.trialsGame.getTickIdx();
    }

    setTickIdx(newTickIdx: number) {
        newTickIdx = Math.max(0, Math.min(newTickIdx, this.recording.recording.length));
        if (this.getTickIdx() > newTickIdx) {
            this.physics.newGame();
        }
        while (this.getTickIdx() < newTickIdx) {
            let input = this.recording.recording[this.getTickIdx()] || 0;
            this.physics.tick(input);
        }
    }
}
