import { Board, drawAxis } from "@niuee/board";
import mrtTrack from "../../geojsons/taipeiMRT-network.json" assert {type: "json"};
import { parseParenthese, validParenthese, parseGeoCoordinate } from "../parenthesesParser";
import { mercatorProjection } from "@niuee/border";

console.log("mrtTrack", mrtTrack);

const res = parseParenthese(mrtTrack[0].Geometry);
const brownLine = parseParenthese(mrtTrack[1].Geometry);

const polyLines = res.map((polyline)=>{
    const coords = parseGeoCoordinate(polyline);
    return coords;
});

const brownLinePolyLines = brownLine.map((polyline)=>{
    const coords = parseGeoCoordinate(polyline);
    return coords;
});

console.log("polyLines", polyLines);

const offset = mercatorProjection({longitude: 120.231248, latitude: 22.991720});
const scale = 0.000001;
offset.x *= scale;
offset.y *= scale;
console.log("offset", offset);

const shtrackpolylinesCoverted = polyLines.map((polyline)=>{
    console.log("polyline: ", polyline);
    const coords = polyline.map((coord)=>{
        const res = mercatorProjection({latitude: coord.lat, longitude: coord.longi});
        res.x = res.x * scale - offset.x;
        res.y = res.y * scale - offset.y;
        return res;
    });
    console.log("coords", coords);
    return coords;
});

const brownLineConverted = brownLinePolyLines.map((polyline)=>{
    console.log("polyline: ", polyline);
    const coords = polyline.map((coord)=>{
        const res = mercatorProjection({latitude: coord.lat, longitude: coord.longi});
        res.x = res.x * scale - offset.x;
        res.y = res.y * scale - offset.y;
        return res;
    });
    console.log("coords", coords);
    return coords;
});

const canvas = document.querySelector("#graph") as HTMLCanvasElement;
const board = new Board(canvas);

function step(timestamp: number){
    board.step(timestamp);
    drawAxis(board.context, board.camera.boundaries, board.camera.zoomLevel, board.alignCoordinateSystem);
    shtrackpolylinesCoverted.forEach((polyline)=>{
        board.context.beginPath();
        if(polyline.length > 0){
            board.context.moveTo(polyline[0].x, -polyline[0].y);
            for(let index = 1; index < polyline.length; index++){
                board.context.lineTo(polyline[index].x, -polyline[index].y);
            }
        }
        board.context.stroke();
    });
    brownLineConverted.forEach((polyline)=>{
        board.context.beginPath();
        if(polyline.length > 0){
            board.context.moveTo(polyline[0].x, -polyline[0].y);
            for(let index = 1; index < polyline.length; index++){
                board.context.lineTo(polyline[index].x, -polyline[index].y);
            }
        }
        board.context.stroke();
    });
    requestAnimationFrame(step);
}

window.requestAnimationFrame(step);
