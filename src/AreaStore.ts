import type { LatLng } from "leaflet";
import { v4 as uuid } from 'uuid';

const StorageKey = "customAreas"

let deleteListeners : ((id: string) => void)[] = [];
let changeListeners : (() => void)[] = [];

export class MapArea {
    public id: string;
    public name: string;
    public locs: LatLng[];

    constructor(id: string, name: string, locs: LatLng[]) {
        this.id = id;
        this.name = name;
        this.locs = locs;
    }

    static create(locs: LatLng[]) {
        return new MapArea(uuid(), "", locs);
    }
}

export async function loadAreas() : Promise<MapArea[]> {
    // let locations = await (await fetch("locations.json")).json();

    // let customLocations = loadCustomLocations();

    // return locations.concat(customLocations)
    //     .map(l => {
    //         return l.id == undefined ? l : new MapArea(l.id, l.name, l.locs);
    //     });

    return loadCustomAreas();
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

function loadCustomAreas() {
    let result: MapArea[];
    let locsJson = localStorage.getItem(StorageKey);
    if (locsJson == undefined || locsJson == "") {
        result = [];
    }
    else {
        // TODO: do type checking
        result = JSON.parse(locsJson);
    }
    return result;
}
