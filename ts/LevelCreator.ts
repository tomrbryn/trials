import { Builder, Schema } from "./Schema.js";
import * as RiderCreator from "./RiderCreator.ts";

export type Level = {
    lineArrays: number[][][],
    checkpoints: number[][],
    circles: number[][],
    offset?: number[]
};

export type Point = {x: number, y: number};

export type ClosestType = "none" | "lineArrayPoint" | "circle" | "checkpoint";

export type Closest = {
    point: Point | null,
    distance: number,
    type: ClosestType,
    index: number,
    subIndex: number
};

export function findClosest(level: Level, pos: Point, maxDistance: number = Number.MAX_VALUE): Closest {
    let closest: Closest = {
        point: null,
        distance: maxDistance,
        type: "none",
        index: -1,
        subIndex: -1
    }

    let register = (closestPoint: Point, distance: number, type: ClosestType, index: number, subIndex: number = -1) => {
        if (distance < closest.distance) {
            closest.distance = distance;
            closest.point = closestPoint;
            closest.type = type;
            closest.index = index;
            closest.subIndex = subIndex;
        }
    }

    let closestCircle = (x: number, y: number, r: number, type: ClosestType, index: number, subIndex: number = -1) => {
        let dx = pos.x - x;
        let dy = pos.y - y;
        let distance = Math.sqrt(dx * dx + dy * dy) - r;
        register({x, y}, distance, type, index, subIndex);
    }

    for (let i = 0; i < level.circles.length; i++) {
        closestCircle(level.circles[i][0], level.circles[i][1], level.circles[i][2], "circle", i);
    }

    for (let i = 0; i < level.lineArrays.length; i++) {
        for (let j = 0; j < level.lineArrays[i].length; j++) {
            closestCircle(level.lineArrays[i][j][0], level.lineArrays[i][j][1], 0, "lineArrayPoint", i, j);
        }
    }

    for (let i = 0; i < level.checkpoints.length; i++) {
        let checkpoint = level.checkpoints[i];
        let x1 = checkpoint[0];
        let y1 = checkpoint[1];
        let x2 = checkpoint[0];
        let y2 = checkpoint[1] - 100;
        closestCircle(x1, y1, 0, "checkpoint", i);
        closestCircle(x2, y2, 0, "checkpoint", i);
        let dx = x2 - x1;
        let dy = y2 - y1;
        let t = ((pos.x - x1) * dx + (pos.y - y1) * dy) / (dx * dx + dy * dy);
        let x = x1 + t * dx;
        let y = y1 + t * dy;
        if (t >= 0 && t <= 1) {
            let distance = Math.sqrt((pos.x - x) * (pos.x - x) + (pos.y - y) * (pos.y - y));
            register({x, y}, distance, "checkpoint", i);
        }
    }

    return closest;
}

export function gameToBinary(schema: Schema) {
    let arrayBuffer = new ArrayBuffer(1024);
    let builder = new Builder(schema, "TrialsGame", new DataView(arrayBuffer));
    builder.setUint32(0, "TrialsGame", "state", 1);
    return arrayBuffer.slice(0, builder.offset);
}

export function levelToBinary(schema: Schema, level: Level): ArrayBuffer {
    let arrayBuffer = new ArrayBuffer(1024*64);
    let builder = new Builder(schema, "Level", new DataView(arrayBuffer));
    applyLevelToBuilder(builder, level);
    return arrayBuffer.slice(0, builder.offset);
}

export function riderToBinary(schema: Schema): ArrayBuffer {
    let arrayBuffer = new ArrayBuffer(1024*64);
    let builder = new Builder(schema, "Rider", new DataView(arrayBuffer));
    let riderCreator = new RiderCreator.RiderCreator();
    riderCreator.create();
    riderCreator.applyToBuilder(builder);
    return arrayBuffer.slice(0, builder.offset);
}

export function createLevel(): Level {
    let level1 = {
        lineArrays: [[
            [0, 490],
            [10, 500],
            [770, 500],
            [770, 380],
            [1000, 380],
            [1200, 340],
            [1400, 250],
            [1400, 500]
        ]],
        checkpoints: [
            // [500, 0],
            [200, 500],
            [900, 380],
            [2000, 250]
        ],
        circles: [
            [770, 475, 100],
            [2000, 500, 250]
        ],
        offset: [0, 0]
    };
    let level2 = {
        lineArrays: [[
            [0, 1000],
            [300, 1000],
            [500, 950],
            [700, 800],
            [700, 1000],
            [1000, 1000],
            [1000, 800],
            [1300, 950],
            [1500, 1000],
            [2000, 1000]
        ]],
        checkpoints: [
            [100, 1000],
            [1700, 1000]
        ],
        circles: [],
        offset: [2700, -200]
    };
    
    let level3 = {
        lineArrays: [[
            [0, 1000],
            [300, 1000],
            [300, 1100],
            [600, 1000],
            [600, 1100],
            [900, 1000],
            [900, 1100],
            [1200, 1000],
            [1200, 1100],
            [1500, 1000],
            [1500, 1100],
            [1800, 1000]
        ]],
        checkpoints: [
            [100, 1000],
            [2000, 1000]
        ],
        circles: [],
        offset: [5000, 0]
    };
    
    let level4 = {
        lineArrays: [[
            [0, 2000],
            [300, 2000],
            [600, 1500],
            [1000, 1500],
            [1250, 1000],
            [1500, 1000]
        ]],
        checkpoints: [
            [100, 2000],
            [1500, 1000]
        ],
        circles: [],
        offset: [7000, -1000]
    };
    let level5 = {
        lineArrays: [[
            [0, 2000],
            [300, 2000],
            [500, 1750],
            [750, 1800],
            [1000, 1750],
            [1250, 2000],
            [1500, 2000]
        ]],
        checkpoints: [
            [100, 2000],
            [1500, 2000]
        ],
        circles: [
            [750, 1650, 50]
        ],
        offset: [8500, -1500]

    };
    let level6 = {
        lineArrays: [[
            [0, 2000],
            [500, 2000],
            [700, 1800],
            [700, 1600],
            [600, 1500]
        ]],
        checkpoints: [
            [100, 2000],
            [1500, 2000]
        ],
        circles: [
            [750, 1650, 50]
        ],
        offset: [10000, -1000]
    };
    //lines: lineArrayToLineList(
    let levels = [level1, level2, level3, level4, level5, level6];

    // combine levels
    let lineArrays: number[][][] = [];
    // let lines: number[][] = [];
    let circles: number[][] = [];
    let checkpoints: number[][] = [];

    for (let level of levels) {
        for (let lineArray of level.lineArrays) {            
            addOffset(lineArray, level.offset);
        }
        addOffset(level.circles, level.offset);
        addOffset(level.checkpoints, level.offset);
        lineArrays = lineArrays.concat(level.lineArrays);
        circles = circles.concat(level.circles);
        checkpoints = checkpoints.concat(level.checkpoints);
    }
    return {lineArrays, circles, checkpoints};
}

function addOffset(xyList: number[][], xyOffset: number[]) {
    for (let i = 0; i < xyList.length; i++) {
        xyList[i][0] += xyOffset[0];
        xyList[i][1] += xyOffset[1];
    }
}

export function lineArraysToLines(lineArrays: number[][][]): number[][][] {
    let lines: number[][][] = [];
    for (let lineArray of lineArrays) {
        lineArrayToLineList(lineArray).forEach(line => lines.push(line));
    }
    return lines;
}

function lineArrayToLineList(lineArray: number[][]): number[][][] {
    let lines: number[][][] = [];
    for (let i = 1; i < lineArray.length; i++) {
        lines.push([[lineArray[i - 1][0], lineArray[i - 1][1]], [lineArray[i][0], lineArray[i][1]]]);
    }
    return lines;
}

export function applyLevelToBuilder(b: Builder, level: Level) {
    let lines: number[][][] = [];
    for (let lineArray of level.lineArrays) {
        lineArrayToLineList(lineArray).forEach(line => lines.push(line));
    }

    let [linesPtr, linesLength] = b.setArray(0, "Level", "lines", b.createArray("Line", lines.length));
    for (let i = 0; i < lines.length; i++) {
        let line = b.getArrayElement(linesPtr, "Line", i);
        let v1 = lines[i][0];
        let v2 = lines[i][1];
        b.setFp(line, "Line", "x1", v1[0]);
        b.setFp(line, "Line", "y1", v1[1]);
        b.setFp(line, "Line", "x2", v2[0]);
        b.setFp(line, "Line", "y2", v2[1]);
    }

    let [checkpointsPtr, checkpoinsLength] = b.setArray(0, "Level", "checkpoints", b.createArray("Checkpoint", level.checkpoints.length));
    for (let i = 0; i < level.checkpoints.length; i++) {
        let checkpoint = b.getArrayElement(checkpointsPtr, "Checkpoint", i);
        b.setFp(checkpoint, "Checkpoint", "x", level.checkpoints[i][0]);
        b.setFp(checkpoint, "Checkpoint", "y", level.checkpoints[i][1]);
    }

    let [circlesPtr, circlesLength] = b.setArray(0, "Level", "circles", b.createArray("Circle", level.circles.length));
    for (let i = 0; i < level.circles.length; i++) {
        let circle = b.getArrayElement(circlesPtr, "Circle", i);
        b.setFp(circle, "Circle", "x", level.circles[i][0]);
        b.setFp(circle, "Circle", "y", level.circles[i][1]);
        b.setFp(circle, "Circle", "radius", level.circles[i][2]);
    }
}