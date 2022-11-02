/// <reference types="svelte" />

interface MapLocation {
    name: string;
    region: string;
    country: string;
    loc: L.LatLng;
}

interface CustomMapLocation extends MapLocation {
    id: string;
}

interface Rune {
    name: string;
    translation: string;
    translations: string[];
}
