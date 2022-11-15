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
            <GeoIcon width="20" height="20" class="icon" />
        </button>
    </div>
    <div class="button-container">
        <button class="btn-tool"
                title="Add region" 
                bind:this={addRegionButton}
                on:click={selectRegionMode}>
            <MapIcon width="20" height="20" class="icon" />
        </button>
    </div>
</div>

<script lang="ts">
    import { onMount, SvelteComponent } from "svelte";
    import '@geoman-io/leaflet-geoman-free';  
    import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';  
    import LocationPopup from "./LocationPopup.svelte";
    import LocationEditPopup from "./LocationEditPopup.svelte";
    import AreaEditPopup from "./AreaEditPopup.svelte";
    import LocationAutoComplete from "./LocationAutoComplete.svelte";
    import { MapLocation } from "./MapLocation";
    import { MapArea } from "./MapArea";
    import { addLocation, LocationStore } from "./LocationStore.js"
    import { addArea, AreaStore } from "./AreaStore";
    import GeoIcon from "svelte-bootstrap-icons/lib/Geo.svelte";
    import MapIcon from "svelte-bootstrap-icons/lib/Map.svelte";
    import { Map, Marker, Polygon, LatLngBounds, latLngBounds, Layer, icon } from "leaflet";
    import { DomUtil, Popup, tileLayer, geoJSON, FeatureGroup, LeafletMouseEvent } from "leaflet";
    import { BoxArrowInDownLeft } from "svelte-bootstrap-icons";
    import { loadIcon, loadIcons, MapIcon as MapIconT } from "./IconStore";

    const locationStore = LocationStore.instance;
    const areaStore = AreaStore.instance;

    let mapDiv: Map;
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

    export function showMap(locations: MapLocation[], areas: MapArea[]){
        clearLocations();
        if (locations != undefined) {
            showLocations(locations, areas == undefined || areas.length == 0);
        }
        if (areas != undefined) {
            showAreas(areas);
        }
    }

    function selectLocationMode() {
        if (mode == EditMode.None){
            mode = EditMode.Single;
            addLocationButton.disabled = true;
            addRegionButton.disabled = true;

            // disable mouse temporarily
            mapDiv.getContainer().style.cursor = 'none';
            mapDiv.on('mousemove', updateMouseMoveMarker);
        }
    }

    function updateMouseMoveMarker(ev: L.LeafletMouseEvent) {
        if (mouseMarker == null) {
            mouseMarker = new Marker(ev.latlng).addTo(mapDiv);
        } else {
            mouseMarker.setLatLng(ev.latlng);
        }
    }
    
    function selectRegionMode() {
        if (mode == EditMode.None){
            // mode = EditMode.Region;
            // addLocationButton.disabled = true;
            // addRegionButton.disabled = true;

            mapDiv.pm.enableDraw('Polygon');
        }
    }

    function displayGeo(geol, geoa) {        
        geoJSON(geol, {
            onEachFeature: onEachFeature
        }).addTo(mapDiv);
        
        geoJSON(geoa, {
            onEachFeature: onEachFeature,
            style: function(feature) {
                if (feature.properties.color) {
                    return {color: feature.properties.color };
                }
            }
        }).addTo(mapDiv);

        function onEachFeature(feature: GeoJSON.Feature, layer: L.Layer) {
            if (feature.properties && feature.properties.name) {
                layer.bindTooltip(feature.properties.name);
            }
        }
    }
    
    function resetEditMode(){
        mode = EditMode.None;
        addLocationButton.disabled = false;
        addRegionButton.disabled = false;
        mapDiv.off('mousemove', updateMouseMoveMarker);
        mapDiv.getContainer().style.cursor = '';
    }

    function handleLocSelected(e: CustomEvent) {
        const location = e.detail.location;
        showLocations(location == undefined ? [] : [location], true);
    }

    function showLocations(locations: MapLocation[], fitBounds: boolean) {
        if (locations.length == 1) {
            locAutoComplete.select(locations[0]);
        }        
        else {
            locAutoComplete.select(undefined);
        }

        if (locations.length > 0) {
            locations.forEach(l => {
                const marker = addLocationToMap(l);                

                if (locations.length == 1 && !fitBounds) {
                    marker.openPopup();
                }
            });
            
            if (fitBounds) {
                mapDiv.fitBounds(latLngBounds(locations.map(l => l.loc)));
            }
        }
    }    

    function showAreas(areas: MapArea[]) {
        if (areas.length > 0) {                        

            areas.forEach(a => {
                const polygon = addAreaToMap(a, a.color);

                if (areas.length == 1) {
                    polygon.openPopup();
                }
            });

            let allBounds = areas.map(a => a.getBounds());
            let bounds: LatLngBounds;
            allBounds.forEach(a => {
                bounds = bounds == undefined ? a : a.extend(bounds);
            })
            mapDiv.fitBounds(bounds);
        }
    }

    function addLocationToMap(location: MapLocation): Marker {
        const marker = new Marker(location.loc);

        function setLocationIcon() {
            const iconUri = location.name == "Lensbrug"
            ? "icons/tower-bridge.png"
            : loadIcon(location.icon)?.uri;
            if (iconUri != undefined) {
                marker.setIcon(icon({
                    iconUrl: iconUri,
                    iconSize: [32, 32],
                    // iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
                    // popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
                }));
            }
        };
        setLocationIcon();        

        openLocations.push({
            location: location,
            marker: marker,
        });

        if (location.isCustom()) {
            bindPopup(marker, (m) =>
                new LocationEditPopup({
                    target: m,
                    props: {
                        location,
                        updateIcon: setLocationIcon,
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

        // Only have tooltip available when popup is not open        
        function bindTooltip() { 
            const content = location.popupText();
            if (content != undefined && content != "") {            
                marker.bindTooltip(content,{
                    // permanent: true,
                    direction: 'top',
                    className: "transparent-tooltip",
                    offset: [0, -16]
                });
            }
        };
        bindTooltip();
        marker.on("popupclose", () => {
            bindTooltip();
        })
        marker.on("popupopen", () => {
            marker.unbindTooltip();
        })

        // Save maker location when moved via Geoman
        marker.on("pm:edit", () => {
            location.loc = marker.getLatLng();
            addLocation(location);
        });

        marker.addTo(locationLayer)
        return marker;
    }

    function addAreaToMap(area: MapArea, color: string | undefined): Polygon<any> {
        const polygon = new Polygon(area.locs, {
            color: color ?? "blue"
        })

        openAreas.push({
            area,
            polygon
        });
        
        if (area.isCustom()) {
            bindPopup(polygon, (m) =>
                new AreaEditPopup({
                    target: m,
                    props: {
                        area,
                        polygon
                    },
                }));
        }

        // Only have tooltip available when popup is not open
        function bindTooltip() {
            const content = area.name;
            if (content != undefined && content != "") {            
                polygon.bindTooltip(content);
            }
        }
        bindTooltip();
        polygon.on("popupclose", () => {
            bindTooltip();
        })
        polygon.on("popupopen", () => {
            polygon.unbindTooltip();
        })

        polygon.on("pm:edit", e => {
            area.setPolygonLocs(polygon.getLatLngs());
            addArea(area);
        });

        polygon.addTo(locationLayer);

        return polygon;
    }

    onMount(async () => {
        configureMap();

        // Debug out for location
        mapDiv.on("click", function (ev: LeafletMouseEvent) {
            if (mode == EditMode.None) {
                console.log(ev.latlng.lat + ", " + ev.latlng.lng);
            }
            else if (mode == EditMode.Single) {
                clearLocations();

                mouseMarker.remove();
                mouseMarker = undefined;

                const loc = MapLocation.create(ev.latlng);
                loc.setCustom();
                const marker = addLocationToMap(loc);
                marker.openPopup();
                
                resetEditMode();
            }
            else if (mode == EditMode.Region) {                
                regionCoords.push(ev.latlng);
                if (editRegion != null) {
                    mapDiv.removeLayer(editRegion);
                }
                editRegion = new Polygon(regionCoords);
                editRegion.addTo(mapDiv);
            }
        });


        locationStore.Deleted.on(id => {
            const markerIndex = openLocations.findIndex(l => {
                if (l.location.isCustom()) {
                    return l.location.id == id;
                }
                return false;
            });
            if (markerIndex != -1) {
                openLocations[markerIndex].marker.remove();
                openLocations.slice(markerIndex, markerIndex + 1);
            }
        });

        locationStore.Changed.on(async id => {
            const markerIndex = openLocations.findIndex(l => {
                if (l.location.isCustom()) {
                    return l.location.id == id;
                }
                return false;
            });
            if (markerIndex != -1) {
                const openLocation = openLocations[markerIndex];
                const marker = openLocation.marker;
                const allLocations = await locationStore.Load();
                const updatedLocation = allLocations.find(l => l.id == id);
                openLocation.location = updatedLocation;

                // Update marker
                marker.setTooltipContent(updatedLocation.popupText());
            }
        })

        areaStore.Deleted.on(id => {
            const markerIndex = openAreas.findIndex(l => {
                if (l.area.isCustom()) {
                    return l.area.id == id;
                }
                return false;
            });
            if (markerIndex != -1) {
                openAreas[markerIndex].polygon.remove();
                openAreas.slice(markerIndex, markerIndex + 1);
            }
        })

        areaStore.Changed.on(async id => {
            const markerIndex = openAreas.findIndex(l => {
                if (l.area.isCustom()) {
                    return l.area.id == id;
                }
                return false;
            });
            if (markerIndex != -1) {
                const openArea = openAreas[markerIndex];
                const polygon = openArea.polygon;
                const allAreas = await areaStore.Load();
                const updatedArea = allAreas.find(l => l.id == id);
                openArea.area = updatedArea;

                // Update polygon
                polygon.setStyle({
                    color: updatedArea.color ?? "blue"
                });
                polygon.setTooltipContent(updatedArea.name);
            }
        })

        function configureMap() {
            var moptions: L.MapOptions={
                zoomSnap: 0.1,
                zoomDelta: 0.5,
            };
            mapDiv = new Map("map", moptions);

            var options: L.TileLayerOptions={
                minZoom: 1,
                maxZoom: 6,
                maxNativeZoom: 5,
                noWrap: true,
            };
            tileLayer("tiles/{z}/{x}/{y}.png",options).addTo(mapDiv);

            mapDiv.setView([0,0],3);
            
            // Make sure the location layer exists
            clearLocations();

            // Configure Leaflet-Geoman
            
            // Let Geoman draw new markers on a very specific layer
            geomanLayer = new FeatureGroup().addTo(mapDiv);
            mapDiv.pm.setGlobalOptions({
                layerGroup: geomanLayer
            });
            
            // Get a hold of new markers added by Geoman
            mapDiv.on('pm:create', (e) => {
                if (e.layer instanceof Polygon) {
                    e.layer.remove();
                    let locs = e.layer.getLatLngs();
                    // let's assume it's a single dimension array and if it's not we mess it up..
                    locs = locs.flat().flat();

                    // The following type check does not work unfortunately
                    // if (locs instanceof L.LatLng[])

                    clearLocations();

                    const area = MapArea.create(locs);
                    area.setCustom();
                    const polygon = addAreaToMap(area, "blue");
                    polygon.openPopup();
                }
            });

            // Add Geoman toolbar
            // map.pm.addControls({  
            //     position: 'topleft',
            //     drawRectangle: false,
            //     drawCircleMarker: false,
            //     drawCircle: false,
            //     drawText: false,
            //     dragMode: false,
            //     cutPolygon: false,
            //     rotateMode: false,
            //     removalMode: false,
            // });
        }
    });

    // Clear all markers and polygons from the location layer
    function clearLocations() {
        if (locationLayer != undefined) {
            mapDiv.removeLayer(locationLayer);
        }
        openLocations= [];
        openAreas = [];
        locationLayer = new FeatureGroup().addTo(mapDiv);
        locationLayer.pm.enable({
            allowSelfIntersection: false,
        });

        // Save changes when a marker is moved
        locationLayer.on('pm:edit', (e) => {
            if (e.layer instanceof Marker) {
                let mloc = openLocations.find(l => l.marker == e.layer);
                if (mloc.location.isCustom()) {
                    mloc.location.loc = e.layer.getLatLng();
                    addLocation(mloc.location);
                }
            }
        });
    }

    // Create a popup with a Svelte component inside it and handle removal when the popup is torn down.
    // `createFn` will be called whenever the popup is being created, and should create and return the component.
    function bindPopup(marker: Layer, createFn: { (container: HTMLDivElement): SvelteComponent; }) {
        let popupComponent: SvelteComponent;
        let popup: Popup;
        marker.bindPopup(() => {
            let container = DomUtil.create('div');
            popupComponent = createFn(container);
            if (popup instanceof Popup && popupComponent.setPopup != undefined) {
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
        top: 150px;
        left: 10px;
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
        width: 32px;
        height: 32px;
        align-items: center;
        justify-content: center;
        display: flex;
    }

    .btn-tool:enabled {
        cursor: pointer;
    }
</style>
