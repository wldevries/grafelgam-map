import { TelephoneInbound } from "svelte-bootstrap-icons";
import { google_jwt } from "../Stores";
import { ApiFeatureStore } from "./ApiFeatureStore"
import { LiteEvent } from "./LiteEvents";
import { LocalFeatureStore } from "./LocalFeatureStore"

const localFeatureStore = new LocalFeatureStore();
const apiFeatureStore = new ApiFeatureStore();

class ProxyFeatureStore implements FeatureStore {
    private readonly onDelete = new LiteEvent<string | number>();
    private readonly onChange = new LiteEvent<string | number>();

    private impl: FeatureStore;

    constructor() {        
        this.impl = localFeatureStore;

        localFeatureStore.Changed.on(this.onChange.trigger);
        localFeatureStore.Deleted.on(this.onDelete.trigger);

        google_jwt.subscribe(t => {
            if (t) {
                this.impl = apiFeatureStore;
            } else {
                this.impl = localFeatureStore;
            }
        });
    }

    public get Deleted() { return this.onDelete.expose(); } 
    public get Changed() { return this.onChange.expose(); }
    
    public async load() : Promise<GeoJSON.Feature[]> {
        return await this.impl.load();
    }
    
    public async update(area: MapItem) : Promise<void> {
        await this.impl.update(area)
    }

    public async delete(area: MapItem) {
        await this.impl.delete(area);
    }
}

export const featureStore = new ProxyFeatureStore();
