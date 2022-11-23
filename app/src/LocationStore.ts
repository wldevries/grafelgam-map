import { Api } from "./Api";
import { LiteEvent } from "./LiteEvents";
import { MapLocation } from "./MapLocation";

const StorageKey = "customLocations";

export class LocationStore {
    private readonly onDelete = new LiteEvent<string | number>();
    private readonly onChange = new LiteEvent<string | number>();
    public static readonly instance = new LocationStore();

    public get Deleted() { return this.onDelete.expose(); } 
    public get Changed() { return this.onChange.expose(); }

    public Load() {
        return loadLocations();
    }

    public async Update(loc: MapLocation) {
        await addLocation(loc);
    }

    sendChange(id: string | number) {
        this.onChange.trigger(id);
    }

    sendDelete(id: string | number) {
        this.onDelete.trigger(id);
    }
}

export async function loadLocations() : Promise<MapLocation[]> {
    const locations: GeoJSON.Feature<GeoJSON.Point>[] = await loadLocationsWeb();

    // const locationCollection: GeoJSON.FeatureCollection<GeoJSON.Point> = await Api.getPlaces();
    // const locations = locationCollection.features;

    const clocationCollection: GeoJSON.FeatureCollection<GeoJSON.Point> = await Api.getCustomPlaces();
    const clocations = clocationCollection.features;

    const customLocations = loadCustomLocations();
    return locations
        .concat(customLocations)
        .concat(clocations)
        .map(f => MapLocation.fromFeature(f));
}

async function loadLocationsWeb() : Promise<GeoJSON.Feature<GeoJSON.Point>[]> {
    const locationJson = await fetch("locations2.json");
    return await locationJson.json();
}

export async function addLocation(loc: MapLocation) {
    // let customLocations = loadCustomLocations();
    
    // let matchIndex = customLocations.findIndex(item => item.id == loc.id);
    // if (matchIndex == -1) {
    //     customLocations.push(loc.toFeature());
    // }
    // else {
    //     customLocations[matchIndex] = loc.toFeature();
    // }

    // localStorage.setItem(StorageKey, JSON.stringify(customLocations));

    await Api.addPlace(loc.toFeature());

    LocationStore.instance.sendChange(loc.id);
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
