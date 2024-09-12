import Board from "@niuee/board/boardify";
import { Point } from "@niuee/board";


let element = document.getElementById("test-graph") as HTMLCanvasElement;
let board = new Board(element);
board.fullScreen = true;
let button = document.querySelector("#start-recording") as HTMLButtonElement;
let clearCanvasbutton = document.querySelector("#clear-canvas-button") as HTMLButtonElement;
let recording = false;
let startTime = 0;
let curTime = 0;
let pathPoints: PathPoint[] = [];
let recordedPath: PathPoint[] = [];
if (button) {
    button.onclick = ()=>{
        if(recording){
            console.log("recorder path", recordedPath);
        }
        startTime = curTime;
        recordedPath = [];
        recording = !recording;
    }
}
if(clearCanvasbutton){
    clearCanvasbutton.onclick = ()=>{
        pathPoints = [];
    }
}

let isDrawing = false;
let hue = 0;
let lastPoint: Point = undefined;
type PathPoint = {
    startPoint: Point;
    endPoint: Point;
    strokeStyle: string;
    timePercentage: number;
}

element.addEventListener('pointerdown', (e)=>{
    isDrawing = true;
    lastPoint = board.convertWindowPoint2WorldCoord({x: e.clientX, y: e.clientY});
});

element.addEventListener('pointerup', (e)=>{
    isDrawing = false;
});

element.addEventListener('touchcancel', (e)=>{
    isDrawing = false;
});

element.addEventListener('pointermove', (e)=>{
    if(isDrawing){
        let curPoint = board.convertWindowPoint2WorldCoord({x: e.clientX, y: e.clientY});
        pathPoints.push({
            startPoint: {...lastPoint},
            endPoint: {...curPoint},
            strokeStyle: `hsl(${hue}, 60%, 60%)`,
            timePercentage: 0
        })
        // Array destructuring
        if (recording){
            recordedPath.push({
                startPoint: {...lastPoint},
                endPoint: {...curPoint},
                strokeStyle: `hsl(${hue}, 60%, 60%)`,
                timePercentage: curTime - startTime,
            })
        }
        lastPoint = curPoint;
        hue = (hue + 1) % 360;
    }
});

const ctx = board.context;
function step(timestamp: number){
    board.step(timestamp);
    curTime = timestamp;
    pathPoints.forEach((point)=>{
        ctx.strokeStyle = point.strokeStyle;
        ctx.beginPath();
        // start from
        ctx.moveTo(point.startPoint.x, point.startPoint.y);
        // go to
        ctx.lineTo(point.endPoint.x, point.endPoint.y);
        ctx.stroke();
    });
    window.requestAnimationFrame(step);
}

window.requestAnimationFrame(step);