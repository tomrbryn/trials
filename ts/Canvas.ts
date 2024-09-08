export class Canvas {

    static fillOval(ctx, x, y, r, style: string | null = null) {
        if (style) {
            ctx.fillStyle = style;
        }
        ctx.beginPath();
        ctx.arc(x, y, r, 0, 2 * Math.PI);
        ctx.fill();
    }

    static strokeOval(ctx, x, y, r, style: string | null = null) {
        if (style) {
            ctx.strokeStyle = style;
        }
        ctx.beginPath();
        ctx.arc(x, y, r, 0, 2 * Math.PI);
        ctx.stroke();
    }

    static drawLine(ctx, x1, y1, x2, y2, style: string | null = null) {
        if (style) {
            ctx.strokeStyle = style;
        }
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }

    static getContext(canvas) {
        if (canvas.width <= 0 || canvas.height <= 0) {
            return null;
        }
        return canvas.getContext("2d");
    }

    static updateCanvasSize(canvas) {
        if (canvas.width != canvas.clientWidth || canvas.height != canvas.clientHeight) {
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;
        }
        return Canvas.getContext(canvas);
    }
}