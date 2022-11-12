import { LatLng } from "leaflet";
import { v4 as uuid } from 'uuid';

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
