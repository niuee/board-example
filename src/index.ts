import Board from "@niuee/board/boardify";
import { Point } from "point2point";
import { drawAxis, drawBoundingBox } from "@niuee/board/boardify/utils";
import {
  Keyframe,
  Animation,
  CompositeAnimation,
  PointAnimationHelper,
  NumberAnimationHelper,
} from "@niuee/bounce";
import * as EaseFunctions from "@niuee/bounce/ease-functions";
import { InputControlCenterWithAnimation } from "./control-center";

let element = document.getElementById("test-graph") as HTMLCanvasElement;
let board = new Board(element);
// board.fullScreen = true;
board.limitEntireViewPort = true;
board.panHandler.restrictTranslation = true;
const animationCenter = new InputControlCenterWithAnimation();
board.controlCenter = animationCenter;

const pointKeyframes: Keyframe<Point>[] = [
  { percentage: 0, value: { x: 0, y: 0 } },
  { percentage: 1, value: { x: 100, y: 100 } },
];
const extendStickKeyframes: Keyframe<number>[] = [
  { percentage: 0, value: 0 },
  { percentage: 1, value: 100 },
];
let stickLength = 0;

const extendStickAnimation = new Animation<number>(
  extendStickKeyframes,
  (value: number) => {
    stickLength = value;
  },
  new NumberAnimationHelper()
);
const cameraAnimation = new Animation<Point>(
  pointKeyframes,
  (point: Point) => {
    animationCenter.notifyPanToTransition(board.camera, point);
  },
  new PointAnimationHelper()
);
cameraAnimation.easeFunction = EaseFunctions.easeOutSine;
extendStickAnimation.easeFunction = EaseFunctions.easeInOutQuint;
const openingAnimation = new CompositeAnimation();
openingAnimation.addAnimation("extend stick", extendStickAnimation, 0);
board.camera.setRotation( 45 * Math.PI / 180);
const swingStickKeyframes: Keyframe<number>[] = [
  { percentage: 0, value: -Math.PI / 2, easingFn: EaseFunctions.easeInOutExpo },
  { percentage: 0.5, value: (Math.PI * 3) / 2, easingFn: EaseFunctions.easeInOutExpo},
  // { percentage: 1, value: -Math.PI / 2, easingFn: EaseFunctions.easeInOutExpo },
];
let stickAngle = -Math.PI / 2;
const swingStickAnimation = new Animation<number>(
  swingStickKeyframes,
  (value: number) => {
    stickAngle = value;
  },
  new NumberAnimationHelper()
);
swingStickAnimation.onStart(() => {
  console.log("swing stick animation started playing but may have delay");
});
swingStickAnimation.onStartAfterDelay(() => {
  console.log("swing stick animation started playing after delay");
});
// swingStickAnimation.easeFunction = EaseFunctions.easeInOutExpo;
swingStickAnimation.delay = 0;
swingStickAnimation.drag = 1000;
console.log("swing stick delay", swingStickAnimation.delay);
console.log("swing stick drag", swingStickAnimation.drag);
console.log("swing stick duration", swingStickAnimation.duration);
console.log("swing stick true duration", swingStickAnimation.trueDuration);

swingStickAnimation.onEnd(() => {
  console.log("swing stick animation completed");
});
// extendStickAnimation.onEnd(()=>{
//     console.log("extend stick animation completed");
// });
extendStickAnimation.duration = 300;
openingAnimation.addAnimationAfter(
  "swing stick",
  swingStickAnimation,
  "extend stick"
);
openingAnimation.onEnd(() => {
  console.log("opening animation completed");
  board.panHandler.restrictTranslation = false;
});
console.log("duration of opening animation", openingAnimation.duration);
const compositeAnimation = new CompositeAnimation();
// extendStickAnimation.loops = true;
// swingStickAnimation.loops = true;
// openingAnimation.loops = true;

compositeAnimation.onEnd(() => {
  console.log("composite animation completed");
});

// openingAnimation.toggleReverse(true);
compositeAnimation.duration = 1000;
const mousePos = { x: 0, y: 0 };

element.addEventListener("pointermove", (event) => {
  mousePos.x = event.clientX - element.getBoundingClientRect().left;
  mousePos.y = event.clientY - element.getBoundingClientRect().top;
});

element.addEventListener("pointerdown", (event) => {
  const clickedPoint = board.convertWindowPoint2WorldCoord({
    x: event.clientX,
    y: event.clientY,
  });
  console.log("clicked point", clickedPoint);
  const keyframes: Keyframe<Point>[] = [
    { percentage: 0, value: { ...board.camera.position } },
    { percentage: 1, value: clickedPoint },
  ];
  animationCenter.initiatePanTransitioinInput();
  cameraAnimation.keyFrames = keyframes;
  compositeAnimation.startAnimation();
  openingAnimation.startAnimation();
});

let lastUpdateTime = 0;
function step(timestamp: number) {
  board.step(timestamp);
  const deltaTime = (timestamp - lastUpdateTime) / 1000;
  const deltaTimeMili = timestamp - lastUpdateTime;
  lastUpdateTime = timestamp;
  drawAxis(
    board.context,
    board.camera.boundaries,
    board.camera.zoomLevel,
    board.alignCoordinateSystem
  );

  const boundingBox = element.getBoundingClientRect();
  const topLeftCorner = board.convertWindowPoint2WorldCoord({
    x: boundingBox.left,
    y: boundingBox.top,
  });
  const topRightCorner = board.convertWindowPoint2WorldCoord({
    x: boundingBox.right,
    y: boundingBox.top,
  });
  const bottomLeftCorner = board.convertWindowPoint2WorldCoord({
    x: boundingBox.left,
    y: boundingBox.bottom,
  });
  const bottomRightCorner = board.convertWindowPoint2WorldCoord({
    x: boundingBox.right,
    y: boundingBox.bottom,
  });
  drawBoundingBox(board.context, board.camera.boundaries, false);

  board.context.beginPath();
  board.context.moveTo(0, 0);
  const endPoint: Point = {
    x: stickLength * Math.cos(stickAngle),
    y: stickLength * Math.sin(stickAngle),
  };
  board.context.lineTo(endPoint.x, endPoint.y);
  board.context.stroke();

  compositeAnimation.animate(deltaTimeMili);
  openingAnimation.animate(deltaTimeMili);
  // drawRuler(board.context, topLeftCorner, topRightCorner, bottomLeftCorner, bottomRightCorner, board.alignCoordinateSystem, board.camera.zoomLevel);
  window.requestAnimationFrame(step);
}

step(0);

const workerA = new Worker("webworkerA.js");
workerA.postMessage("Hello from main script");

const workerB = new Worker("webworkerB.js");

const channel = new MessageChannel();
workerA.postMessage({ port: channel.port1 }, [channel.port1]);
workerB.postMessage({ port: channel.port2 }, [channel.port2]);

document.addEventListener("visibilitychange", tabSwitchingHandler);


function tabSwitchingHandler() {
  if (document.hidden) {
    console.log("Browser tab is hidden");
  } else {
    console.log("Browser tab is visible");
    lastUpdateTime = Date.now();
  }
}
