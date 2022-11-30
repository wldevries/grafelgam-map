import { Api } from "./Api";
import { LiteEvent } from "./LiteEvents";
import { MapArea } from "./MapArea";

const StorageKey = "customAreas"

const colors = [
    "#ffb3ba",
    "#ffdfba",
    "#ffffba",
    "#baffc9",
    "#bae1ff",
];
let colorIndex = 0;

export class AreaStore {
    private readonly onDelete = new LiteEvent<string | number>();
    private readonly onChange = new LiteEvent<string | number>();
    public static readonly instance = new AreaStore();

    public get Deleted() { return this.onDelete.expose(); } 
    public get Changed() { return this.onChange.expose(); }

    public Load() {
        return loadAreas();
    }

    public Update(loc: MapArea) {
        addArea(loc);
    }

    sendChange(id: string | number) {
        this.onChange.trigger(id);
    }

    sendDelete(id: string | number) {
        this.onDelete.trigger(id);
    }
}

export async function loadAreas() : Promise<MapArea[]> {
    // const areas = await loadAreasWeb();

    const areaCollection = await Api.getAreas();
    const areas = areaCollection.features;

    const customAreas = loadCustomAreas();
    return areas.concat(customAreas).map(f => MapArea.fromFeature(f));
}

async function loadAreasWeb() : Promise<GeoJSON.Feature<GeoJSON.Polygon>[]> {
    const areaJson = await fetch("areas2.json");
    return await areaJson.json();
}

export function addArea(area: MapArea) {
    let areas: GeoJSON.Feature<GeoJSON.Polygon>[] = loadCustomAreas();
    
    let matchIndex = areas.findIndex(item => item.id == area.id);
    if (matchIndex == -1) {
        areas.push(area.toFeature());
    }
    else {
        areas[matchIndex] = area.toFeature();
    }

    localStorage.setItem(StorageKey, JSON.stringify(areas));
    AreaStore.instance.sendChange(area.id);
}

export function deleteArea(area: MapArea) {
    let areas: GeoJSON.Feature<GeoJSON.Polygon>[] = loadCustomAreas();
    
    let matchIndex = areas.findIndex(item => item.id == area.id);
    if (matchIndex != -1) {
        areas.splice(matchIndex, matchIndex + 1);
        localStorage.setItem(StorageKey, JSON.stringify(areas));
    }

    // publish anyway, the location may not have been stored yet
    AreaStore.instance.sendDelete(area.id);
}

function loadCustomAreas(): GeoJSON.Feature<GeoJSON.Polygon>[] {
    let result: GeoJSON.Feature<GeoJSON.Polygon>[];
    let areaJson = localStorage.getItem(StorageKey);
    if (areaJson == undefined || areaJson == "") {
        result = [];
    }
    else {
        // TODO: do type checking
        result = JSON.parse(areaJson);
    }
    // Make sure the custom property is set
    result.forEach(a => {
        a.properties.custom = true;
        if (!a.properties.color || a.properties.color.trim() == "") {
            a.properties.color = colors[colorIndex++ % colors.length];
        }
    });
    return result;
}
