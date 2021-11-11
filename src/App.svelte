<main>
    <Nav on:showLocations={showLocations}/>
    <Map bind:this={map}/>
</main>

<script lang="ts">
    import Map from "./Map.svelte";
    import type { Location } from './Map.svelte'
    import Nav from "./Nav.svelte";

    let map: Map;

    function showLocations(e: CustomEvent<{locations: Location[]}>) {
        map.showmap(e.detail.locations);
    }
</script>
