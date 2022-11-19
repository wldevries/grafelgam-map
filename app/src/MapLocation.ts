import { LatLng } from "leaflet";
import { v4 as uuid } from 'uuid';

export class MapLocation {
    public id: string | number;
    public name: string;
    public region: string;
    public country: string;
    public icon: string;
    public loc: LatLng;
    private custom: boolean;

    constructor(id: string | number, name: string, region: string, country: string, icon: string, loc: LatLng) {
        this.id = id;
        this.name = name;
        this.region = region;
        this.country = country;
        this.icon = icon;
        this.loc = loc;
    }

    public isCustom() {
        return (this.custom && this.custom == true);
    }

    public setCustom() {
        this.custom = true;
    }

    static create(loc: LatLng) {
        return new MapLocation(uuid(), "", "", "", "", loc);
    }

    public popupText() {
        return this.name;
        // if (this.region == undefined) {
        //     return `<h3>${this.name}</h3><p>${this.country}</p>`;
        // }
        // return `<h3>${this.name}</h3><p>${this.country}  (${this.region})</p>`;        
    }

    static fromFeature(feature: GeoJSON.Feature<GeoJSON.Point>) {
        var loc = new MapLocation(
            feature.id,
            feature.properties.name,
            feature.properties.region,
            feature.properties.country,
            feature.properties.icon,
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
                icon: this.icon,
                custom: this.custom,
            },
        };
    }
}
