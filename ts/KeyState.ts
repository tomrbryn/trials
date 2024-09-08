export const INPUT_LEFT = 1 << 0;
export const INPUT_RIGHT = 1 << 1;
export const INPUT_UP = 1 << 2;
export const INPUT_DOWN = 1 << 3;
export const INPUT_CHECKPOINT = 1 << 4;

export class KeyState {
    
    keys = {};

    constructor(keydownCallback: ((event: KeyboardEvent) => void) | null = null) {
        window.addEventListener('keydown', (event) => {
            this.keys[event.key] = true;
            if (keydownCallback) {
                keydownCallback(event);
            }
        });    
        window.addEventListener('keyup', (event) => this.keys[event.key] = false);
    }

    encodeGameInput(): number {
        let input = 0;
        if (this.keys["w"] || this.keys["ArrowUp"]) input |= INPUT_UP;
        if (this.keys["a"] || this.keys["ArrowLeft"]) input |= INPUT_LEFT;
        if (this.keys["s"] || this.keys["ArrowDown"]) input |= INPUT_DOWN;
        if (this.keys["d"] || this.keys["ArrowRight"]) input |= INPUT_RIGHT;
        if (this.keys["c"] || this.keys["Backspace"]) input |= INPUT_CHECKPOINT;
        return input;        
    }
}
