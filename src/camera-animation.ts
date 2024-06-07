import { BoardCamera } from "@niuee/board/board-camera";
import { Point } from "point2point";

interface BoardState {
    panCameraTo(camera: BoardCamera, destination: Point): void;
    panCameraBy(camera: BoardCamera, delta: Point): void;
    zoomCameraTo(camera: BoardCamera, to: number): void;
    zoomCameraBy(camera: BoardCamera, delta: number): void;
    zoomCameraToAt(camera: BoardCamera, to: number, point: Point): void;
    zoomCameraByAt(camera: BoardCamera, delta: number, point: Point): void;
    rotateCameraTo(camera: BoardCamera, to: number): void;
    rotateCameraBy(camera: BoardCamera, delta: number): void;
}


