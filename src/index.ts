import Board from "@niuee/board/boardify";
import { Point } from "point2point";
import { drawAxis, drawBoundingBox } from "@niuee/board/boardify/utils";
import { Keyframe, Animation, CompositeAnimation, PointAnimationHelper, NumberAnimationHelper } from "@niuee/bounce";
import * as EaseFunctions from "@niuee/bounce/ease-functions";
import { InputControlCenterWithAnimation } from "./control-center";

let element = document.getElementById("test-graph") as HTMLCanvasElement;
let board = new Board(element);
board.fullScreen = true;
board.limitEntireViewPort = true;
const animationCenter = new InputControlCenterWithAnimation();
board.controlCenter = animationCenter;

const pointKeyframes: Keyframe<Point>[]= [
    { percentage: 0, value: {x: 0, y: 0}}, {percentage: 1, value: {x: 100, y: 100}}
]
const extendStickKeyframes: Keyframe<number>[] = [
    {percentage: 0, value: 0}, {percentage: 1, value: 100}
]
let stickLength = 0;

const extendStickAnimation = new Animation<number>(extendStickKeyframes, (value: number)=>{
    stickLength = value;
}, new NumberAnimationHelper());
const cameraAnimation = new Animation<Point>(pointKeyframes, (point: Point)=>{
    console.log("camera animation", point);
    animationCenter.notifyPanToTransition(board.camera, point);
}, new PointAnimationHelper());
cameraAnimation.easeFunction = EaseFunctions.easeOutSine;
extendStickAnimation.easeFunction = EaseFunctions.easeInOutQuint;
const openingAnimation = new CompositeAnimation();
openingAnimation.addAnimation("extend stick", extendStickAnimation, 0);

const swingStickKeyframes: Keyframe<number>[] = [
    {percentage: 0, value: -Math.PI / 2}, {percentage: 1, value: Math.PI * 3 / 2}
];
let stickAngle = -Math.PI / 2 ;
const swingStickAnimation = new Animation<number>(swingStickKeyframes, (value: number)=>{
    stickAngle = value;
}, new NumberAnimationHelper());
swingStickAnimation.easeFunction = EaseFunctions.easeInOutExpo;
swingStickAnimation.duration = 1;
extendStickAnimation.duration = 0.3;
openingAnimation.addAnimationAfter("swing stick", swingStickAnimation, "extend stick");
const compositeAnimation = new CompositeAnimation();
compositeAnimation.addAnimation("camera movement", cameraAnimation, 0, ()=>{
    console.log("camera movement animation completed");
});
cameraAnimation.onEnd(()=>{
    console.log("camera movement animation completed");
});
compositeAnimation.drag = 2;
compositeAnimation.onEnd(()=>{
    console.log("composite animation completed");
});
console.log("duration of composite animation", compositeAnimation.duration);
console.log("true duration of composite animation", compositeAnimation.getTrueDuration());
console.log("delay time of composite animation", compositeAnimation.delay);
console.log("drag time of composite animation", compositeAnimation.drag);
// cameraAnimation.loops = true;
// compositeAnimation.loops = true;
const mousePos = {x: 0, y: 0};

element.addEventListener("pointermove", (event)=>{
    mousePos.x = event.clientX - element.getBoundingClientRect().left;
    mousePos.y = event.clientY - element.getBoundingClientRect().top;
});

element.addEventListener("pointerdown", (event)=>{
    const clickedPoint = board.convertWindowPoint2WorldCoord({x: event.clientX, y: event.clientY});
    const keyframes: Keyframe<Point>[] = [
        {percentage: 0, value: {...board.camera.position}},
        {percentage: 1, value: clickedPoint}
    ];
    animationCenter.initiatePanTransitioinInput();
    cameraAnimation.keyFrames = keyframes;
    compositeAnimation.startAnimation();
    openingAnimation.startAnimation();
});

let lastUpdateTime = 0;
function step(timestamp: number){
    board.step(timestamp);
    const deltaTime = (timestamp - lastUpdateTime) / 1000;
    lastUpdateTime = timestamp;
    drawAxis(board.context, board.camera.boundaries, board.camera.zoomLevel, board.alignCoordinateSystem);

    const boundingBox = element.getBoundingClientRect();
    const topLeftCorner = board.convertWindowPoint2WorldCoord({x: boundingBox.left, y: boundingBox.top});
    const topRightCorner = board.convertWindowPoint2WorldCoord({x: boundingBox.right, y: boundingBox.top});
    const bottomLeftCorner = board.convertWindowPoint2WorldCoord({x: boundingBox.left, y: boundingBox.bottom});
    const bottomRightCorner = board.convertWindowPoint2WorldCoord({x: boundingBox.right, y: boundingBox.bottom});
    drawBoundingBox(board.context, board.camera.boundaries, false);

    board.context.beginPath();
    board.context.moveTo(0, 0);
    const endPoint: Point = {x: stickLength * Math.cos(stickAngle), y: stickLength * Math.sin(stickAngle)};
    board.context.lineTo(endPoint.x, endPoint.y);
    board.context.stroke();

    compositeAnimation.animate(deltaTime);
    openingAnimation.animate(deltaTime);
    // drawRuler(board.context, topLeftCorner, topRightCorner, bottomLeftCorner, bottomRightCorner, board.alignCoordinateSystem, board.camera.zoomLevel);
    window.requestAnimationFrame(step);
}

step(0);

document.addEventListener("visibilitychange", tabSwitchingHandler);

function tabSwitchingHandler(){
    if (document.hidden){
        console.log("Browser tab is hidden");
    } else {
        console.log("Browser tab is visible");
        lastUpdateTime = Date.now();
    }
}
