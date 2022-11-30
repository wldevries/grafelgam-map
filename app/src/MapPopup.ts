import type { SvelteComponent } from "svelte";
import { DomUtil, Layer, PopupOptions, Marker, Polygon } from "leaflet";
import LocationViewPopup from "./LocationViewPopup.svelte";
import LocationEditPopup from "./LocationEditPopup.svelte";
import AreaViewPopup from "./AreaViewPopup.svelte";
import AreaEditPopup from "./AreaEditPopup.svelte";
import type { MapLocation } from "./MapLocation";
import type { MapArea } from "./MapArea";
    
// Create a popup with a Svelte component inside it and handle removal when the popup is torn down.
// `createFn` will be called whenever the popup is being created, and should create and return the component.
export function bindPopup(marker: Layer, createFn: { (container: HTMLDivElement): SvelteComponent; }, options?: PopupOptions) {
    let popupComponent: SvelteComponent;

    marker.bindPopup(() => {
        let container = DomUtil.create('div');
        popupComponent = createFn(container);
        return container;
    }, options);

    marker.on('popupclose', () => {
        if (popupComponent) {
            let old = popupComponent;
            popupComponent = null;
            // Wait to destroy until after the fadeout completes.
            setTimeout(() => {
                old.$destroy();
            }, 500);
        }
    });
}

export function bindLocationPopup(marker: Marker, location: MapLocation) {
    if (location.isCustom()) {
        bindLocationEditPopup(marker, location);
    }
    else {
        bindLocationViewPopup(marker, location);
    }
}

export function bindLocationEditPopup(marker: Marker, location: MapLocation) {
    bindPopup(marker, (m) =>
        new LocationEditPopup({
            target: m,
            props: {
                location,
                marker,
                bindViewPopup: bindLocationViewPopup,
            },
        }),
        {
            minWidth: 500
        });
}

export function bindLocationViewPopup(marker: Marker, location: MapLocation) {
    bindPopup(marker, (m) =>
        new LocationViewPopup({
            target: m,
            props: {
                location,
                marker,
                bindEditPopup: bindLocationEditPopup,
            },
        }));
}

export function bindAreaPopup(polygon: Polygon, area: MapArea) {
    if (area.isCustom()) {
        if (area.name && area.name.trim() != "") {
            bindAreaViewPopup(polygon, area);
        }
        else {
            bindAreaEditPopup(polygon, area);
        }
    }
}

export function bindAreaEditPopup(polygon: Polygon, area: MapArea) {
    bindPopup(polygon, (m) =>
        new AreaEditPopup({
            target: m,
            props: {
                area,
                polygon,
                bindViewPopup: bindAreaViewPopup,
            },
        }));
}

export function bindAreaViewPopup(polygon: Polygon, area: MapArea) {
    bindPopup(polygon, (m) =>
        new AreaViewPopup({
            target: m,
            props: {
                area,
                polygon,
                bindEditPopup: bindAreaEditPopup,
            },
        }));
}
