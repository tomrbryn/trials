import { gridStore, scaleFactorStore } from '../EditorStore';
import { modeStore, modes, riderEntryStore, undoRedoManager, leaning, selectedEdge, selectedVertex } from './RiderEditorStore';
import { Canvas } from "../Canvas";
import { type Point, riderToBinary } from "../LevelCreator";
import { setupReload } from "../ServerSideEvents";
import RiderEditorUI from './RiderEditor.svelte';
import { createPhysics, Physics } from '../Physics';
import { KeyState as KeyState } from '../KeyState';
import { Grid } from '../Grid';
import { ViewTransform } from '../ViewTransform';
import { createEdge, createVertex, Edge, findClosest, RiderCreator, Vertex, type ClosestRiderPoint } from '../RiderCreator';
import { createDefaultRiderEntry, type RiderEntry } from '../Entry';
import { get } from 'svelte/store';

const defaultGrid = 16;

// don't show default context menu in browser
document.addEventListener('contextmenu', (event) => event.preventDefault());
document.addEventListener('DOMContentLoaded', async () => {
    setupReload();
    gridStore.set(defaultGrid);

    let physics = await createPhysics();
    const riderEditor = new RiderEditor(physics);
    new RiderEditorUI({target: document.body, props: {riderEditor}});
});


export class RiderEditor {

    riderEntry: RiderEntry | null = null;

    constructor(public physics: Physics) {
    }
    
    start(canvas: HTMLCanvasElement) {
        const MOVE_POINT_MAX_DISTANCE = 100;

        undoRedoManager.listeners.push(() => {
            this.updatePhysicsLevel();
        });

        let mode = modes[0];
        const unsubscribeMode = modeStore.subscribe(value => mode = value);    
        let viewTransform = new ViewTransform(canvas, scaleFactorStore);
        let grid = new Grid(viewTransform, gridStore);

        riderEntryStore.subscribe(value => {
            if (this.riderEntry?.id !== value.id) {
                undoRedoManager.clear();
                viewTransform.reset();

            }
            this.riderEntry = value;
            this.updatePhysicsLevel();
        });
    
        
        let movePoint: Point | null = null;
        let movePointWorld: Point | null = null;
        let movePointGrid: Point | null = null;
        let pressPoint: Point | null = null;
    
        let addVertexData: Vertex | null = null;
        let addEdgeData: {v1Idx: number, v2Idx: number} | null = null;
        //let addLineArrayData: number[][] | null = null;
        let movePointData: ClosestRiderPoint | null = null;
        let lastMovePointData: ClosestRiderPoint = null;
        let panStartCenter: Point | null = null;
        let panStartPressPoint: Point | null = null;
        let scaleStartFactor = 0;
        let scaleStartPressPoint: Point | null = null;
    
        let keyState = new KeyState();
        
        window.addEventListener('keydown', (event) => {
            // console.log("keydown", event.key, event.ctrlKey, event.shiftKey);
            let rider = this.riderEntry.json;

            if (event.key === "1") {
                modeStore.set("addVertex");
            }
            if (event.key === "2") {
                modeStore.set("addEdge");
            }
            if (event.key === "3") {
                modeStore.set("movePoint");
            }
            if (event.key === "4") {
                leaning.set(!get(leaning));
            }
            if (event.key === "Escape") {
            }
            if (event.key === "Delete" && lastMovePointData != null) {
                console.log("delete", lastMovePointData);
                let captureMovePointData = lastMovePointData;
                if (lastMovePointData.type === "edge") {
                    let captureEdge = rider.edges[lastMovePointData.index];
                    undoRedoManager.addAction({
                        undo: () => rider.edges.splice(captureMovePointData.index, 0, captureEdge), 
                        redo: () => rider.edges.splice(captureMovePointData.index, 1)
                    });
                } else if (lastMovePointData.type === "vertex") {
                    let captureVertex = rider.vertices[lastMovePointData.index];

                    let undoEdges = rider.edges.slice();
                    let undoEdgeIndices = rider.edges.map(e => [e.v1Idx, e.v2Idx]);
                    let redoEdges: Edge[] = [];
                    for (let e of rider.edges) {
                        if (e.v1Idx !== lastMovePointData.index && e.v2Idx !== lastMovePointData.index) {
                            redoEdges.push(e);
                        }
                    }
                    for (let e of redoEdges) {
                        e.v1 = rider.vertices[e.v1Idx];
                        e.v2 = rider.vertices[e.v2Idx];
                    }

                    undoRedoManager.addAction({
                        undo: () => {
                            rider.edges = undoEdges;
                            rider.vertices.splice(captureMovePointData.index, 0, captureVertex)
                            for (let i=0; i<undoEdgeIndices.length; i++) {
                                rider.edges[i].v1Idx = undoEdgeIndices[i][0];
                                rider.edges[i].v2Idx = undoEdgeIndices[i][1];
                            }
                        }, 
                        redo: () => {
                            rider.edges = redoEdges;
                            rider.vertices.splice(captureMovePointData.index, 1)
                            for (let e of redoEdges) {
                                e.v1Idx = rider.vertices.indexOf(e.v1);
                                e.v2Idx = rider.vertices.indexOf(e.v2);
                            }
                        }
                    });
                }
            }
            if (event.key === "z" && event.ctrlKey) {
                undoRedoManager.undo();
            }
            if ((event.key === "y" && event.ctrlKey) || (event.key === "Z" && event.shiftKey && event.ctrlKey)) {
                undoRedoManager.redo();
            }
            if (event.key === "+") {
                scaleFactorStore.set(viewTransform.scaleFactor * 1.25);
            }
            if (event.key === "-") {
                scaleFactorStore.set(viewTransform.scaleFactor / 1.25);
            }
            if (event.key === "Enter" || event.key === " ") {
                this.physics.newGame();
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
                        scaleFactorStore.set(viewTransform.scaleFactor * Math.pow(1.01, -10 * mouseEvent.deltaY / Math.abs(mouseEvent.deltaY)));
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
            let rider = this.riderEntry.json;
            movePoint = pos;
            movePointWorld = viewTransform.mouseToWorld(pos);
            movePointGrid = grid.mouseToGrid(pos);
            
            if (button === 1 && type === "mousedown") { // Scale
                scaleStartPressPoint = pos;
                scaleStartFactor = viewTransform.scaleFactor;
            } else if (type === "mousemove" && scaleStartPressPoint) {
                let deltaY = scaleStartPressPoint.y - pos.y;
                scaleFactorStore.set(scaleStartFactor * Math.pow(1.01, deltaY));
            } else if (button === 1 && type === "mouseup") {
                scaleStartPressPoint = null;
            } else if (button == 2 && type === "mousedown") { // Pan
                panStartCenter = viewTransform.center;
                panStartPressPoint = pos;
            } else if (type === "mousemove" && panStartCenter && panStartPressPoint) {
                viewTransform.center = {
                    x: panStartCenter.x - viewTransform.lengthToWorld(pos.x - panStartPressPoint.x), 
                    y: panStartCenter.y - viewTransform.lengthToWorld(pos.y - panStartPressPoint.y)
                };
            } else if (button == 2 && type === "mouseup") {
                panStartCenter = null;
                panStartPressPoint = null;
            }
            else if (button === 0 && type === "mousedown" && mode === "addVertex") { // Add vertex
                let posGrid = grid.mouseToGrid(pos);
                addVertexData = createVertex(posGrid.x, posGrid.y, grid.grid > 0 ? grid.grid : defaultGrid);
                let capture = addVertexData;
                undoRedoManager.addAction({undo: () => {rider.vertices.pop()}, redo: () => {rider.vertices.push(capture)}});
            } else if (type == "mousemove" && addVertexData) {
                let posGrid = grid.mouseToGrid(pos);
                let delta = {x: posGrid.x - addVertexData.pos.x, y: posGrid.y - addVertexData.pos.y};
                addVertexData.radius = Math.sqrt(delta.x * delta.x + delta.y * delta.y);
            } else if (button === 0 && type == "mouseup" && addVertexData) {
                addVertexData = null;
            } else if (button === 0 && type === "mousedown" && mode === "addEdge") { // Add edge
                let closest = findClosest(rider, viewTransform.mouseToWorld(pos), MOVE_POINT_MAX_DISTANCE);
                if (closest.type === "vertex") {
                    addEdgeData = {v1Idx: closest.index, v2Idx: closest.index};
                }
            } else if (type == "mousemove" && mode === "addEdge" && addEdgeData) {
                let closest = findClosest(rider, viewTransform.mouseToWorld(pos), MOVE_POINT_MAX_DISTANCE);
                if (closest.type === "vertex") {
                    addEdgeData.v2Idx = closest.index;
                } else {
                    addEdgeData.v2Idx = addEdgeData.v1Idx;
                }
            } else if (button === 0 && type === "mouseup" && mode === "addEdge" && addEdgeData) {
                if (addEdgeData.v1Idx !== addEdgeData.v2Idx) {
                    let capture = addEdgeData;
                    let newEdge = createEdge(rider.vertices, rider.vertices[capture.v1Idx], rider.vertices[capture.v2Idx], 1, 0);
                    undoRedoManager.addAction({
                        undo: () => rider.edges.pop(),
                        redo: () => rider.edges.push(newEdge)
                    });
                }
                addEdgeData = null
            } else if (button === 0 && type === "mousedown" && mode === "movePoint") { // Move point
                let closest = findClosest(rider, viewTransform.mouseToWorld(pos), MOVE_POINT_MAX_DISTANCE);
                if (closest.point) {
                    movePointData = closest;
                }
            } else if (button === 0 && type === "mouseup" && movePointData) {
                let capture = movePointData;
                let capturePointGrid = movePointGrid;
                undoRedoManager.addAction({
                    undo: () => updateLevelWithClosestPoint(capture, capture.point),
                    redo: () => updateLevelWithClosestPoint(capture, capturePointGrid)
                });
                // for delete
                lastMovePointData = movePointData;
                movePointData = null;
            } else if (type === "mousemove" && movePointData && movePointGrid) {
                updateLevelWithClosestPoint(movePointData, movePointGrid);
            }
        }
        const updateLevelWithClosestPoint = (closest: ClosestRiderPoint, point: Point) => {
            if (this.riderEntry != null) {
                if (closest.type === "edge") {
                    // this.riderEntry.json.edges[closest.index] = [point.x, point.y];
                } else if (closest.type === "vertex") {
                    this.riderEntry.json.vertices[closest.index].pos.x = point.x;
                    this.riderEntry.json.vertices[closest.index].pos.y = point.y;
                }
            }
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
            let rider: RiderCreator = this.riderEntry.json;
            ctx.lineWidth = 2;
            ctx.lineCap = "round";
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.font = "64px 'Open Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif";

            ctx.save();
            viewTransform.apply(ctx);

            grid.draw(ctx);

            let isLeaning = get(leaning);
            let theSelectedVertex = get(selectedVertex);
            let theSelectedEdge = get(selectedEdge);

            for (let i=0; i<rider.vertices.length; i++) {
                let v = rider.vertices[i];
                let pos = v.getPos(isLeaning);
                let style = v == theSelectedVertex ? "#dd6043" : "green";
                Canvas.fillOval(ctx, pos.x, pos.y, v.radius, style);
                if (!isNaN(v.lean.x)) {
                    Canvas.strokeOval(ctx, pos.x, pos.y, v.radius, "#41e");
                }
            }
            if (mode == "addVertex" && addVertexData == null && movePointGrid) {
                Canvas.fillOval(ctx, movePointGrid.x, movePointGrid.y, grid.grid > 0 ? grid.grid : defaultGrid, "#FF000033");
            }
    
            for (let i=0; i<rider.edges.length; i++) {
                let e = rider.edges[i];
                let v1 = rider.vertices[e.v1Idx];
                let v2 = rider.vertices[e.v2Idx];
                let p1 = v1.getPos(isLeaning);
                let p2 = v2.getPos(isLeaning);
                let transparency = e.visible ? "ff" : "44";
                let style = (e == theSelectedEdge ? "#ff7043" : "#000000") + transparency;
                Canvas.drawLine(ctx, p1.x, p1.y, p2.x, p2.y, style);
            }
            if (mode == "addEdge" && addEdgeData != null) {
                let v1 = rider.vertices[addEdgeData.v1Idx];
                let p1 = v1.getPos(isLeaning);
                if (addEdgeData.v2Idx !== addEdgeData.v1Idx) {
                    let v2 = rider.vertices[addEdgeData.v2Idx];
                    let p2 = v2.getPos(isLeaning);
                    Canvas.drawLine(ctx, p1.x, p1.y, p2.x, p2.y, "purple");
                } else if (movePointWorld != null) {
                    Canvas.drawLine(ctx, p1.x, p1.y, movePointWorld.x, movePointWorld.y, "red");
                }
            }
            if (mode == "movePoint" && movePoint) {
                let closest = findClosest(rider, viewTransform.mouseToWorld(movePoint), MOVE_POINT_MAX_DISTANCE);
                if (closest.point) {
                    Canvas.strokeOval(ctx, closest.point.x, closest.point.y, grid.grid > 0 ? grid.grid / 5 : 20, "#000");
                }
            }
    
            ctx.restore();        
        }
        requestAnimationFrame(update);
    }
    
    new() {        
        riderEntryStore.set(createDefaultRiderEntry());
    }

    updatePhysicsLevel() {
        // let schema = createSchema(schemaDefinition);
        // let levelData = levelToBinary(schema, this.levelEntry.json);
        // this.physics.setData(levelData, this.riderData);
    }
}
