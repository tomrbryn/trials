export class InputRecording {
    public recording: number[] = [];

    record(input: number) {
        this.recording.push(input);
    }

    clear() {
        this.recording = [];
    }

    runnlengthEncode() {
        let result = [];
        let current = this.recording[0];
        let repeatCount = 0;
        let i = 1;
        while (i < this.recording.length) {
            if (this.recording[i] == current && repeatCount < 0xff) {
                repeatCount++;
            } else {
                result.push(current);
                result.push(repeatCount);
                current = this.recording[i];
                repeatCount = 0;
            }
            i++;
        }
        result.push(current);
        result.push(repeatCount);
        return result;
    }

    runnlengthDecode(data: number[]) {
        let result = [];
        for (let i = 0; i < data.length; i += 2) {
            for (let j = 0; j <= data[i + 1]; j++) {
                result.push(data[i]);
            }
        }
        return result;
    }
}

function testInputRecording() {
    let input = [1, 1, 1, 2, 1];
    let recording = new InputRecording();
    input.forEach(i => recording.record(i));
    let encoded = recording.runnlengthEncode();
    let decoded = recording.runnlengthDecode(encoded);
    console.log("InputRecording test", encoded, decoded, "==", input);
    if (input.some((val, i) => val !== decoded[i])) {
        console.error("InputRecording test failed");
        return;
    }
}
testInputRecording();
