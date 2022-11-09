<div id="map" />

<LocationAutoComplete
    bind:this={locAutoComplete}
    on:select={handleLocSelected} />

<div class="toolbar">
    <div class="button-container">
        <button class="btn-tool"
                title="add location"
                bind:this={addLocationButton}
                on:click={selectLocationMode}>
            <Geo width="20" height="20" class="icon" />
        </button>
    </div>
    <div class="button-container">
        <button class="btn-tool"
                title="Add region" 
                bind:this={addRegionButton}
                on:click={selectRegionMode}>
            <Map width="20" height="20" class="icon" />
        </button>
    </div>
</div>

<script lang="ts">
    import { onMount } from "svelte";
    import * as L from "leaflet";
    import '@geoman-io/leaflet-geoman-free';  
    import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';  
    import LocationPopup from "./LocationPopup.svelte";
    import LocationEditPopup from "./LocationEditPopup.svelte";
    import AreaEditPopup from "./AreaEditPopup.svelte";
    import LocationAutoComplete from "./LocationAutoComplete.svelte";
    import { addArea, addLocation, CustomMapLocation, onDelete } from "./LocationStore.js"
    import { MapArea } from "./AreaStore";
    import Geo from "svelte-bootstrap-icons/lib/Geo.svelte";
    import Map from "svelte-bootstrap-icons/lib/Map.svelte";

    let map: L.Map;
    let addRegionButton: HTMLButtonElement;
    let addLocationButton: HTMLButtonElement;
    let locAutoComplete: LocationAutoComplete;
    let locationLayer: L.FeatureGroup<any>;
    let geomanLayer: L.FeatureGroup<any>;

    // coordinates of region selected by the user
    let regionCoords: L.LatLng[] = [];
    let editRegion: L.Polygon;

    // Temporary marker mouse
    let mouseMarker: L.Marker;

    interface LocationMarker {
        location: MapLocation,
        marker: L.Marker,
    }

    interface AreaPolygon {
        area: MapArea,
        polygon: L.Polygon,
    }

    let openLocations: LocationMarker[];
    let openAreas: AreaPolygon[];

    enum EditMode{
        None,
        Single,
        Region,
    }

    let mode = EditMode.None;

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
            // mode = EditMode.Region;
            // addLocationButton.disabled = true;
            // addRegionButton.disabled = true;

            map.pm.enableDraw('Polygon');
        }
    }

    function resetEditMode(){
        mode = EditMode.None;
        addLocationButton.disabled = false;
        addRegionButton.disabled = false;
        map.off('mousemove', updateMouseMoveMarker);
        map.getContainer().style.cursor = '';
    }

    function handleLocSelected(e: CustomEvent) {
        const location = e.detail.location;
        showLocations(location == undefined ? [] : [location]);
    }

    export function showLocations(locations: MapLocation[]) {
        clearLocationLayer();

        if (locations.length == 1) {
            locAutoComplete.select(locations[0]);
        }        
        else {
            locAutoComplete.select(undefined);
        }

        if (locations.length > 0) {
            locations.forEach(l => {
                const marker = addLocationToMap(l);                

                if (locations.length == 1) {
                    marker.openPopup();
                }
            });
            
            map.fitBounds(L.latLngBounds(locations.map(l => l.loc)));
        }
    }    

    export function showAreas(areas: MapArea[]) {
        clearLocationLayer();

        if (areas.length > 0) {
            areas.forEach(a => {
                const polygon = addArea(a);

                if (areas.length == 1) {
                    polygon.openPopup();
                }
            })
        }
    }

    function addLocationToMap(location: MapLocation): L.Marker<any> {
        const marker = L.marker(location.loc)
            .addTo(locationLayer)
            .bindTooltip(popupText(location));

        openLocations.push({
            location: location,
            marker: marker,
        });

        if (location instanceof CustomMapLocation) {
            bindPopup(marker, (m) =>
                new LocationEditPopup({
                    target: m,
                    props: {
                        location,
                    },
                }));
        }
        else {
            bindPopup(marker, (m) =>
                new LocationPopup({
                    target: m,
                    props: {
                        location,
                    },
                }));                
        }
        return marker;
    }

    function addArea(area: MapArea): L.Polygon<any> {
        const polygon = new L.Polygon(area.locs);

        openAreas.push({
            area,
            polygon
        });

        clearLocationLayer();

        polygon.addTo(locationLayer);
        bindPopup(polygon, (m) =>
            new AreaEditPopup({
                target: m,
                props: {
                    area,
                },
            }));

        return polygon;
    }

    onMount(async () => {
        configureMap();

        // Debug out for location
        map.on("click", function (ev: L.LeafletMouseEvent) {
            if (mode == EditMode.None) {
                console.log(ev.latlng.lat + ", " + ev.latlng.lng);
            }
            else if (mode == EditMode.Single) {
                clearLocationLayer();

                mouseMarker.remove();
                mouseMarker = undefined;

                const loc = CustomMapLocation.create(ev.latlng);
                const marker = addLocationToMap(loc);
                marker.openPopup();
                
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

        onDelete(id => {
            const markerIndex = openLocations.findIndex(l => {
                if (l.location instanceof CustomMapLocation) {
                    return l.location.id == id;
                }
                return false;
            });
            if (markerIndex != -1) {
                openLocations[markerIndex].marker.remove();
                openLocations.slice(markerIndex, markerIndex + 1);
            }
        });

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
            
            // Make sure the location layer exists
            clearLocationLayer();

            // Configure Leaflet-Geoman
            
            // Let Geoman draw new markers on a very specific layer
            geomanLayer = L.featureGroup().addTo(map);
            map.pm.setGlobalOptions({
                layerGroup: geomanLayer
            });
            
            // Get a hold of new markers added by Geoman
            map.on('pm:create', (e) => {
                if (e.layer instanceof L.Polygon) {
                    e.layer.remove();
                    let locs = e.layer.getLatLngs();
                    // let's assume it's a single dimension array and if it's not we mess it up..
                    locs = locs.flat().flat();

                    // The following type check does not work unfortunately
                    // if (locs instanceof L.LatLng[])

                    const area = MapArea.create(locs);
                    const polygon = addArea(area);
                    polygon.openPopup();
                }
            });

            // Add Geoman toolbar
            map.pm.addControls({  
                position: 'topleft',
                drawRectangle: false,
                drawCircleMarker: false,
                drawCircle: false,
                drawText: false,
                dragMode: false,
                cutPolygon: false,
                rotateMode: false,
                removalMode: false,
            });
        }
    });

    function clearLocationLayer() {
        if (locationLayer != undefined) {
            map.removeLayer(locationLayer);
        }
        openLocations= [];
        openAreas = [];
        locationLayer = new L.FeatureGroup().addTo(map);
        locationLayer.pm.enable({
            allowSelfIntersection: false,
        });

        // Save changes when a marker is moved
        locationLayer.on('pm:edit', (e) => {
            if (e.layer instanceof L.Marker) {
                let mloc = openLocations.find(l => l.marker == e.layer);
                if (mloc.location instanceof CustomMapLocation) {
                    mloc.location.loc = e.layer.getLatLng();
                    addLocation(mloc.location);
                }
            }
        });
    }

    // Create a popup with a Svelte component inside it and handle removal when the popup is torn down.
    // `createFn` will be called whenever the popup is being created, and should create and return the component.
    function bindPopup(marker, createFn) {
        let popupComponent;
        let popup: L.Popup;
        marker.bindPopup(() => {
            let container = L.DomUtil.create('div');
            popupComponent = createFn(container);
            if (popup instanceof L.Popup) {
                popupComponent.setPopup(popup);
            }
            return container;
        });

        marker.on('popupopen', c => {
            popup = c.popup;
            if (popupComponent.setPopup != undefined) {
                popupComponent.setPopup(popup);
            }
        });

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

    .toolbar {
        position: fixed;
        top: 200px;
        left: 80px;
        display: flex;
        flex: auto;
        flex-direction: column;
        gap: 0;
        border-radius: 4px;
        border-width: 1px;
        border-color: rgba(0, 0, 0, 0.2);
        border-style: solid;
    }

    .btn-tool {
        margin: 0px;
        padding: 0px !important;
        width: 30px;
        height: 30px;
        align-items: center;
        justify-content: center;
        display: flex;
    }

    .btn-tool:enabled {
        cursor: pointer;
    }
</style>
