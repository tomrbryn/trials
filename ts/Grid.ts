import { writable, Writable } from 'svelte/store';
import { Canvas } from "./Canvas";
import type { Point } from './LevelCreator';
import type { ViewTransform } from './ViewTransform';

export class Grid {

    public grid = 128;

    constructor(public viewTransform: ViewTransform, public gridStore: Writable<number>) {
        const unsubscribeGrid = gridStore.subscribe(value => this.grid = value);
    }

    draw(ctx) {
        if (this.grid > 0) {
            ctx.strokeStyle = "#888";
            let upperLeft = this.mouseToGrid({x: 0, y: 0});
            let lowerRight = this.mouseToGrid({x: this.viewTransform.canvas.width, y: this.viewTransform.canvas.height});
            let adjustedStartX = upperLeft.x - this.grid;
            let adjustedStartY = upperLeft.y - this.grid;
            let adjustedEndX = lowerRight.x + this.grid;
            let adjustedEndY = lowerRight.y + this.grid;
            for (let x = adjustedStartX; x <= adjustedEndX; x += this.grid) {
                Canvas.drawLine(ctx, x, adjustedStartY, x, adjustedEndY, "#eee");
            }
            for (let y = adjustedStartY; y <= adjustedEndY; y += this.grid) {
                Canvas.drawLine(ctx, adjustedStartX, y, adjustedEndX, y, "#eee");
            }
            Canvas.drawLine(ctx, 0, adjustedStartY, 0, adjustedEndY, "#aaa");
            Canvas.drawLine(ctx, adjustedStartX, 0, adjustedEndX, 0, "#aaa");
        }
    }    

    mouseToGrid(m: Point): Point {
        return this.snapToGrid(this.viewTransform.mouseToWorld(m));
    }

    snapToGrid(pos: Point): Point {
        return (this.grid > 0) ? {x: Math.round(pos.x / this.grid) * this.grid, y: Math.round(pos.y / this.grid) * this.grid} : pos;
    }
}

