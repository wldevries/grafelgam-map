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
    import { onMount } from "svelte";
    import '@geoman-io/leaflet-geoman-free';  
    import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';  
    import LocationAutoComplete from "./LocationAutoComplete.svelte";
    import { MapLocation } from "./MapLocation";
    import { MapArea } from "./MapArea";
    import { featureIsArea, featureIsPlace } from "./GeoJSONHelper"
    import GeoIcon from "svelte-bootstrap-icons/lib/Geo.svelte";
    import MapIcon from "svelte-bootstrap-icons/lib/Map.svelte";
    import { Map, Marker, Polygon, LatLngBounds, latLngBounds, Layer, LatLng, MapOptions, TileLayerOptions } from "leaflet";
    import { tileLayer, geoJSON, FeatureGroup, LeafletMouseEvent } from "leaflet";
    import { bindAreaPopup, bindLocationPopup } from "./MapPopup";
    import { setLocationIcon } from "./IconAssigner";
    import { featureStore } from "./Services/FeatureStore";

    let mapDiv: Map;
    let addRegionButton: HTMLButtonElement;
    let addLocationButton: HTMLButtonElement;
    let locAutoComplete: LocationAutoComplete;
    let locationLayer: FeatureGroup<any>;
    let geomanLayer: FeatureGroup<any>;

    // coordinates of region selected by the user
    let regionCoords: LatLng[] = [];
    let editRegion: Polygon;

    // Temporary marker mouse
    let mouseMarker: Marker | undefined;

    interface LocationMarker {
        location: MapLocation,
        marker: Marker,
    }

    interface AreaPolygon {
        area: MapArea,
        polygon: Polygon,
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
        if (locations) {
            showLocations(locations, areas == undefined || areas.length == 0);
        }
        if (areas) {
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

    function updateMouseMoveMarker(ev: LeafletMouseEvent) {
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

    function displayGeo(geol: GeoJSON.Feature<GeoJSON.Point>[], geoa: GeoJSON.Feature<GeoJSON.Polygon>[]) {        
        geoJSON(geol, {
            onEachFeature: onEachFeature
        }).addTo(mapDiv);
        
        geoJSON(geoa, {
            onEachFeature: onEachFeature,
            style: (feature) => {
                if (feature && feature.properties && feature.properties.color) {
                    return { color: feature.properties.color };
                }
                return { };
            }
        }).addTo(mapDiv);

        function onEachFeature(feature: GeoJSON.Feature, layer: Layer) {
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
        if (locAutoComplete.select) {
            if (locations.length == 1) {
                locAutoComplete.select(locations[0]);
            }        
            else {
                locAutoComplete.select(undefined);
            }
        }

        if (locations.length > 0) {
            locations.forEach(async l => {
                const marker = await addLocationToMap(l);                

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
            let bounds: LatLngBounds | undefined;
            allBounds.forEach(a => {
                bounds = bounds == undefined ? a : a.extend(bounds);
            })
            if (bounds) {
                mapDiv.fitBounds(bounds);
            }
        }
    }

    async function addLocationToMap(location: MapLocation): Promise<Marker<any>> {
        const marker = new Marker(location.loc);

        await setLocationIcon(marker, location);

        openLocations.push({
            location: location,
            marker: marker,
        });

        bindLocationPopup(marker, location);

        // Only have tooltip available when popup is not open        
        function bindTooltip() { 
            const content = location.popupText();
            if (content && content != "") {            
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
            featureStore.update(location);
        });

        marker.addTo(locationLayer)
        return marker;
    }

    function addAreaToMap(area: MapArea, color?: string): Polygon<any> {
        const polygon = new Polygon(area.locs, {
            color: color ?? "blue"
        })

        openAreas.push({
            area,
            polygon
        });

        bindAreaPopup(polygon, area);

        // Only have tooltip available when popup is not open
        function bindTooltip() {
            const content = area.name;
            if (content && content != "") {            
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
            featureStore.update(area);
        });

        polygon.addTo(locationLayer);

        return polygon;
    }

    onMount(async () => {
        configureMap();

        // Debug out for location
        mapDiv.on("click", async function (ev: LeafletMouseEvent) {
            if (mode == EditMode.Single) {
                clearLocations();

                if (mouseMarker) {
                    mouseMarker.remove();
                }
                mouseMarker = undefined;

                const loc = MapLocation.create(ev.latlng);
                loc.setCustom();
                const marker = await addLocationToMap(loc);
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


        featureStore.Deleted.on(id => {
            const placeIndex = openLocations.findIndex(l => {
                if (l.location.isCustom()) {
                    return l.location.id == id;
                }
                return false;
            });
            if (placeIndex != -1) {
                openLocations[placeIndex].marker.remove();
                openLocations.slice(placeIndex, placeIndex + 1);
            }
            
            const areaIndex = openAreas.findIndex(l => {
                if (l.area.isCustom()) {
                    return l.area.id == id;
                }
                return false;
            });
            if (areaIndex != -1) {
                openAreas[areaIndex].polygon.remove();
                openAreas.slice(areaIndex, areaIndex + 1);
            }
        });

        featureStore.Changed.on(async id => {
            const placeIndex = openLocations.findIndex(l => {
                if (l.location.isCustom()) {
                    return l.location.id == id;
                }
                return false;
            });
            if (placeIndex != -1) {
                const openLocation = openLocations[placeIndex];
                const marker = openLocation.marker;
                const allLocations = (await featureStore.load()).filter(featureIsPlace);
                const feature = allLocations.find(l => l.id == id);
                if (feature) {
                    const updatedLocation = MapLocation.fromFeature(feature);
                    openLocation.location = updatedLocation;

                    // Update marker
                    marker.setTooltipContent(updatedLocation.popupText());
                }
            }
            
            const areaIndex = openAreas.findIndex(l => {
                if (l.area.isCustom()) {
                    return l.area.id == id;
                }
                return false;
            });
            if (areaIndex != -1) {
                const openArea = openAreas[areaIndex];
                const polygon = openArea.polygon;
                const allAreas = (await featureStore.load()).filter(featureIsArea);
                const feature = allAreas.find(l => l.id == id);
                if (feature){
                    const updatedArea = MapArea.fromFeature(feature);
                    openArea.area = updatedArea;

                    // Update polygon
                    polygon.setStyle({
                        color: updatedArea.color ?? "blue"
                    });
                    polygon.setTooltipContent(updatedArea.name);
                }
            }
        })

        function configureMap() {
            var moptions: MapOptions={
                zoomSnap: 0.1,
                zoomDelta: 0.5,
            };
            mapDiv = new Map("map", moptions);

            var options: TileLayerOptions={
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
                    // if (locs instanceof LatLng[])

                    clearLocations();

                    const area = MapArea.create(locs);
                    area.setCustom();
                    const polygon = addAreaToMap(area);
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
        if (locationLayer) {
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
                if (mloc && mloc.location.isCustom()) {
                    mloc.location.loc = e.layer.getLatLng();
                    featureStore.update(mloc.location);
                }
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
