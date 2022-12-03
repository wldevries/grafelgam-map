/// <reference types="svelte" />

interface Rune {
    name: string;
    translation: string;
    translations: string[];
}

interface MapItem {
    id: string | number;
    toFeature(): GeoJSON.Feature;
}

interface ILiteEvent<T> {
    on(handler: { (data?: T): void }) : void;
    off(handler: { (data?: T): void }) : void;
}

interface FeatureStore {
    get Deleted() : ILiteEvent<Number | string>;
    get Changed() : ILiteEvent<Number | string>;
    load() : Promise<GeoJSON.Feature[]>;
    update(feature: MapItem) : Promise<void>;
    delete(feature: MapItem) : Promise<void>;
}

interface GoogleProfile {
    sub : string,
    name : string,
    given_name : string,
    family_name : string,
    picture : string,
    email: string,
};
