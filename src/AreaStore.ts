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
    private readonly onChange = new LiteEvent<void>();
    public static readonly instance = new AreaStore();

    public get Deleted() { return this.onDelete.expose(); } 
    public get Changed() { return this.onChange.expose(); }

    sendChange() {
        this.onChange.trigger();
    }

    sendDelete(id: string | number) {
        this.onDelete.trigger(id);
    }
}

export async function loadAreas() : Promise<MapArea[]> {
    const areaJson = await fetch("areas2.json");
    const areas = await areaJson.json();
    const customAreas = loadCustomAreas();
    return areas.concat(customAreas).map(f => MapArea.fromFeature(f));
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
    AreaStore.instance.sendChange();
}

export function deleteArea(loc: MapArea) {
    let areas: GeoJSON.Feature<GeoJSON.Polygon>[] = loadCustomAreas();
    
    let matchIndex = areas.findIndex(item => item.id == loc.id);
    if (matchIndex != -1) {
        areas.splice(matchIndex, matchIndex + 1);
        localStorage.setItem(StorageKey, JSON.stringify(areas));
    }

    // publish anyway, the location may not have been stored yet
    AreaStore.instance.sendDelete(loc.id);
    AreaStore.instance.sendChange();
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
