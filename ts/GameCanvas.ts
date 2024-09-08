import { Canvas } from "./Canvas.ts";
import type { TrialsGame, Level, Rider, VertexArray } from "./GameStructGeneratedCode.js";

export class GameCanvas {

    constructor(public canvas: HTMLElement) {}

    paint(trialsGame: TrialsGame, level: Level, rider: Rider) {
        let ctx = Canvas.updateCanvasSize(this.canvas);
        if (!ctx) {
            return
        }
        ctx.lineWidth = 6;
        ctx.lineCap = "round";
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        ctx.fillStyle = "black";

        ctx.font = "16px 'Open Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif";
        let y = 10;
        ctx.fillText("state: " + trialsGame.getState(), 10, y+=20);
        ctx.fillText("tries: " + trialsGame.getTries(), 10, y+=20);
        ctx.fillText("ticks: " + trialsGame.getTickIdx(), 10, y+=20);
        ctx.fillText("checkpoint: " + trialsGame.getCurrentCheckpoint(), 10, y+=20);

        let vertices = rider.getVertices();
        let lines = level.getLines();
        let circles = level.getCircles();
        let checkpoints = level.getCheckpoints();

        // translate to chain position
        ctx.save();
        ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
        ctx.scale(0.25, 0.25);
        let chain = vertices.get(rider.getChainIdx());
        ctx.translate(-chain.getX(), -chain.getY());            

        GameCanvas.paintRider(ctx, rider);

        for (let i=0; i<lines.getLength(); i++) {
            let l = lines.get(i);
            Canvas.drawLine(ctx, l.getX1(), l.getY1(), l.getX2(), l.getY2(), "black");
        }

        for (let i=0; i<circles.getLength(); i++) {
            let c = circles.get(i);
            Canvas.fillOval(ctx, c.getX(), c.getY(), c.getRadius(), "blue");
        }
        
        for (let i=0; i<checkpoints.getLength(); i++) {
            let cp = checkpoints.get(i);
            Canvas.drawLine(ctx, cp.getX(), cp.getY(), cp.getX(), cp.getY()-100, "#777700");
        }

        ctx.restore();
    }

    public static paintRider(ctx, rider: Rider) {
        this.paintVertices(ctx, rider.getVertices());
        this.paintEdges(ctx, rider.getVertices(), rider.getEdges());
    }   

    public static paintVertices(ctx, vertices: VertexArray) {
        for (let i=0; i<vertices.getLength(); i++) {
            let v = vertices.get(i);
            Canvas.fillOval(ctx, v.getX(), v.getY(), v.getRadius(), "green");
        }
    }   

    public static paintEdges(ctx, vertices: VertexArray, edges: EdgeArray) {
        for (let i=0; i<edges.getLength(); i++) {
            let e = edges.get(i);
            let v1 = vertices.get(e.getV1Idx());
            let v2 = vertices.get(e.getV2Idx());
            Canvas.drawLine(ctx, v1.getX(), v1.getY(), v2.getX(), v2.getY(), "black");
        }
    }
}