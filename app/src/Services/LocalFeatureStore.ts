import { LiteEvent } from "./LiteEvents";

const StorageKey = "customFeatures"

const colors = [
    "#ffb3ba",
    "#ffdfba",
    "#ffffba",
    "#baffc9",
    "#bae1ff",
];
let colorIndex = 0;

export class LocalFeatureStore implements FeatureStore {
    private readonly onDelete = new LiteEvent<string | number>();
    private readonly onChange = new LiteEvent<string | number>();

    public get Deleted() { return this.onDelete.expose(); } 
    public get Changed() { return this.onChange.expose(); }
    
    public async load() : Promise<GeoJSON.Feature[]> {
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
            if (!a.properties) {
                a.properties = { };
            }
            
            a.properties.custom = true;
            if (!a.properties.color || a.properties.color.trim() == "") {
                a.properties.color = colors[colorIndex++ % colors.length];
            }
        });
        return result;
    }
    
    public async update(area: MapItem) : Promise<void> {
        let features = await this.load();
        
        let matchIndex = features.findIndex(item => item.id == area.id);
        if (matchIndex == -1) {
            features.push(area.toFeature());
        }
        else {
            features[matchIndex] = area.toFeature();
        }
    
        localStorage.setItem(StorageKey, JSON.stringify(features));
        this.sendChange(area.id);
    }
    
    public async delete(area: MapItem) {
        let features = await this.load();
        
        let matchIndex = features.findIndex(item => item.id == area.id);
        if (matchIndex != -1) {
            features.splice(matchIndex, matchIndex + 1);
            localStorage.setItem(StorageKey, JSON.stringify(features));
        }
    
        // publish anyway, the location may not have been stored yet
        this.sendDelete(area.id);
    }
    
    sendChange(id: string | number) {
        this.onChange.trigger(id);
    }

    sendDelete(id: string | number) {
        this.onDelete.trigger(id);
    }
}
