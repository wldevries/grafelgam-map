/// <reference types="svelte" />

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
