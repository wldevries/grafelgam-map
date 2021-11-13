<div id="map" />

<div class="search">
    <AutoComplete
        placeholder="search…"
        items={allLocations}
        bind:selectedItem={selectedLocation}        
        labelFieldName="name"
        onChange="{showLocation}"
        showClear="true" />
</div>

<script lang="ts">
    import { onMount } from "svelte";
    import AutoComplete from "simple-svelte-autocomplete";
    import * as L from "leaflet";

    let map: L.Map;
    let locationLayer: L.FeatureGroup<any>;

    let multipleSelected: boolean;
    let selectedLocation;
    let allLocations: Location[] = [];

    function showLocation(location: Location) {
        if (location != undefined) {
            showLocations([location]);
        }
        else if (!multipleSelected && map != undefined) {
            map.removeLayer(locationLayer);
            locationLayer = undefined;
        }
    }

    export function showLocations(locations: Location[]) {
        if (locationLayer != undefined) {
            map.removeLayer(locationLayer);
        }

        if (locations.length == 1) {
            selectedLocation = locations[0];
        }
        else if (locations.length > 1) {
            multipleSelected = true;
            selectedLocation = undefined;
        }
        else {
            selectedLocation = undefined;
        }

        locationLayer = new L.FeatureGroup();

        if (locations.length > 0) {
            locations.forEach((location) => {
                var marker = L.marker(location.loc)
                    .bindPopup(location.name)
                    .openPopup();
                locationLayer.addLayer(marker);
            });

            map.addLayer(locationLayer);
            map.fitBounds(L.latLngBounds(locations.map((l) => l.loc)));
        }
    }

    onMount(async () => {
        var moptions: L.MapOptions = {
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

        await loadLocations();
    });

    async function loadLocations() {
        allLocations = await fetch("locations.json").then((response) =>
            response.json()
        );

        allLocations.sort((a, b) => a.name.localeCompare(b.name));
    }
</script>

<style>
    #map {
        position: fixed;
        background: #222;
        z-index: 0;
        top: 65px;
        left: 0px;
        right: 0px;
        bottom: 0px;
    }

    /* More styling is on autocomplete class in global styles */
    .search {
        width: 250px;
        position: fixed;
        top: 76px;
        left: 80px;
    }
</style>
