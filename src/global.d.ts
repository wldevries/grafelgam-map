/// <reference types="svelte" />

interface MapLocation {
    name: string;
    region: string;
    country: string;
    loc: L.LatLng;
}

interface MapArea {
    id: string;
    name: string;
    locs: L.LatLng[];    
}

interface Rune {
    name: string;
    translation: string;
    translations: string[];
}
