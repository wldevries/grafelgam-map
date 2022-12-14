<script lang="ts">
    import { onMount } from "svelte";
    import { createEventDispatcher } from "svelte";
    import { MapLocation } from "./MapLocation";
    import { MapArea } from "./MapArea";
    import { loadAreasWeb, loadPlacesWeb } from "./Services/WebLoader";
    import { featureIsArea, featureIsPlace } from "./GeoJSONHelper";
    import { featureStore } from "./Services/Stores";

    const dispatch = createEventDispatcher();

    let allLocations: MapLocation[] = [];
    let countries: Set<string> = new Set();
    let countriesSorted: string[] = [];
    let allAreas: MapArea[] = [];
    let customAreas: MapArea[] = [];

    onMount(async () => {
        const places = await loadPlacesWeb();
        const areas = await loadAreasWeb();
        const features = await featureStore.load();
        const placeFeatures = features.filter(featureIsPlace);
        const areaFeatures = features.filter(featureIsArea);
        
        allLocations = places
            .concat(placeFeatures)
            .map(MapLocation.fromFeature);
        allLocations.sort((a, b) => a.name.localeCompare(b.name));

        countries.clear();
        allLocations.forEach((loc) => countries.add(loc.country));
        countriesSorted = Array.from(countries).sort((a, b) => a.localeCompare(b));

        allAreas = areas
            .concat(areaFeatures)
            .map(MapArea.fromFeature);
        customAreas = allAreas.filter(a => a.isCustom());
    });

    function showLocations(locations: MapLocation[]) {
        dispatch("showMap", {
            locations: locations,
        });
    }
    
    function showAreas(areas: MapArea[]) {
        dispatch("showMap", {
            areas: areas,
        });
    }

    function showCountry(country: string) {
        const regions = getRegions(country);
        const locations = allLocations.filter((l) => l.country == country);
        const areas = allAreas.filter(a => a.name == country || regions.indexOf(a.name) != -1);
        dispatch("showMap", {
            locations: locations,
            areas: areas,
        })
    }

    function showRegion(country: string, region: string) {
        const locations = allLocations.filter(l => l.country == country && l.region == region);
        const areas = allAreas.filter(a => a.name == region);
        dispatch("showMap", {
            locations: locations,
            areas: areas,
        })                  
    }

    function getRegions(country: string) {
        return Array.from(new Set(
            allLocations
                .filter((l) => l.country == country)
                .map((l) => l.region)
        )).sort((a, b) => a.localeCompare(b));
    }

    function getLocations(country: string, region: string) {
        return allLocations.filter((l) => l.country === country && l.region === region)
    }
</script>

<div class="locations">
    {#if customAreas.length > 0}
        <section class="country-list">
            <button class="country-heading" on:click={() => showAreas(customAreas)}>
                <h2>Custom areas</h2>
            </button>
            <ul class="country-entries">
            {#each customAreas as area}
                <li class="country-entry custom-location">
                    <button on:click={() => showAreas([area])}>
                        <span>{area.name}</span>
                    </button>
                </li>
            {/each}
            </ul>
        </section>
    {/if}

    {#each countriesSorted as country}
        <section class="country-list">            
            <button
                class="country-heading"
                on:click={() => showCountry(country)}>
                {#if country && country.trim() != ""}
                    <h2>{country}</h2>
                {:else}
                    <h2>Custom</h2>
                {/if}
            </button>

            {#each getRegions(country) as region}
                {#if region && region.trim() != ""}
                    <button
                        class="country-heading"
                        on:click={() => showRegion(country, region)}>
                        <h3>{region}</h3>
                    </button>
                {:else if getRegions(country).length > 1}
                    <p/>
                {/if}

                <ul class="country-entries">
                    {#each getLocations(country, region) as location}
                        <li class="country-entry {location.isCustom() ? 'custom-location' : ''}">
                            <button on:click={() => showLocations([location])}>
                                <span>{location.name}</span>
                            </button>
                        </li>
                    {/each}
                </ul>
            {/each}
        </section>
    {/each}
</div>

<style>
    .locations {
        columns: 180px;
        column-gap: 5px;
    }

    ul {
        margin: 0px;
        padding: 0px;
    }

    li {
        list-style-type: none;
        margin: 0px;
        padding: 0px;
    }

    button {
        all: unset;
        cursor: pointer;
        user-select: none;
    }

    .country-list {
        margin: 5px;
        break-inside: avoid;
    }

    .country-list button {
        width: 100%;
    }
    .country-list button:hover {
        background-color: #333;
    }
    .country-list button:active {
        background-color: #303030;
    }

    .country-heading h2 {
        color: #ba9;
        line-height: 2.5em;
        margin: 5px 10px 0 10px;
    }
    .country-list h3 {
        color: #a98;
        line-height: 2em;
        margin: 5px 10px 0 10px;
    }

    .country-entry {
        margin: 0px;
        line-height: 2em;
        font-weight: 600;
    }
    .country-entry span {
        margin: 0px 15px;
    }
    .custom-location {
        color: #edd;
    }
</style>
