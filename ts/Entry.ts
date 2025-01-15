import { RiderCreator } from "./RiderCreator";
import type { Level } from "./LevelCreator";

export type EntryInfo = {
    name: string,
    created?: "string",
    updated?: "string",
}

export type Entry = {
    id: number,
    info: EntryInfo,
    base64: string,
}

export type LevelEntry = {
    json: Level,
} & Entry

export function createDefaultLevelEntry(): LevelEntry {
    return {
        id: -1,
        info: {
            name: "New Level",
        },
        json: {
            lineArrays: [[
                [-2200, 0],
                [ 2200, 0],
            ]],
            checkpoints: [
                [-2000, 0],
                [0, 0],
                [2000, 0],
            ],
            circles: [[200, 0, 100]],
            offset: [0, 0]
        },
        base64: "",
    };
}

export type RiderEntry = {
    json: RiderCreator,
} & Entry

export function createDefaultRiderEntry(): RiderEntry {
    return {
        id: -1,
        info: {
            name: "Default Rider",
        },
        json: new RiderCreator().createDefault(),
        base64: "",
    };
}

export function createSimpleRiderEntry(): RiderEntry {
    return {
        id: -1,
        info: {
            name: "Simple Rider",
        },
        json: new RiderCreator().createSimple(),
        base64: "",
    };
}