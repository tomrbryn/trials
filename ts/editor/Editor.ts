import { gridStore, defaultGrid, scaleFactorStore, modeStore, modes, levelEntryStore } from './EditorStore';
import { Canvas } from "../Canvas";
import { type Closest, createLevel, findClosest, levelToBinary, lineArraysToLines, type Point, riderToBinary } from "../LevelCreator";
import { setupReload } from "../ServerSideEvents";
import EditorUI from './Editor.svelte'; // Import the Svelte component
import { UndoRedoManager } from './UndoRedoManager';
import { createDefaultLevelEntry, type LevelEntry } from './LevelEntry';
import { createPhysics, Physics } from '../Physics';
import { createSchema, schemaDefinition } from '../Schema';
import { GameCanvas } from '../GameCanvas';
import { Rider } from '../GameStructGeneratedCode';
import { INPUT_CHECKPOINT, KeyState as KeyState } from '../KeyState';
import type { Action } from './UndoRedoManager';

// don't show default context menu in browser
document.addEventListener('contextmenu', (event) => event.preventDefault());
document.addEventListener('DOMContentLoaded', async () => {
    setupReload();

    levelEntryStore.set({
        id: -1, 
        info: {
            name: "New Level", 
        },
        json: createLevel(), 
        base64: ""
    });

    let physics = await createPhysics();
    let schema = createSchema(schemaDefinition);
    let riderData = riderToBinary(schema);
    const editor = new Editor(physics, riderData);
    new EditorUI({target: document.body, props: {editor}});
});


export class Editor {

    undoRedoManager = new UndoRedoManager();
    levelEntry: LevelEntry;
    center: Point = {x: 0, y: 0};
    scaleFactor = 0.25;

    constructor(public physics: Physics, public riderData: ArrayBuffer) {
    }
    
    start(canvas: HTMLElement) {
        const MOVE_POINT_MAX_DISTANCE = 200;

        levelEntryStore.subscribe(value => {
            if (this.levelEntry?.id !== value.id) {
                this.undoRedoManager.clear();
                this.center = {x: 0, y: 0};
                scaleFactorStore.set(0.25);
            }
            this.levelEntry = value;
            this.updatePhysicsLevel();
        });
    
        let mode = modes[0];
        const unsubscribeMode = modeStore.subscribe(value => mode = value);    
        let grid = defaultGrid;
        const unsubscribeGrid = gridStore.subscribe(value => grid = value);    
        const unsubscribeScaleFactor = scaleFactorStore.subscribe(value => this.scaleFactor = value);    
        
        let movePoint: Point | null = null;
        let movePointWorld: Point | null = null;
        let movePointGrid: Point | null = null;
        let pressPoint: Point | null = null;
    
        let addCircleData: number[] | null = null;
        let addLineArrayData: number[][] | null = null;
        let movePointData: Closest | null = null;
        let lastMovePointData: Closest | null = null;
        let panStartCenter: Point | null = null;
        let panStartPressPoint: Point | null = null;
        let scaleStartFactor = 0;
        let scaleStartPressPoint: Point | null = null;
    
        let endCurrentMode = () => {
            if (addLineArrayData) {
                addLineArrayData.pop();
                if (addLineArrayData.length === 0) {
                    this.levelEntry.json.lineArrays.pop();
                }
                addLineArrayData = null;
            }
        }

        let keyState = new KeyState();
        
        window.addEventListener('keydown', (event) => {
            // console.log("keydown", event.key, event.ctrlKey, event.shiftKey);
            let level = this.levelEntry.json;
            if (event.key === "1") {
                endCurrentMode();
                modeStore.set("addLineArray");
            }
            if (event.key === "2") {
                endCurrentMode();
                modeStore.set("addCircle");
            }
            if (event.key === "3") {
                endCurrentMode();
                modeStore.set("addCheckpoint");
            }
            if (event.key === "4") {
                endCurrentMode();
                modeStore.set("movePoint");
            }
            if (event.key === "Escape") {
                endCurrentMode();
            }
            if (event.key === "Delete" && lastMovePointData) {
                console.log("delete", lastMovePointData);
                let captureMovePointData = lastMovePointData;
                if (lastMovePointData.type === "lineArrayPoint") {
                    let capturePoint = level.lineArrays[lastMovePointData.index][lastMovePointData.subIndex];
                    this.addAction({
                        undo: () => level.lineArrays[captureMovePointData.index].splice(captureMovePointData.subIndex, 0, capturePoint), 
                        redo: () => level.lineArrays[captureMovePointData.index].splice(captureMovePointData.subIndex, 1)
                    });
                }
                if (lastMovePointData.type === "circle") {
                    let captureCircle = level.circles[lastMovePointData.index];
                    this.addAction({
                        undo: () => level.circles.splice(captureMovePointData.index, 0, captureCircle), 
                        redo: () => level.circles.splice(captureMovePointData.index, 1)
                    });
                }
                if (lastMovePointData.type === "checkpoint") {
                    let captureCheckpoint = level.checkpoints[lastMovePointData.index];
                    this.addAction({
                        undo: () => level.checkpoints.splice(captureMovePointData.index, 0, captureCheckpoint), 
                        redo: () => level.checkpoints.splice(captureMovePointData.index, 1)
                    });
                }
            }
            if (event.key === "z" && event.ctrlKey) {
                this.undoRedoManager.undo();
            }
            if ((event.key === "y" && event.ctrlKey) || (event.key === "Z" && event.shiftKey && event.ctrlKey)) {
                this.undoRedoManager.redo();
            }
            if (event.key === "+") {
                scaleFactorStore.set(this.scaleFactor * 1.25);
            }
            if (event.key === "-") {
                scaleFactorStore.set(this.scaleFactor / 1.25);
            }
            if (event.key === "Enter" || event.key === " ") {
                this.physics.newGame();
            }
            if (event.key === "m") {
                let checkpointCount = this.physics.level.getCheckpoints().getLength();
                let current = this.physics.trialsGame.getCurrentCheckpoint();
                this.physics.trialsGame.setCurrentCheckpoint((current + 1) % checkpointCount);
                this.physics.tick(INPUT_CHECKPOINT);
            }

        });
    
        let mouseEvents = ["mousedown", "mouseup", "mousemove", "mouseenter", "mouseleave", "mouseout", "wheel", "click", "dblclick"];
        for (let event of mouseEvents) {
            window.addEventListener(event, (event: Event) => {
                let mouseEvent = event as MouseEvent;
    
                // transform event to canvas coordinates
                let canvasCoord = canvas.getBoundingClientRect();
                let canvasX = mouseEvent.clientX - canvasCoord.left;
                let canvasY = mouseEvent.clientY - canvasCoord.top;
    
    
                if (event.target == canvas) {
                    if (event.type === "mousedown") {
                        pressPoint = {x: canvasX, y: canvasY};
                        onMouseEvent(event.button, event.type, {x: canvasX, y: canvasY})
                    } else if (event.type === "wheel") {
                        // console.log("wheel", mouseEvent.deltaY);
                        scaleFactorStore.set(this.scaleFactor * Math.pow(1.01, -10 * mouseEvent.deltaY / Math.abs(mouseEvent.deltaY)));
                    }
                }
                if (event.type === "mouseup") {
                    onMouseEvent(event.button, event.type, {x: canvasX, y: canvasY})
                    pressPoint = null;
                    onMouseEvent(event.button, event.type, {x: canvasX, y: canvasY})
                }
                if (event.type === "mousemove") {
                    onMouseEvent(event.button, event.type, {x: canvasX, y: canvasY})
                }
            });
        }
    
        const onMouseEvent = (button: number, type: string, pos: Point) => {
            //console.log("onMouseEvent", type, button, pos, pressPoint);
            let level = this.levelEntry.json;
            movePoint = pos;
            movePointWorld = mouseToWorld(pos);
            movePointGrid = mouseToGrid(pos);
            
            if (button === 1 && type === "mousedown") { // Scale
                scaleStartPressPoint = pos;
                scaleStartFactor = this.scaleFactor;
            } else if (type === "mousemove" && scaleStartPressPoint) {
                let deltaY = scaleStartPressPoint.y - pos.y;
                scaleFactorStore.set(scaleStartFactor * Math.pow(1.01, deltaY));
            } else if (button === 1 && type === "mouseup") {
                scaleStartPressPoint = null;
            } else if (button == 2 && type === "mousedown") { // Pan
                panStartCenter = this.center;
                panStartPressPoint = pos;
            } else if (type === "mousemove" && panStartCenter && panStartPressPoint) {
                this.center = {
                    x: panStartCenter.x - lengthToWorld(pos.x - panStartPressPoint.x), 
                    y: panStartCenter.y - lengthToWorld(pos.y - panStartPressPoint.y)
                };
            } else if (button == 2 && type === "mouseup") {
                panStartCenter = null;
                panStartPressPoint = null;
            } else if (button === 0 && type === "mousedown" && mode === "addCircle") { // Add circle
                let posGrid = mouseToGrid(pos);
                addCircleData = [posGrid.x, posGrid.y, grid > 0 ? grid : defaultGrid];
                let capture = addCircleData;
                this.addAction({undo: () => {level.circles.pop()}, redo: () => {level.circles.push(capture)}});
            } else if (type == "mousemove" && addCircleData) {
                let posGrid = mouseToGrid(pos);
                let delta = {x: posGrid.x - addCircleData[0], y: posGrid.y - addCircleData[1]};
                addCircleData[2] = Math.sqrt(delta.x * delta.x + delta.y * delta.y);
            } else if (button === 0 && type == "mouseup" && addCircleData) {
                addCircleData = null;
            } else if (button === 0 && type === "mousedown" && mode === "addLineArray") { // Add line array
                let posGrid = mouseToGrid(pos);
                if (addLineArrayData == null) {
                    addLineArrayData = [[posGrid.x, posGrid.y], [posGrid.x, posGrid.y]];
                    let capture = addLineArrayData;
                    this.addAction({undo: () => {level.lineArrays.pop()}, redo: () => {level.lineArrays.push(capture)}});
                } else {
                    let capture = addLineArrayData;
                    this.addAction({undo: () => {capture.pop()}, redo: () => {capture.push([posGrid.x, posGrid.y])}});
                }
            } else if (type == "mousemove" && mode === "addLineArray" && addLineArrayData) {
                let posGrid = mouseToGrid(pos);
                addLineArrayData[addLineArrayData.length-1] = [posGrid.x, posGrid.y];
            } else if (button === 0 &&type === "mousedown" && mode === "addCheckpoint") { // Add checkpoint
                let posGrid = mouseToGrid(pos);
                let capture = [posGrid.x, posGrid.y];
                this.addAction({undo: () => {level.checkpoints.pop()}, redo: () => {level.checkpoints.push(capture)}});
            } else if (button === 0 && type === "mousedown" && mode === "movePoint") { // Move point
                let closest = findClosest(level, mouseToWorld(pos), MOVE_POINT_MAX_DISTANCE);
                if (closest.point) {
                    movePointData = closest;
                }
            } else if (button === 0 && type === "mouseup" && movePointData) {
                let capture = movePointData;
                let capturePointGrid = movePointGrid;
                this.addAction({
                    undo: () => updateLevelWithClosestPoint(capture, capture.point),
                    redo: () => updateLevelWithClosestPoint(capture, capturePointGrid)
                });
                // for delete
                lastMovePointData = movePointData;
                movePointData = null;
            } else if (type === "mousemove" && movePointData) {
                updateLevelWithClosestPoint(movePointData, movePointGrid);
            }
        }
        const updateLevelWithClosestPoint = (closest: Closest, point: Point) => {
            if (closest.type === "lineArrayPoint") {
                this.levelEntry.json.lineArrays[closest.index][closest.subIndex] = [point.x, point.y];
            } else if (closest.type === "circle") {
                this.levelEntry.json.circles[closest.index][0] = point.x;
                this.levelEntry.json.circles[closest.index][1] = point.y;
            } else if (closest.type === "checkpoint") {
                this.levelEntry.json.checkpoints[closest.index][0] = point.x;
                this.levelEntry.json.checkpoints[closest.index][1] = point.y;
            }
        }        
    
        let lengthToWorld = (length: number) => {
            return length / this.scaleFactor;
        }
    
        let mouseToWorld = (m: Point): Point => {
            return {x: (m.x - canvas.width / 2) / this.scaleFactor + this.center.x, y: (m.y - canvas.height / 2) / this.scaleFactor + this.center.y};
        }
    
        let mouseToGrid = (m: Point): Point => {
            return snapToGrid(mouseToWorld(m));
        }
    
        let snapToGrid = (pos): Point => {
            return (grid > 0) ? {x: Math.round(pos.x / grid) * grid, y: Math.round(pos.y / grid) * grid} : pos;
        }
    
        let update = (timeStampMs: number) => {
            let ctx = Canvas.updateCanvasSize(canvas);
            if (!ctx) {
                return;
            }
            this.physics.tick(keyState.encodeGameInput());
            render(ctx);
            requestAnimationFrame(update);
        }
        let render = (ctx) => {
            let level = this.levelEntry.json;
            ctx.lineWidth = 6;
            ctx.lineCap = "round";
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
    
            ctx.save();
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.scale(this.scaleFactor, this.scaleFactor);
            ctx.translate(-this.center.x, -this.center.y);
    
            if (grid > 0) {
                ctx.strokeStyle = "#888";
                let upperLeft = mouseToGrid({x: 0, y: 0});
                let lowerRight = mouseToGrid({x: canvas.width, y: canvas.height});
                let adjustedStartX = upperLeft.x - grid;
                let adjustedStartY = upperLeft.y - grid;
                let adjustedEndX = lowerRight.x + grid;
                let adjustedEndY = lowerRight.y + grid;
                for (let x = adjustedStartX; x <= adjustedEndX; x += grid) {
                    Canvas.drawLine(ctx, x, adjustedStartY, x, adjustedEndY, "#eee");
                }
                for (let y = adjustedStartY; y <= adjustedEndY; y += grid) {
                    Canvas.drawLine(ctx, adjustedStartX, y, adjustedEndX, y, "#eee");
                }
                Canvas.drawLine(ctx, 0, adjustedStartY, 0, adjustedEndY, "#aaa");
                Canvas.drawLine(ctx, adjustedStartX, 0, adjustedEndX, 0, "#aaa");
            }
    
            for (let circle of level.circles) {
                Canvas.fillOval(ctx, circle[0], circle[1], circle[2], "red");
            }
            if (mode == "addCircle" && addCircleData == null && movePointGrid) {
                Canvas.fillOval(ctx, movePointGrid.x, movePointGrid.y, grid > 0 ? grid : defaultGrid, "#FF000033");
            }
            let lines = lineArraysToLines(level.lineArrays);
            for (let i=0; i<lines.length; i++) {
                let p1 = lines[i][0]
                let p2 = lines[i][1]
                Canvas.drawLine(ctx, p1[0], p1[1], p2[0], p2[1], "blue");
            }

            GameCanvas.paintRider(ctx, this.physics.rider);

            if (mode == "addLineArray" && addLineArrayData == null && movePointGrid) {
                Canvas.fillOval(ctx, movePointGrid.x, movePointGrid.y, grid > 0 ? grid / 10 : 10, "#0000FF33");
            }
            let checkpoints = level.checkpoints;
            for (let cp of checkpoints) {
                Canvas.drawLine(ctx, cp[0], cp[1], cp[0], cp[1]-100, "#777700");
            }
            if (mode == "addCheckpoint" && movePointGrid) {
                Canvas.drawLine(ctx, movePointGrid.x, movePointGrid.y, movePointGrid.x, movePointGrid.y-100, "#77770033");
            }
    
            if (mode == "movePoint" && movePoint) {
                let closest = findClosest(level, mouseToWorld(movePoint), MOVE_POINT_MAX_DISTANCE);
                if (closest.type === "checkpoint") {
                    Canvas.drawLine(ctx, level.checkpoints[closest.index][0], level.checkpoints[closest.index][1], level.checkpoints[closest.index][0], level.checkpoints[closest.index][1]-100, "#000");
                } else if (closest.point) {
                    Canvas.strokeOval(ctx, closest.point.x, closest.point.y, grid > 0 ? grid / 5 : 20, "#000");
                }
            }
    
            ctx.restore();        
        }
        requestAnimationFrame(update);
    }
    
    addAction(action: Action) {
        this.undoRedoManager.addAction(action);
        this.updatePhysicsLevel();
    }
    
    new() {
        levelEntryStore.set(createDefaultLevelEntry());
    }

    updatePhysicsLevel() {
        let schema = createSchema(schemaDefinition);
        let levelData = levelToBinary(schema, this.levelEntry.json);
        this.physics.setData(levelData, this.riderData);
    }
}
