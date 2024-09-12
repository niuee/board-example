// geojson data compiled from https://www.naturalearthdata.com/
// geojson data from https://geojson-maps.ash.ms/ https://github.com/AshKyd/geojson-regions

import { utils, mercatorProjection, GeoCoord, orthoProjection } from "@niuee/border";
import Board from "@niuee/board/boardify";
import { Line } from "@niuee/bend";
import { Point } from "point2point";
import lowWorld from "../../geojsons/low_world.json";
import twnJSON from "../../geojsons/taiwan.json";

declare var environment: string;


type GeoJSONFeature = {
    geometry: MultiPolygon | Polygon;
    properties: WorldGeoPropterties | TaiwanGeoPropterties;
    type: string;
}

type WorldGeoPropterties = {
    name_zht: string;
}
//{"COUNTYID":"Z","COUNTYCODE":"09007","COUNTYNAME":"連江縣","COUNTYENG":"Lienchiang County"}
type TaiwanGeoPropterties = {
    COUNTYID: string;
    COUNTYCODE: string;
    COUNTYNAME: string;
    COUNTYENG: string;
}

type MultiPolygon = {
    type: "MultiPolygon";
    coordinates: number[][][][];
}

type Polygon = {
    type: "Polygon";
    coordinates: number[][][];
}

type GeoJSON = {
    features: GeoJSONFeature[];
    type: string;
}

const lowWorldJSON = lowWorld as GeoJSON;
const taiwanJSON = twnJSON as GeoJSON;

const worldGeoCoords: GeoCoord[][][] = lowWorldJSON.features.map((country)=>{
    if(country.geometry.type !== "MultiPolygon"){
        return country.geometry.coordinates.map((polygon)=>{
            return polygon.map((coord)=>{
                return {latitude: coord[1], longitude: coord[0]};
            });
        });
    }
    return country.geometry.coordinates.map((polygon)=>{
        return polygon[0].map((coord)=>{
            return {latitude: coord[1], longitude: coord[0]};
        });
    });
});

const worldConvertedCoords: Point[][][] = worldGeoCoords.map((country)=>{
    return country.map((polygon)=>{
        return polygon.map((coord)=>{
            return mercatorProjection(coord, 0);
        });
    });
});



let centerLongitude = 120;


let element = document.getElementById("graph") as HTMLCanvasElement;
let board = new Board(element);
// board.fullScreen = true;
const ctx = board.context;

let projectionCenter = {latitude: 23, longitude: 121.5};

function step(timestamp: number){
    board.step(timestamp);
    ctx.lineWidth = 1 / board.camera.zoomLevel;
    ctx.strokeStyle = "rgb(0, 0, 0)";
    const worldConvertedOrthoCoords: {clipped: boolean, coord: Point}[][][] = worldGeoCoords.map((country)=>{
        return country.map((polygon)=>{
            return polygon.map((coord)=>{
                const res = orthoProjection(coord, projectionCenter);
                return res;
            }); 
        });
    });
    
    const notClipped = worldConvertedOrthoCoords.map((country)=>{
        return country.map((polygon)=>{
            const filtered = polygon.filter((coord)=>{
                return !coord.clipped;
            });
            return filtered;
        });
    });
    
    notClipped.forEach((country)=>{
        country.forEach((polygon)=>{
            ctx.beginPath();
            polygon.forEach((coord, index)=>{
                if(index === 0){
                    ctx.moveTo(coord.coord.x, -coord.coord.y);
                }else{
                    ctx.lineTo(coord.coord.x, -coord.coord.y);
                }
            });
            ctx.stroke();
        });
    });

    requestAnimationFrame(step);
}

step(0);
board.camera.setMinZoomLevel(0.00005);

element.addEventListener("wheel", (event)=>{
    if(!event.ctrlKey){
        const deltaY = event.deltaY;
        const deltaX = event.deltaX;
        projectionCenter.longitude += deltaX / 100;
        projectionCenter.latitude -= deltaY / 100;
    }
})