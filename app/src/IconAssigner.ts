import { icon, Marker } from "leaflet";
import { IconStore } from "./Services/IconStore";
import type { MapLocation } from "./MapLocation";

export async function setLocationIcon(marker: Marker, location: MapLocation) {
    const iconUri = location.name == "Lensbrug"
    ? "icons/tower-bridge.png"
    : (await IconStore.nameToIcon(location.icon))?.uri;
    if (iconUri && iconUri != "") {
        marker.setIcon(icon({
            iconUrl: iconUri,
            iconSize: [32, 32],
            // iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
            // popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
        }));
    }
};