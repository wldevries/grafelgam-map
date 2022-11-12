import { LatLng } from "leaflet";
import { v4 as uuid } from 'uuid';

const StorageKey = "customLocations";

let deleteListeners : ((id: string | number) => void)[] = [];
let changeListeners : (() => void)[] = [];

export class MapLocation {
    public id: string | number;
    public name: string;
    public region: string;
    public country: string;
    public loc: LatLng;
    private custom: boolean;

    constructor(id: string | number, name: string, region: string, country: string, loc: LatLng) {
        this.id = id;
        this.name = name;
        this.region = region;
        this.country = country;
        this.loc = loc;
    }

    isCustom() {
        return (this.custom && this.custom == true)
    }

    setCustom() {
        this.custom = true;
    }

    static create(loc: LatLng) {
        return new MapLocation(uuid(), "", "", "", loc);
    }

    static fromFeature(feature: GeoJSON.Feature<GeoJSON.Point>) {
        var loc = new MapLocation(
            feature.id,
            feature.properties.name,
            feature.properties.region,
            feature.properties.country,
            new LatLng(feature.geometry.coordinates[1], feature.geometry.coordinates[0])
        );
        loc.custom = feature.properties.custom;
        return loc;
    }

    toFeature(): GeoJSON.Feature<GeoJSON.Point> {
        return {
            type: "Feature",
            id: this.id,
            geometry: {
                type: "Point",
                coordinates: [this.loc.lng, this.loc.lat]
            },
            properties: {
                name: this.name,
                region: this.region,
                country: this.country,
                custom: this.custom,
            },
        };
    }
}

export async function loadLocations() : Promise<MapLocation[]> {
    const locationJson = await fetch("locations2.json");
    const locations: GeoJSON.Feature<GeoJSON.Point>[] = await locationJson.json();
    const customLocations = loadCustomLocations();
    return locations.concat(customLocations).map(f => MapLocation.fromFeature(f));
}

export function addLocation(loc: MapLocation) {
    let customLocations = loadCustomLocations();
    
    let matchIndex = customLocations.findIndex(item => item.id == loc.id);
    if (matchIndex == -1) {
        customLocations.push(loc.toFeature());
    }
    else {
        customLocations[matchIndex] = loc.toFeature();
    }

    localStorage.setItem(StorageKey, JSON.stringify(customLocations));
    changeListeners.forEach(h => h());
}

export function deleteLocation(loc: MapLocation) {
    let customLocations: GeoJSON.Feature<GeoJSON.Point>[] = loadCustomLocations();
    
    let matchIndex = customLocations.findIndex(item => item.id == loc.id);
    if (matchIndex != -1) {
        customLocations.splice(matchIndex, matchIndex + 1);
        localStorage.setItem(StorageKey, JSON.stringify(customLocations));
    }

    // publish anyway, the location may not have been stored yet
    deleteListeners.forEach(h => h(loc.id));
    changeListeners.forEach(h => h());
}

export function onDelete(handlerfn: (id: string | number) => void) {
    deleteListeners.push(handlerfn);
}

export function offDelete(handlerfn: (id: string | number) => void) {
    deleteListeners.splice(deleteListeners.indexOf(handlerfn));
}

export function onChange(handlerfn: () => void) {
    changeListeners.push(handlerfn);
}

function loadCustomLocations() : GeoJSON.Feature<GeoJSON.Point>[] {
    let customLocations: GeoJSON.Feature<GeoJSON.Point>[];
    let locsJson = localStorage.getItem(StorageKey);
    if (locsJson == undefined || locsJson == "") {
        customLocations = [];
    }
    else {
        // TODO: do type checking
        customLocations = JSON.parse(locsJson);
    }
    // Make sure the custom property is set
    customLocations.forEach(l => l.properties.custom = true);
    return customLocations;
}
