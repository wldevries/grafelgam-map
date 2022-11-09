<Modal show={$modal}>
    <Nav on:showLocations={showLocations} on:showAreas={showAreas}/>
    <Map bind:this={map}/>
</Modal>

<script lang="ts">
    import Modal from './Modal.svelte';
	import { modal } from './Stores';

    import Map from "./Map.svelte";
    import Nav from "./Nav.svelte";
    import type { MapArea } from './AreaStore';

    let map: Map;

    function showLocations(e: CustomEvent<{locations: MapLocation[]}>) {
        map.showLocations(e.detail.locations);
    }

    function showAreas(e: CustomEvent<{areas: MapArea[]}>) {
        map.showAreas(e.detail.areas);
    }
</script>
