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

<div class="toolbar">
    <button class="btn-tool"
            bind:this={addRegionButton}
            on:click={selectRegionMode}>
        add region
    </button>
    <button class="btn-tool"
            bind:this={addLocationButton}
            on:click={selectLocationMode}>
        add location
    </button>
</div>

<script lang="ts">
    import { onMount } from "svelte";
    import AutoComplete from "simple-svelte-autocomplete";
    import * as L from "leaflet";
    import '@geoman-io/leaflet-geoman-free';  
    import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';  
    import LocationPopup from "./LocationPopup.svelte";
    import LocationEditPopup from "./LocationEditPopup.svelte";
    import { loadLocations, CustomMapLocation } from "./LocationStore.js"

    let map: L.Map;
    let addRegionButton: HTMLButtonElement;
    let addLocationButton: HTMLButtonElement;
    let locationLayer: L.FeatureGroup<any>;

    let multipleSelected: boolean;
    let selectedLocation: MapLocation;
    let allLocations: MapLocation[] = [];

    // coordinates of region selected by the user
    let regionCoords: L.LatLng[] = [];
    let editRegion: L.Polygon;

    // Temporary marker mouse
    let mouseMarker: L.Marker;

    enum EditMode{
        None,
        Single,
        Region,
    }

    let mode = EditMode.None;

    function showLocation(location: MapLocation) {
        if (location != undefined) {
            showLocations([location]);
        }
        else if (!multipleSelected && map != undefined) {
            map.removeLayer(locationLayer);
            locationLayer = undefined;
        }
    }

    function popupText(location: MapLocation) : string {
        if (location.region == undefined) {
            return `<h3>${location.name}</h3><p>${location.country}</p>`;
        }
        return `<h3>${location.name}</h3><p>${location.country}  (${location.region})</p>`;
    }

    function selectLocationMode() {
        if (mode == EditMode.None){
            mode = EditMode.Single;
            addLocationButton.disabled = true;
            addRegionButton.disabled = true;

            // disable mouse temporarily
            map.getContainer().style.cursor = 'none';
            map.on('mousemove', updateMouseMoveMarker);
        }
    }

    function updateMouseMoveMarker(ev: L.LeafletMouseEvent) {
        if (mouseMarker == null) {
            mouseMarker = new L.Marker(ev.latlng).addTo(map);
        } else {
            mouseMarker.setLatLng(ev.latlng);
        }
    }
    
    function selectRegionMode() {
        if (mode == EditMode.None){
            mode = EditMode.Region;
            addLocationButton.disabled = true;
            addRegionButton.disabled = true;
        }
    }

    function resetEditMode(){
        mode = EditMode.None;
        addLocationButton.disabled = false;
        addRegionButton.disabled = false;
        map.off('mousemove', updateMouseMoveMarker);
        map.getContainer().style.cursor = '';
    }

    export function showLocations(locations: MapLocation[]) {
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

        if (locations.length > 0) {
            locationLayer = new L.FeatureGroup().addTo(map);

            locations.forEach(l => {
                const marker = L.marker(l.loc)
                    .addTo(locationLayer)
                    .bindTooltip(popupText(l));
                
                if (l instanceof CustomMapLocation) {
                    bindPopup(marker, (m) => {
                        let c = new LocationEditPopup({
                            target: m,
                            props: {
                                location: l,
                            },
                        });
                    });
                }
                else {
                    bindPopup(marker, (m) => {
                        let c = new LocationPopup({
                            target: m,
                            props: {
                                location: l,
                            },
                        });
                    });                
                }
                
                if (locations.length == 1) {
                    marker.openPopup();
                }
            });
            
            map.fitBounds(L.latLngBounds(locations.map(l => l.loc)));
        }
    }

    onMount(async () => {
        configureMap();

        // Debug out for location
        map.on("click", function (ev: L.LeafletMouseEvent) {
            if (mode == EditMode.None) {
                console.log(ev.latlng.lat + ", " + ev.latlng.lng);
            }
            else if (mode == EditMode.Single) {
                mouseMarker.remove();
                mouseMarker = undefined;

                let marker = L.marker(ev.latlng);
                let loc = CustomMapLocation.create(ev.latlng);
                
                addEditPopup(marker, loc);
                marker
                    .addTo(map)
                    .openPopup();
                resetEditMode();
            }
            else if (mode == EditMode.Region) {                
                regionCoords.push(ev.latlng);
                if (editRegion != null) {
                    map.removeLayer(editRegion);
                }
                editRegion = L.polygon(regionCoords);
                editRegion.addTo(map);
            }
        });

        allLocations = await loadLocations();
        allLocations.sort((a, b) => a.name.localeCompare(b.name));

        function configureMap() {
            var moptions: L.MapOptions={
                zoomSnap: 0.5,
                zoomDelta: 0.5,
            };
            map=L.map("map",moptions);

            var options: L.TileLayerOptions={
                minZoom: 1,
                maxZoom: 5,
                noWrap: true,
            };
            L.tileLayer("tiles/{z}/{x}/{y}.png",options).addTo(map);

            map.setView([0,0],3);
            
            // Configure Geoman
            map.pm.addControls({  
                position: 'topleft',
                drawCircle: false,
                drawText: false,
                rotateMode: false,
            });        
        }

    });

    function addEditPopup(marker: L.Marker, location: CustomMapLocation) {
        bindPopup(marker, (m) => {
            let c = new LocationEditPopup({
                target: m,
                props: {
                    location,
                },
            });
        });
    }

    // Create a popup with a Svelte component inside it and handle removal when the popup is torn down.
    // `createFn` will be called whenever the popup is being created, and should create and return the component.
    function bindPopup(marker: L.Marker, createFn) {
        let popupComponent;
        marker.bindPopup(() => {
            let container = L.DomUtil.create('div');
            popupComponent = createFn(container);
            return container;
        });

        marker.on('popupclose', () => {
            if(popupComponent) {
                let old = popupComponent;
                popupComponent = null;
                // Wait to destroy until after the fadeout completes.
                setTimeout(() => {
                    old.$destroy();
                }, 500);
            }
        });
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

    .toolbar {
        position: fixed;
        top: 200px;
        left: 80px;
    }
    .btn-tool {
        border-radius: 4px;
        border-width: 2px;
        /* width: 100p; */
    }
</style>
