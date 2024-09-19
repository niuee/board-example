import { Point } from "@niuee/board";


export class Segment {

    private _startPoint: Point;
    private _endPoint: Point;
    private _drawEndPoint: Point;
    private _strokeStyle: string;

    constructor(startPoint: Point, endPoint: Point, strokeStyle: string) {
        this._startPoint = startPoint;
        this._endPoint = endPoint;
        this._drawEndPoint = startPoint;
        this._strokeStyle = strokeStyle;
    }

    set percentage(percentage: number) {
        this._drawEndPoint = {
            x: this._startPoint.x + (this._endPoint.x - this._startPoint.x) * percentage,
            y: this._startPoint.y + (this._endPoint.y - this._startPoint.y) * percentage,
        };
    }

    draw(context: CanvasRenderingContext2D) {
        if (this._startPoint.x === this._drawEndPoint.x && this._startPoint.y === this._drawEndPoint.y) {
            return;
        }
        context.beginPath();
        context.moveTo(this._startPoint.x, this._startPoint.y);
        context.lineTo(this._drawEndPoint.x, this._drawEndPoint.y);
        context.strokeStyle = this._strokeStyle;
        context.stroke();
    }
}