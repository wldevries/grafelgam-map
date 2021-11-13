<script lang="ts">
    import { map } from "leaflet";
    import { onMount } from "svelte";
    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();

    export let allLocations: Location[] = [];
    export let countries: Set<string> = new Set();

    onMount(() => {
        loadLocations();
    });

    function showLocations(locations: Location[]) {
        dispatch("showLocations", {
            locations: locations,
        });
    }

    function getCountries() {
        return Array.from(countries).sort((a, b) => a.localeCompare(b));
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

    async function loadLocations() {
        allLocations = await fetch("locations.json").then((response) =>
            response.json()
        );

        allLocations.sort((a, b) => a.name.localeCompare(b.name));

        countries.clear();
        allLocations.forEach((loc) => countries.add(loc.country));
    }
</script>

<div class="locations">
    {#each getCountries() as country}
        <section class="country-list">
            <button
                class="country-heading"
                on:click={() =>
                    showLocations(
                        allLocations.filter((l) => l.country == country)
                    )}
            >
                <h2>{country}</h2>
            </button>

            {#each getRegions(country) as region}
                {#if region != undefined}
                    <button
                        class="country-heading"
                        on:click={() =>
                            showLocations(
                                allLocations.filter(
                                    (l) =>
                                        l.country == country &&
                                        l.region == region
                                )
                            )}
                    >
                        <h3>{region}</h3>
                    </button>
                {:else if getRegions(country).length > 1}
                    <p/>
                {/if}

                <ul class="country-entries">
                    {#each getLocations(country, region) as location}
                        <li class="country-entry">
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
</style>
