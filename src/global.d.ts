/// <reference types="svelte" />

interface Location {
    name: string;
    country: string;
    loc: L.LatLng;
}

interface Rune {
    name: string;
    translation: string;
    translations: string[];
}
