import { Canvas } from "../Canvas.ts";
import type { TrialsGame, Level, Rider, VertexArray, Vertex, EdgeArray } from "../GameStructGeneratedCode.js";
import type { JsonTrialsGame } from "../JsonPhysics.js";
import { paintTerrain } from "./Parallax.js";

export class GameCanvas {

    constructor(public canvas: HTMLCanvasElement) {}

    paint(trialsGame: TrialsGame | JsonTrialsGame, level: Level, rider: Rider) {
        let ctx = Canvas.updateCanvasSize(this.canvas);
        if (!ctx) {
            return
        }

        ctx.lineWidth = 6;
        ctx.lineCap = "round";
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // paintTerrain(ctx, this.canvas);

        ctx.fillStyle = "black";

        ctx.font = "16px 'Open Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif";
        let y = 60;
        ctx.fillText("state: " + trialsGame.getState(), 10, y+=20);
        ctx.fillText("tries: " + trialsGame.getTries(), 10, y+=20);
        ctx.fillText("ticks: " + trialsGame.getTickIdx(), 10, y+=20);
        ctx.fillText("checkpoint: " + trialsGame.getCurrentCheckpoint(), 10, y+=20);

        let vertices = rider.getVertices();
        let lines = level.getLines();
        let circles = level.getCircles();
        let checkpoints = level.getCheckpoints();

        ctx.font = "64px 'Open Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif";

        // translate to chain position
        ctx.save();
        ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
        ctx.scale(0.25, 0.25);
        //let chain = vertices.get(rider.getChainIdx());
        ctx.translate(-rider.getCenterOfMassX(), -rider.getCenterOfMassY());


        for (let i=0; i<lines.getLength(); i++) {
            let l = lines.get(i);
            Canvas.drawLine(ctx, l.getX1(), l.getY1(), l.getX2(), l.getY2(), "black");
        }

        for (let i=0; i<circles.getLength(); i++) {
            let c = circles.get(i);
            Canvas.fillOval(ctx, c.getX(), c.getY(), c.getRadius(), "blue");
        }
        
        let currentCheckpointIndex = trialsGame.getCurrentCheckpoint();
        for (let i = 0; i < checkpoints.getLength(); i++) {
            let cp = checkpoints.get(i);
            GameCanvas.paintCheckpoint(ctx, cp.getX(), cp.getY(), i <= currentCheckpointIndex);
        }        
        
        GameCanvas.paintRider(ctx, rider);

        ctx.restore();
    }

    public static paintRider(ctx, rider: Rider) {
        this.paintVertices(ctx, rider.getVertices());
        this.paintEdges(ctx, rider.getVertices(), rider.getEdges());
        Canvas.fillOval(ctx, rider.getCenterOfMassX(), rider.getCenterOfMassY(), 10, "yellow");
        let v0: Vertex = rider.getVertices().get(0);
        Canvas.fillOval(ctx, v0.getX(), v0.getY(), 6, "blue");
    }   

    public static paintCheckpoint(ctx, x: number, y: number, passed: boolean) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y - 200);
        ctx.lineTo(x + 80, y - 160);
        ctx.lineTo(x, y - 120);
        ctx.strokeStyle = "#000";
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(x, y - 200);
        ctx.lineTo(x + 80, y - 160);
        ctx.lineTo(x, y - 120);
        ctx.closePath();
        ctx.fillStyle = passed ? "#0f0" : "#f00";
        ctx.fill();
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