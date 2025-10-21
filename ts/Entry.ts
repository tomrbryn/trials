import { JsonRiderF } from "./RiderCreator";
import { createLineLevel, type CreatorLevel } from "./LevelCreator";

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
    json: CreatorLevel,
} & Entry

export function createDefaultLevelEntry(): LevelEntry {
    return {
        id: -1,
        info: {
            name: "New Level",
        },
        json: createLineLevel(),
        base64: "",
    };
}

export type RiderEntry = {
    json: JsonRiderF,
} & Entry

export function createDefaultRiderEntry(): RiderEntry {
    return {
        id: -1,
        info: {
            name: "Default Rider",
        },
        json: new JsonRiderF().createDefault(),
        base64: "",
    };
}

export function createSimpleRiderEntry(): RiderEntry {
    return {
        id: -1,
        info: {
            name: "Simple Rider",
        },
        json: new JsonRiderF().createSimple(),
        base64: "",
    };
}