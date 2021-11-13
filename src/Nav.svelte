<script lang="ts">
    import { onMount } from "svelte";
    import { slide } from "svelte/transition";
    import { quintOut } from "svelte/easing";
    import { createEventDispatcher } from "svelte";

    import Runes from "./Runes.svelte";

    const dispatch = createEventDispatcher();

    export let locationMenuOpen = false;
    export let runeMenuOpen = false;

    export let allLocations: Location[] = [];
    export let countries: Set<string> = new Set();

    function openLocations() {
        locationMenuOpen = !locationMenuOpen;
        if (locationMenuOpen) {
            runeMenuOpen = false;
        }
    }

    function openRunes() {
        runeMenuOpen = !runeMenuOpen;
        if (locationMenuOpen) {
            locationMenuOpen = false;
        }
    }

    function showLocations(locations: Location[]) {
        locationMenuOpen = false;
        dispatch("showLocations", {
            locations: locations,
        });
    }

    function goHome() {
        locationMenuOpen = runeMenuOpen = false;
    }

    onMount(() => {
        loadLocations();
    });

    async function loadLocations() {
        allLocations = await fetch("locations.json").then((response) =>
            response.json()
        );

        allLocations.sort((a, b) => a.name.localeCompare(b.name));

        countries.clear();
        allLocations.forEach((loc) => countries.add(loc.country));
    }
</script>

<div class="nav">
    <div class="navbar">
        <button on:click={goHome}><h2>Grafelgam</h2></button>
        <button on:click={openLocations}>Locations</button>
        <button on:click={openRunes}>Runes</button>
    </div>

    {#if locationMenuOpen}
        <div
            class="navmenu navmenu-locations"
            transition:slide={{ delay: 250, duration: 300, easing: quintOut }}
        >
            {#each Array.from(countries).sort( (a, b) => a.localeCompare(b) ) as country}
                <section class="country-list">
                    <button
                        class="country-heading"
                        on:click={() =>
                            showLocations(
                                allLocations.filter((l) => l.country == country)
                            )}
                    >
                        <h3>{country}</h3>
                    </button>

                    <ul class="country-entries">
                        {#each allLocations.filter((l) => l.country == country) as location}
                            <li class="country-entry">
                                <button on:click={() => showLocations([location])}>
                                    <span>{location.name}</span>
                                </button>
                            </li>
                        {/each}
                    </ul>
                </section>
            {/each}
        </div>
    {/if}

    {#if runeMenuOpen}
        <div class="navmenu">
            <Runes />
        </div>
    {/if}
</div>

<style>
    ul {
        margin: 0px;
        padding: 0px;
    }

    li {
        list-style-type: none;
        margin: 0px;
        padding: 0px;
    }

    h2 {
        color: #987;
        margin: 0px 20px;
        padding: 0;
    }

    button {
        all: unset;
        cursor: pointer;        
    }

    .navbar {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        background-color: #333333;
        position: fixed;
        z-index: 1;
        width: 100%;
        height: 65px;
        top: 0px;
    }

    .navbar button {
        padding: 0px 10px;
        color: #987;
        height: 100%;
    }
    .navbar button:hover {
        background-color: #333;
    }
    .navbar button:active {
        background-color: #303030;
    }

    .navmenu {
        color: #987;
        background-color: #444444;
        position: absolute;
        top: 65px;
        margin: 0;
        padding: 0;
        z-index: 1;
        width: 100%;
    }

    .navmenu-locations {
        background-color: #333333F0;
        columns: 180px;
        column-gap: 5px;
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

    .country-heading h3 {
        line-height: 2.5em;
        margin: 5px 10px 0 10px;
    }

    .country-entry {
        margin: 0px;
        line-height: 2em;
    }
    .country-entry span {
        margin: 0px 15px;
    }
</style>
