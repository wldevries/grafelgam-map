<script lang="ts">
    import type { MapLocation } from './MapLocation';
    import type { Popup, Marker } from 'leaflet';
    import { bindLocationEditPopup } from './MapPopup';
    import Pencil from "svelte-bootstrap-icons/lib/Pencil.svelte";
	
	export let location: MapLocation;

    let popup: Popup;
    let marker: Marker;

    export function setPopup(options: { popup: Popup; layer: Marker; }) {
        popup = options.popup;
        marker = options.layer;
    }

    // Switch to not editing mode
    function handleEdit() {
        marker.unbindPopup();
        bindLocationEditPopup(marker, location);
        marker.openPopup();
    }

</script>

<div>
    <h3>{location.name}</h3>
    <p>{location.country}
    {#if location.region != undefined && location.region != ""}
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