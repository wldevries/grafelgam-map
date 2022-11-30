<script lang="ts">
    import GoogleButton from "./GoogleButton.svelte"
    import { slide } from "svelte/transition";
    import { quintOut } from "svelte/easing";
    import { createEventDispatcher } from "svelte";
    
    import Locations from './Locations.svelte';
    import Runes from "./Runes.svelte";

    const dispatch = createEventDispatcher();

    export let locationMenuOpen = false;
    export let runeMenuOpen = false;

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

    function showMap(e: CustomEvent<{locations: Location[], areas: Location[]}>) {
        locationMenuOpen = false;
        dispatch("showMap", {
            locations: e.detail.locations,
            areas: e.detail.areas,
        });
    }

    function goHome() {
        locationMenuOpen = runeMenuOpen = false;
    }
</script>

<div class="nav">
    <div class="navbar">
        <button on:click={goHome}><h2>Grafelgam</h2></button>
        <button on:click={openLocations}>Locations</button>
        <button on:click={openRunes}>Runes</button>
        <GoogleButton />
    </div>

    {#if locationMenuOpen}
        <div
            class="navmenu navmenu-locations"
            transition:slide={{ delay: 250, duration: 300, easing: quintOut }}
        >
           <Locations on:showMap={showMap} />
        </div>
    {/if}

    {#if runeMenuOpen}
        <div class="navmenu navmenu-runes">
            <Runes />
        </div>
    {/if}
</div>

<style>
    h2 {
        color: #987;
        margin: 0px 20px;
        padding: 0;
    }

    button {
        all: unset;
        cursor: pointer;        
        user-select: none;
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
        font-weight: 700;
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
        position: absolute;
        top: 65px;
        margin: 0;
        padding: 0;
        z-index: 1;
        width: 100%;
    }
    .navmenu-locations {
        background-color: #333333F0;
    }
    .navmenu-runes {
        background-color: #444444;
    }
</style>
