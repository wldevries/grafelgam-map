import type { LatLng } from "leaflet";
import { v4 as uuid } from 'uuid';

const StorageKey = "customAreas"

let deleteListeners : ((id: string) => void)[] = [];
let changeListeners : (() => void)[] = [];

export class CustomMapArea {
    public id: string;
    public name: string;
    public locs: LatLng[];

    constructor(id: string, name: string, locs: LatLng[]) {
        this.id = id;
        this.name = name;
        this.locs = locs;
    }

    static create(locs: LatLng[]) {
        return new CustomMapArea(uuid(), "", locs);
    }
}

export async function loadAreas() : Promise<MapArea[]> {
    const areaJson = await fetch("areas.json");
    const areas = await areaJson.json();
    const customAreas = loadCustomAreas();
    return areas.concat(customAreas);
}

export function addArea(area: MapArea) {
    let areas: MapArea[] = loadCustomAreas();
    
    let matchIndex = areas.findIndex(item => item.id == area.id);
    if (matchIndex == -1) {
        areas.push(area);
    }
    else {
        areas[matchIndex] = area;
    }

    localStorage.setItem(StorageKey, JSON.stringify(areas));
    changeListeners.forEach(h => h());
}

export function deleteArea(loc: MapArea) {
    let areas: MapArea[] = loadCustomAreas();
    
    let matchIndex = areas.findIndex(item => item.id == loc.id);
    if (matchIndex != -1) {
        areas.splice(matchIndex, matchIndex + 1);
        localStorage.setItem(StorageKey, JSON.stringify(areas));
    }

    // publish anyway, the location may not have been stored yet
    deleteListeners.forEach(h => h(loc.id));
    changeListeners.forEach(h => h());
}

export function onDelete(handlerfn: (id: string) => void) {
    deleteListeners.push(handlerfn);
}

export function offDelete(handlerfn: (id: string) => void) {
    deleteListeners.splice(deleteListeners.indexOf(handlerfn));
}

export function onChange(handlerfn: () => void) {
    changeListeners.push(handlerfn);
}


function loadCustomAreas(): CustomMapArea[] {
    let result: MapArea[];
    let areaJson = localStorage.getItem(StorageKey);
    if (areaJson == undefined || areaJson == "") {
        result = [];
    }
    else {
        // TODO: do type checking
        result = JSON.parse(areaJson);
    }
    return result.map(a =>  new CustomMapArea(a.id, a.name, a.locs));
}
