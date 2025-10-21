import type { InputRecording } from "./InputRecording";
import type { JsonPhysics } from "./JsonPhysics";
import type { Physics } from "./Physics";

export class Playback {

    iterationIdx: number = 0;

    constructor(public physics: Physics | JsonPhysics, public recording: InputRecording) {
        this.physics.newGame();
    }

    getTickIdx() {
        return this.physics.trialsGame.getTickIdx();
    }

    setTickIdx(newTickIdx: number) {
        newTickIdx = Math.max(0, Math.min(newTickIdx, this.recording.recording.length));
        // if (this.getTickIdx() > newTickIdx) {
        //     this.physics.newGame();
        // }
        // while (this.getTickIdx() < newTickIdx) {
        //     let input = this.recording.recording[this.getTickIdx()] || 0;
        //     this.physics.tick(input);
        // }
        this.set(newTickIdx, this.iterationIdx);
    }

    setIterationIdx(iterationIdx: number) {
        this.set(this.getTickIdx(), iterationIdx);
    }

    set(newTickIdx: number, newIterationIdx: number) {
        this.iterationIdx = newIterationIdx;
        this.physics.newGame();
        while (this.getTickIdx() < newTickIdx-1) {
            let input = this.recording.recording[this.getTickIdx()] || 0;
            this.physics.tick(input);
        }
        if (this.physics.riderCreator) {
            let input = this.recording.recording[this.getTickIdx()] || 0;
            if (this.iterationIdx > 0) {
                console.log("tickStart");
                this.physics.tickStart(input);
                let iterations = Math.min(this.iterationIdx-1, this.physics.riderCreator.iterations * 2);
                console.log("iterations", iterations);
                while (iterations > 0) {
                    // this.physics.doIteration();
                    console.log("updateConstraints")
                    this.physics.updateConstraints();
                    if (--iterations > 0) {
                        console.log("collisionDetectionAndResponse")
                        this.physics.collisionDetectionAndResponse();
                        this.physics.iteration++;
                    }
                    iterations--;                    
                }
            }
            this.physics.tickEnd();
        }
    }
}
