import type { Writable } from "svelte/store";
import type { Point } from "./LevelCreator";

export class ViewTransform {
    center: Point = {x: 0, y: 0};
    scaleFactor = 0.25;

    constructor(public canvas: HTMLCanvasElement, public scaleFactorStore: Writable<number>) {
        const unsubscribeScaleFactor = scaleFactorStore.subscribe(value => this.scaleFactor = value);
    }

    reset() {
        this.center = {x: 0, y: 0};
        this.scaleFactorStore.set(1);
    }

    lengthToWorld(length: number) {
        return length / this.scaleFactor;
    }    

    mouseToWorld(m: Point): Point {
        return {x: (m.x - this.canvas.width / 2) / this.scaleFactor + this.center.x, y: (m.y - this.canvas.height / 2) / this.scaleFactor + this.center.y};
    }

    apply(ctx: CanvasRenderingContext2D) {
        ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
        ctx.scale(this.scaleFactor, this.scaleFactor);
        ctx.translate(-this.center.x, -this.center.y);
    }
}