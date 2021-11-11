<script lang="ts">
    import { onMount } from "svelte";
    import { slide } from "svelte/transition";
    import { quintOut } from "svelte/easing";
    import { createEventDispatcher } from "svelte";

    import type { Location } from "./Models";
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
        <h2>Grafelgam</h2>
        <button on:click={openLocations} class="navtoggle">Locations</button>
        <button on:click={openRunes} class="navtoggle">Runes</button>
    </div>

    {#if locationMenuOpen}
        <div
            class="navmenu"
            transition:slide={{ delay: 250, duration: 300, easing: quintOut }}
        >
            {#each Array.from(countries).sort( (a, b) => a.localeCompare(b) ) as country}
                <button
                    on:click={() =>
                        showLocations(
                            allLocations.filter((l) => l.country == country)
                        )}
                >
                    <h3>{country}</h3>
                </button>

                <ul>
                    {#each allLocations.filter((l) => l.country == country) as location}
                        <li>
                            <button on:click={() => showLocations([location])}>
                                <span>{location.name}</span>
                            </button>
                        </li>
                    {/each}
                </ul>
            {/each}
        </div>
    {/if}

    {#if runeMenuOpen}
        <div
            class="navmenu"
            transition:slide={{ delay: 250, duration: 300, easing: quintOut }}
        >
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
        color: #987;
        line-height: 2em;
        list-style-type: none;
    }

    h2 {
        color: #987;
        margin: 0px 20px;
        padding: 0;
    }

    h3 {
        margin: 20px 0px 10px 40px;
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
        line-height: 50px;
        top: 0px;
    }

    .navtoggle {
        all: unset;
        color: #987;
        cursor: pointer;
        padding: 2px 10px;
    }

    .navmenu {
        color: #987;
        background-color: #444;
        position: absolute;
        top: 65px;
        margin: 0;
        padding: 0;
        z-index: 1;
        width: 100%;
    }

    .navmenu button {
        all: unset;
        width: 100%;
        color: #987;
        cursor: pointer;
    }
    .navmenu button:hover {
        background-color: #443322;
    }
    .navmenu span {
        margin: 0px 45px;
    }
</style>
