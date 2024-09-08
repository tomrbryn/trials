import type { Level } from "../LevelCreator";

export type LevelInfo = {
    name: string,
    created?: "string",
    updated?: "string",
}

export type LevelEntry = {
    id: number,
    info: LevelInfo,
    json: Level,
    base64: string,
}

export function createDefaultLevelEntry(): LevelEntry {
    return {
        id: -1,
        info: {
            name: "New Level",
        },
        json: {
            lineArrays: [[
                [-1100, 0],
                [ 1100, 0],
            ]],
            checkpoints: [
                [-1000, 0],
                [1000, 0],
            ],
            circles: [],
            offset: [0, 0]
        },
        base64: "",
    };
}