import { Api } from "./Api";
import { LiteEvent } from "./LiteEvents";

export class ApiFeatureStore implements FeatureStore {
    private readonly onDelete = new LiteEvent<string | number>();
    private readonly onChange = new LiteEvent<string | number>();

    public get Deleted() { return this.onDelete.expose(); } 
    public get Changed() { return this.onChange.expose(); }

    public async load() : Promise<GeoJSON.Feature[]> {
        const locationCollection: GeoJSON.FeatureCollection = await Api.getFeatures();
        return locationCollection.features;
    }

    public async update(feature: MapItem) : Promise<void> {
        await Api.addFeature(feature.toFeature());    
        this.sendChange(feature.id);
    }

    public async delete(feature: MapItem) : Promise<void> {
        await Api.deleteFeature(feature.id.toString());        
        this.sendDelete(feature.id);
    }

    sendChange(id: string | number) {
        this.onChange.trigger(id);
    }

    sendDelete(id: string | number) {
        this.onDelete.trigger(id);
    }
}
