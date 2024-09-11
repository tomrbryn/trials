export class Canvas {

    static fillOval(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, style: string | null = null) {
        if (style) {
            ctx.fillStyle = style;
        }
        ctx.beginPath();
        ctx.arc(x, y, r, 0, 2 * Math.PI);
        ctx.fill();
    }

    static strokeOval(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, style: string | null = null) {
        if (style) {
            ctx.strokeStyle = style;
        }
        ctx.beginPath();
        ctx.arc(x, y, r, 0, 2 * Math.PI);
        ctx.stroke();
    }

    static drawLine(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, style: string | null = null) {
        if (style) {
            ctx.strokeStyle = style;
        }
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }

    static getContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D | null {
        if (canvas.width <= 0 || canvas.height <= 0) {
            return null;
        }
        return canvas.getContext("2d");
    }

    static updateCanvasSize(canvas: HTMLCanvasElement): CanvasRenderingContext2D | null {
        if (canvas.width != canvas.clientWidth || canvas.height != canvas.clientHeight) {
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;
        }
        return Canvas.getContext(canvas);
    }
}