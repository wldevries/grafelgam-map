<Modal show={$modal}>
    <Nav on:showMap={showMap}/>
    <Map bind:this={map}/>
</Modal>

<script lang="ts">
    import Modal from './Modal.svelte';
	import { modal } from './Stores';

    import Map from "./Map.svelte";
    import Nav from "./Nav.svelte";
    import type { MapArea } from './AreaStore';

    let map: Map;

    function showMap(e: CustomEvent<{locations: MapLocation[], areas: MapArea[]}>) {
        map.showMap(e.detail.locations, e.detail.areas);
    }    
</script>
