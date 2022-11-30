<script lang="ts">
    import type { MapLocation } from './MapLocation';
    import type { Marker } from 'leaflet';
    import Pencil from "svelte-bootstrap-icons/lib/Pencil.svelte";
	
	export let location: MapLocation;
    export let marker: Marker;
    export let bindEditPopup: (marker: Marker, location: MapLocation) => void;

    // Switch to not editing mode
    function handleEdit() {
        marker.unbindPopup();
        bindEditPopup(marker, location);
        marker.openPopup();
    }

</script>

<div>
    <h3>{location.name}</h3>
    <p>{location.country}
    {#if location.region && location.region.trim() != ""}
        <span>({location.region})</span>
    {/if}
    </p>

    {#if location.isCustom()}
    <div class="button-panel">
        <button on:click={handleEdit}><Pencil /></button>        
    </div>
    {/if}
</div>

<style>

    .button-panel {
        flex: auto;
        text-align: right;
    }
</style>