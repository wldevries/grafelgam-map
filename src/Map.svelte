<div id="map" />

<script lang="ts" context="module">
    export interface Location {
        name: string;
        country: string;
        loc: L.LatLng;
    }    
</script>

<script lang="ts">
    import { onMount } from "svelte";

    import * as L from "leaflet";

    let map: L.Map;
    let locationLayer: L.FeatureGroup<any>;

    export function showmap(show_locs: Location[]) {
        if (locationLayer != undefined) {
            map.removeLayer(locationLayer);
        }

        locationLayer = new L.FeatureGroup();

        if (show_locs.length > 0) {
            show_locs.forEach((location) => {
                var marker = L.marker(location.loc)
                    .bindPopup(location.name)
                    .openPopup();
                locationLayer.addLayer(marker);
            });

            map.addLayer(locationLayer);
            // map.setView(location.loc, 5);
            map.fitBounds(L.latLngBounds(show_locs.map((l) => l.loc)));
        }
    }

    onMount(() => {
        var moptions: L.MapOptions = {
            // Simple might be nice, but is different
            // from coordinates we already have defined
            // crs: L.CRS.Simple,
            // minZoom: 1,
            // maxZoom: 5,
            zoomSnap: 0.5,
            zoomDelta: 0.5,
        };
        map = L.map("map", moptions);

        var options: L.TileLayerOptions = {
            minZoom: 1,
            maxZoom: 5,
            noWrap: true,
        };
        L.tileLayer("tiles/{z}/{x}/{y}.png", options).addTo(map);

        map.setView([0, 0], 3);

        // Debug out for location
        map.on("click", function (ev: L.LeafletMouseEvent) {
            console.log(ev.latlng.lat + ", " + ev.latlng.lng);
        });
    });
</script>

<style>
    #map {
        position: fixed;
        background: #eee;
        z-index: 0;
        top: 65px;
        left: 0px;
        right: 0px;
        bottom: 0px;
    }
</style>
