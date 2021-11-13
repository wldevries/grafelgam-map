<Modal show={$modal}>
    <Nav on:showLocations={showLocations}/>
    <Map bind:this={map}/>
</Modal>

<script lang="ts">
    import Modal from './Modal.svelte';
	import { modal } from './Stores';

    import Map from "./Map.svelte";
    import Nav from "./Nav.svelte";

    let map: Map;

    function showLocations(e: CustomEvent<{locations: Location[]}>) {
        map.showLocations(e.detail.locations);
    }
</script>
