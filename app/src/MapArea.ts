import { latLngBounds, LatLng } from "leaflet";
import { v4 as uuid } from 'uuid';

const hasAtLeastOneDimension = (x: unknown): x is readonly unknown[] => Array.isArray(x)
const hasAtLeastTwoDimensions = (x: unknown): x is readonly unknown[][] => Array.isArray(x) && x.every(hasAtLeastOneDimension)
const hasAtLeastThreeDimensions = (x: unknown): x is readonly unknown[][][] => Array.isArray(x) && x.every(hasAtLeastTwoDimensions)

export class MapArea implements MapItem {
    public id: string | number;
    public name: string;
    public locs: LatLng[][] | LatLng[][][];
    public color: string | undefined;
    private custom: boolean;

    constructor(id: string | number, name: string, color: string, locs: LatLng[][] | LatLng[][][]) {
        this.id = id;
        this.name = name;
        this.color = color;
        this.locs = locs;
    }

    public isCustom() {
        return (this.custom && this.custom == true);
    }

    public setCustom() {
        this.custom = true;
    }

    public setPolygonLocs(polygonPoints: LatLng[] | LatLng[][] | LatLng[][][]) {
        if (hasAtLeastThreeDimensions(polygonPoints)) {
            // Multiple polygons
            this.locs = polygonPoints;
        } else if (hasAtLeastTwoDimensions(polygonPoints)) {
            // Single polygon with holes or multiple polygons without holes
            this.locs = polygonPoints;

        } else {
            // Single polygon without holes
            this.locs = [polygonPoints];
        }
    }

    public getBounds(){
        if (hasAtLeastThreeDimensions(this.locs)) {
            // Multiple polygons
            let coords = this.locs.flatMap(a => a).flatMap(a => a);
            return latLngBounds(coords);
        } else if (hasAtLeastTwoDimensions(this.locs)) {
            // Single polygon with holes
            let coords = this.locs.flatMap(a => a);
            return latLngBounds(coords);
        } else {
            // Single polygon without holes
            return latLngBounds(this.locs);
        }
    }

    static create(polygonPoints: LatLng[] | LatLng[][] | LatLng[][][]) {
        const a = new MapArea(uuid(), "", undefined, []);
        a.setPolygonLocs(polygonPoints);
        return a;
    }
    
    static fromFeature(feature: GeoJSON.Feature<GeoJSON.Polygon>) {
        var loc = new MapArea(
            feature.id,
            feature.properties.name,
            feature.properties.color,
            // TODO: allow more polygons with holes and multiple areas
            feature.geometry.coordinates.map(a => a.map(l => new LatLng(l[1], l[0]))),
        );
        loc.custom = feature.properties.custom;
        return loc;
    }

    toFeature(): GeoJSON.Feature<GeoJSON.Polygon> {
        return {
            type: "Feature",
            id: this.id,
            geometry: {
                type: "Polygon",
                coordinates: this.locs.map(a => a.map(l => [l.lng, l.lat]))
            },
            properties: {
                name: this.name,
                color: this.color,
                custom: this.custom,
            },
        };
    }
}
