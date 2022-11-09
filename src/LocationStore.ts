import type { LatLng } from "leaflet";
import { v4 as uuid } from 'uuid';

const StorageKey = "customLocations";

let deleteListeners : ((id: string) => void)[] = [];
let changeListeners : (() => void)[] = [];

export class CustomMapLocation implements MapLocation {
    public id: string;
    public name: string;
    public region: string;
    public country: string;
    public loc: LatLng;

    constructor(id: string, name: string, region: string, country: string, loc: LatLng) {
        this.id = id;
        this.name = name;
        this.region = region;
        this.country = country;
        this.loc = loc;
    }

    static create(loc: LatLng){
        return new CustomMapLocation(uuid(), "", "", "", loc);
    }
}

export async function loadLocations() : Promise<MapLocation[]> {
    let locations = await (await fetch("locations.json")).json();

    let customLocations = loadCustomLocations();

    return locations.concat(customLocations)
        .map(l => {
            return l.id == undefined ? l : new CustomMapLocation(l.id, l.name, l.region, l.country, l.loc);
        });
}

export function addLocation(loc: CustomMapLocation) {
    let customLocations: CustomMapLocation[] = loadCustomLocations();
    
    let matchIndex = customLocations.findIndex(item => item.id == loc.id);
    if (matchIndex == -1) {
        customLocations.push(loc);
    }
    else {
        customLocations[matchIndex] = loc;
    }

    localStorage.setItem(StorageKey, JSON.stringify(customLocations));
    changeListeners.forEach(h => h());
}

export function addArea(area: MapArea) {

}

export function deleteLocation(loc: CustomMapLocation) {
    let customLocations: CustomMapLocation[] = loadCustomLocations();
    
    let matchIndex = customLocations.findIndex(item => item.id == loc.id);
    if (matchIndex != -1) {
        customLocations.splice(matchIndex, matchIndex + 1);
        localStorage.setItem(StorageKey, JSON.stringify(customLocations));
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

function loadCustomLocations() {
    let customLocations: CustomMapLocation[];
    let locsJson = localStorage.getItem(StorageKey);
    if (locsJson == undefined || locsJson == "") {
        customLocations = [];
    }
    else {
        // TODO: do type checking
        customLocations = JSON.parse(locsJson);
    }
    return customLocations;
}
