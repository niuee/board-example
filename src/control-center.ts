import { BoardCamera, Point } from "@niuee/board";
import { PanController, ZoomController, RotationController  } from "@niuee/board/board-camera";
import { PanRig, ZoomRig, RotationRig } from "@niuee/board";
import { InputControlCenter } from "@niuee/board/control-center";


export class InputControlCenterWithAnimation implements InputControlCenter, AnimationControlCenter{

    private _panController: PanController;
    private _zoomController: ZoomController;
    private _rotationController: RotationController;
    private _panState: PanState;
    private _zoomState: ZoomState;
    
    constructor(panController: PanController = new PanRig(), zoomController: ZoomController = new ZoomRig(panController), rotationController: RotationController = new RotationRig()){
        this._panController = panController;
        this._zoomController = zoomController;
        this._rotationController = rotationController;
        this._panState = new AcceptingPanUserInput(this);
        this._zoomState = new AcceptingZoomUserInput(this);
    }
    
    notifyPanInput(camera: BoardCamera, diff: Point): void {
        // pan by
        this._panState.notifyPanInput(camera, diff);
    }

    notifyZoomInput(camera: BoardCamera, deltaZoomAmount: number, anchorPoint: Point): void {
        // this._controlCenterState.notifyZoomInput(camera, deltaZoomAmount, anchorPoint);
        this._zoomState.notifyZoomInput(camera, deltaZoomAmount, anchorPoint);
    }

    notifyRotationInput(camera: BoardCamera, deltaRotation: number): void {
        // this._controlCenterState.notifyRotationInput(camera, deltaRotation);
    }

    notifyPanByTransition(camera: BoardCamera, diff: Point): void {
        // this._controlCenterState.notifyPanByTransition(camera, diff);
    }

    notifyPanToTransition(camera: BoardCamera, target: Point): void {
        this._panState.notifyPanToTransition(camera, target);
    }

    notifyZoomByAtTransition(camera: BoardCamera, deltaZoomAmount: number, anchorPoint: Point): void {
        // this._controlCenterState.notifyZoomByAtTransition(camera, deltaZoomAmount, anchorPoint);
        this._zoomState.notifyZoomByAtTransition(camera, deltaZoomAmount, anchorPoint);
        // this._zoomState.notifyZoomToAtOnTarget(camera, camera.zoomLevel + deltaZoomAmount, anchorPoint);
    }

    notifyRotationByTransition(camera: BoardCamera, deltaRotation: number): void {
        // this._controlCenterState.notifyRotationByTransition(camera, deltaRotation);
    }

    initiatePanTransitioinInput(): void {
        this._panState = new PanTransitionState(this);
    }

    userTakeBackPanControl(): void {
        this._panState = new AcceptingPanUserInput(this);
    }

    userTakeBackZoomControl(): void {
        // this._controlCenterState = new AcceptingZoomUserInput(this);
        this._zoomState = new AcceptingZoomUserInput(this);
    }
    
    get panController(): PanController {
        return this._panController;
    }

    get zoomController(): ZoomController {
        return this._zoomController;
    }

    get rotationController(): RotationController {
        return this._rotationController;
    }

    set panController(panController: PanController) {
        this._panController = panController;
    }

    set zoomController(zoomController: ZoomController) {
        this._zoomController = zoomController;
    }

    set rotationController(rotationController: RotationController) {
        this._rotationController = rotationController;
    }
}

export class PanTransitionState implements PanState {
    private _controlCenter: InputControlCenterWithAnimation;

    constructor(controlCenter: InputControlCenterWithAnimation){
        this._controlCenter = controlCenter;
    }

    notifyPanByTransition(camera: BoardCamera, diff: Point): void {
        this._controlCenter.panController.panCameraBy(camera, diff);
    }

    notifyPanToTransition(camera: BoardCamera, target: Point): void {
        this._controlCenter.panController.panCameraTo(camera, target);
    }

    notifyPanInput(camera: BoardCamera, diff: Point): void {
        this._controlCenter.userTakeBackPanControl();
        this._controlCenter.panController.panCameraBy(camera, diff);
        return;
    }

    notifyPanToOnTarget(camera: BoardCamera, target: Point): void {
        return;
    }

}

export class AcceptingPanUserInput implements PanState {

    private _controlCenter: InputControlCenterWithAnimation;

    constructor(controlCenter: InputControlCenterWithAnimation){
        this._controlCenter = controlCenter;
    }

    notifyPanByTransition(camera: BoardCamera, diff: Point): void {
        return;
    }

    notifyPanToTransition(camera: BoardCamera, target: Point): void {
        return;
    }

    notifyPanInput(camera: BoardCamera, diff: Point): void {
        this._controlCenter.panController.panCameraBy(camera, diff);
    }

    notifyPanToOnTarget(camera: BoardCamera, target: Point): void {
        return;
    }
}

export class AcceptingZoomUserInput implements ZoomState {

    private _controlCenter: InputControlCenterWithAnimation;

    constructor(controlCenter: InputControlCenterWithAnimation){
        this._controlCenter = controlCenter;
    }

    notifyZoomByAtTransition(camera: BoardCamera, deltaZoomAmount: number, anchorPoint: Point): void {
        return;
    }

    notifyZoomInput(camera: BoardCamera, deltaZoomAmount: number, anchorPoint: Point): void {
        this._controlCenter.zoomController.zoomCameraToAt(camera, camera.zoomLevel + deltaZoomAmount, anchorPoint);
    }

    notifyZoomToAtOnTarget(camera: BoardCamera, targetZoom: number, anchorPoint: Point): void {
       return; 
    }

}

export class ZoomTransistionState implements ZoomState {
    private _controlCenter: InputControlCenterWithAnimation;

    constructor(controlCenter: InputControlCenterWithAnimation){
        this._controlCenter = controlCenter;
    }

    notifyZoomByAtTransition(camera: BoardCamera, deltaZoomAmount: number, anchorPoint: Point): void {
        this._controlCenter.zoomController.zoomCameraByAt(camera, deltaZoomAmount, anchorPoint);
    }

    notifyZoomInput(camera: BoardCamera, deltaZoomAmount: number, anchorPoint: Point): void {
        this._controlCenter.userTakeBackZoomControl();
        this._controlCenter.zoomController.zoomCameraByAt(camera, deltaZoomAmount, anchorPoint);
        return;
    }

    notifyZoomToAtOnTarget(camera: BoardCamera, targetZoom: number, anchorPoint: Point): void {
        return;
    }
}

export interface PanState {
    notifyPanByTransition(camera: BoardCamera, diff: Point): void;
    notifyPanToTransition(camera: BoardCamera, target: Point): void;
    notifyPanToOnTarget(camera: BoardCamera, target: Point): void;
    notifyPanInput(camera: BoardCamera, diff: Point): void;
}

export interface ZoomState {
    notifyZoomByAtTransition(camera: BoardCamera, deltaZoomAmount: number, anchorPoint: Point): void;
    notifyZoomToAtOnTarget(camera: BoardCamera, targetZoom: number, anchorPoint: Point): void;
    notifyZoomInput(camera: BoardCamera, deltaZoomAmount: number, anchorPoint: Point): void;
}

export interface RotationState {
    notifyRotationByIpnut(camera: BoardCamera, deltaRotation: number): void;
    notifyRotationByTransition(camera: BoardCamera, deltaRotation: number): void;
    notifyRotationToOnTarget(camera: BoardCamera, targetRotation: number): void;
}

export interface UserInputControlCenter {
    notifyPanInput(camera: BoardCamera, diff: Point): void;
    notifyZoomInput(camera: BoardCamera, deltaZoomAmount: number, anchorPoint: Point): void;
    notifyRotationInput(camera: BoardCamera, deltaRotation: number): void;
}

export interface AnimationControlCenter {
    notifyPanByTransition(camera: BoardCamera, diff: Point): void;
    notifyPanToTransition(camera: BoardCamera, target: Point): void;
    notifyZoomByAtTransition(camera: BoardCamera, deltaZoomAmount: number, anchorPoint: Point): void;
    notifyRotationByTransition(camera: BoardCamera, deltaRotation: number): void;
}

export interface LockedOnObjectControlCenter {
    notifyPanToOnTarget(camera: BoardCamera, target: Point): void;
    notifyZoomToAtOnTarget(camera: BoardCamera, targetZoom: number, anchorPoint: Point): void;
    notifyRotationToOnTarget(camera: BoardCamera, targetRotation: number): void;
}
