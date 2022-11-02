/// <reference types="svelte" />

interface Location {
    name: string;
    region: string;
    country: string;
    loc: L.LatLng;
}

interface CustomLocation extends Location{
    id: string;
}

interface Rune {
    name: string;
    translation: string;
    translations: string[];
}
