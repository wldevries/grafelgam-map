<script lang="ts">
    import { onMount } from 'svelte';
    import Trash from "svelte-bootstrap-icons/lib/Trash.svelte";
    import Pencil from "svelte-bootstrap-icons/lib/Pencil.svelte";
    import { ArrowsMove } from 'svelte-bootstrap-icons';
    import type { Polygon } from 'leaflet';
    import type { MapArea } from './MapArea';
    import { featureStore } from './Stores';
    
	export let area: MapArea;
    export let polygon: Polygon;
    export let bindEditPopup: (polygon: Polygon, area: MapArea) => void;

    let moving: boolean;

    onMount(() => {
        moving = polygon.pm.enabled();
    });

    function handleEdit() {
        polygon.unbindPopup();
        bindEditPopup(polygon, area);
        polygon.openPopup();
    }

    function handleDelete() {
        if (area) {
            featureStore.delete(area);
        }
    }

    function handleMove() {
        polygon.pm.toggleEdit({
            draggable: true,
        });
        moving = polygon.pm.enabled();
    }
</script>

<style>
    .button-panel {
        flex: auto;
        text-align: right;
    }

    .active {
        background-color: bisque;
    }
</style>

<div>
    <h3>{area.name}</h3>

    {#if area.isCustom()}
    <div class="button-panel">
        <button on:click={handleMove} class={moving ? 'active' : ''}>
            <ArrowsMove />
        </button>
        <button on:click={handleEdit}><Pencil /></button>
        <button on:click={handleDelete}><Trash /></button>
    </div>
    {/if}
</div>
