<script lang="ts">
    import { onMount } from 'svelte';
    import { addArea, deleteArea } from './AreaStore';
    import Trash from "svelte-bootstrap-icons/lib/Trash.svelte";
    import Pencil from "svelte-bootstrap-icons/lib/Pencil.svelte";
    import { ArrowsMove } from 'svelte-bootstrap-icons';
    import type { Polygon } from 'leaflet';
    import type { MapArea } from './MapArea';
	
	export let area: MapArea;
    export let polygon: Polygon;
    export let bindViewPopup: (polygon: Polygon, area: MapArea) => void;

    let nameInput: HTMLInputElement;

    let name: string = "";
    let color: string = "";
    let moving: boolean;

    onMount(() => {
        if (area != undefined) {
            name = area.name;
            color = area.color;
        }
        
        setTimeout(() => {
            if (nameInput != undefined)
                nameInput.focus();
        }, 10);

        moving = polygon.pm.enabled();
    });

    function updateArea() {
        if (area != undefined) {
            area.name = name.trim();
            area.color = color == undefined ? "" : color.trim();

            if (area.name.length > 0) {
                addArea(area);
            }
        }
    }
    
    function handleEdit() {
        polygon.unbindPopup();
        bindViewPopup(polygon, area);
        polygon.openPopup();
    }

    function handleDelete() {
        if (area != undefined) {
            deleteArea(area);
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
    .label {
        margin-top: 4px;
    }

    .button-panel {
        flex: auto;
        text-align: right;
    }

    .active {
        background-color: bisque;
    }
</style>

<div>
    <div class="label">Name</div>
    <input bind:this={nameInput} bind:value={name} on:change="{updateArea}"/>
    
    <div class="color">Name</div>
    <input bind:value={color} on:change="{updateArea}"/>

    <div class="button-panel">
        <button on:click={handleMove} class={moving ? 'active' : ''}>
            <ArrowsMove />
        </button>
        <button on:click={handleEdit} class='active'><Pencil /></button>
        <button on:click={handleDelete}><Trash /></button>
    </div>
</div>
