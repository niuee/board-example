import Board from "@niuee/board/boardify";
import { Point } from "@niuee/board";
import { Keyframe, Animation, CompositeAnimation, NumberAnimationHelper } from "@niuee/bounce";
import { Path } from "@niuee/bend";
import { Segment } from "./segment";



let element = document.getElementById("graph") as HTMLCanvasElement;
let board = new Board(element);
// board.fullScreen = true;
let button = document.querySelector("#start-recording") as HTMLButtonElement;
let clearCanvasbutton = document.querySelector("#clear-canvas-button") as HTMLButtonElement;
let startReplayButton = document.querySelector("#start-replay-btn") as HTMLButtonElement;
let recording = false;
let startTime = 0;
let curTime = 0;
let pathPoints: PathPoint[] = [];
let recordedPath: RecordedPathPoint[] = [];
let overallRecordedPath: RecoredPath[] = [];
let replayKeyframes: Keyframe<Number>[] = [{percentage: 0, value: 0}, {percentage: 1, value: 1}]; // startPoint -> endPoint is an animation
let replayAnimation: CompositeAnimation;

let overallAnimatedSegments: Segment[][] = [];
let compositeAnimation = new CompositeAnimation();
if (button) {
    button.onclick = ()=>{
        if(recording){
            button.textContent = '開始錄製筆跡';
            console.log("stop recording");
            if(recordedPath.length > 0){
                overallRecordedPath.push({points: recordedPath, startTime, endTime: curTime, nativeDuration: curTime - startTime});
            }
            console.log("overall recorded path", overallRecordedPath);
            overallAnimatedSegments = overallRecordedPath.map((recordedPath)=>{
                return recordedPath.points.map((recordedPathPoint)=>{
                    return new Segment(recordedPathPoint.startPoint, recordedPathPoint.endPoint, recordedPathPoint.strokeStyle);
                });
            });
            compositeAnimation = new CompositeAnimation();
            for(let pathIndex = 0; pathIndex < overallRecordedPath.length; pathIndex++){
                for(let segmentIndex = 0; segmentIndex < overallRecordedPath[pathIndex].points.length; segmentIndex++){
                    compositeAnimation.addAnimation(`path-${pathIndex}-segment-${segmentIndex}`, new Animation(replayKeyframes, (segmentPercentage: number)=>{ overallAnimatedSegments[pathIndex][segmentIndex].percentage = segmentPercentage }, new NumberAnimationHelper(), overallRecordedPath[pathIndex].points[segmentIndex].endTime - overallRecordedPath[pathIndex].points[segmentIndex].startTime), overallRecordedPath[pathIndex].points[segmentIndex].startTime - overallRecordedPath[pathIndex].startTime);
                }
            }
        } else {
            button.textContent = '停止錄製筆跡';
            lastRecordedTime = curTime;
            console.log("start recording");
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

if(startReplayButton){
    startReplayButton.onclick = ()=>{
        compositeAnimation.startAnimation();
        console.log("composite animation started");
    }
}


let isDrawing = false;
let hue = 0;
let lastPoint: Point = undefined;
let lastRecordedTime = startTime;
type PathPoint = {
    startPoint: Point;
    endPoint: Point;
    strokeStyle: string;
    timePercentage: number;
}

type RecordedPathPoint = {
    startPoint: Point;
    endPoint: Point;
    strokeStyle: string;
    startTime: number;
    endTime: number;
    timePercentage: number;
}

type RecoredPath = {
    points: RecordedPathPoint[];
    startTime: number;
    endTime: number;
    nativeDuration: number;
}

element.addEventListener('pointerdown', (e)=>{
    isDrawing = true;
    lastPoint = board.convertWindowPoint2WorldCoord({x: e.clientX, y: e.clientY});
    lastRecordedTime = curTime;
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
        if (recording){
            recordedPath.push({
                startPoint: {...lastPoint},
                endPoint: {...curPoint},
                strokeStyle: `hsl(${hue}, 60%, 60%)`,
                startTime: lastRecordedTime,
                endTime: curTime,
                timePercentage: curTime - startTime,
            });
            lastRecordedTime = curTime;
        }
        lastPoint = curPoint;
        hue = (hue + 1) % 360;
    }
});

const ctx = board.context;
function step(timestamp: number){
    board.step(timestamp);
    const deltaTime = (timestamp - curTime);
    if(deltaTime > 0){
        compositeAnimation.animate(deltaTime);
    }
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
    overallAnimatedSegments.forEach((animatedSegments)=>{
        animatedSegments.forEach((segment)=>{
            segment.draw(ctx);
        });
    });
    window.requestAnimationFrame(step);
}

window.requestAnimationFrame(step);
