import { LiteEvent } from "./LiteEvents";
import { MapLocation } from "./MapLocation";

const StorageKey = "customLocations";

export class LocationStore {
    private readonly onDelete = new LiteEvent<string | number>();
    private readonly onChange = new LiteEvent<void>();
    public static readonly instance = new LocationStore();

    public get Deleted() { return this.onDelete.expose(); } 
    public get Changed() { return this.onChange.expose(); }

    sendChange() {
        this.onChange.trigger();
    }

    sendDelete(id: string | number) {
        this.onDelete.trigger(id);
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
    LocationStore.instance.sendChange();
}

export function deleteLocation(loc: MapLocation) {
    let customLocations: GeoJSON.Feature<GeoJSON.Point>[] = loadCustomLocations();
    
    let matchIndex = customLocations.findIndex(item => item.id == loc.id);
    if (matchIndex != -1) {
        customLocations.splice(matchIndex, matchIndex + 1);
        localStorage.setItem(StorageKey, JSON.stringify(customLocations));
    }

    // publish anyway, the location may not have been stored yet
    LocationStore.instance.sendDelete(loc.id);
    LocationStore.instance.sendChange();
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
