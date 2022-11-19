<script lang="ts">
    import { onMount } from 'svelte';
    import { addArea, deleteArea } from './AreaStore';
    import Trash from "svelte-bootstrap-icons/lib/Trash.svelte";
    import Pencil from "svelte-bootstrap-icons/lib/Pencil.svelte";
    import { ArrowsMove } from 'svelte-bootstrap-icons';
    import type { Polygon, Popup } from 'leaflet';
    import type { MapArea } from './MapArea';
	
	export let area: MapArea;
    export let polygon: Polygon
	
    let popup: Popup;
    let nameInput: HTMLInputElement;

    let name: string = "";
    let color: string = "";
    let editing: boolean = true;
    
    onMount(() => {
        if (area != undefined) {
            name = area.name;
            color = area.color;
        }
        editing = name == undefined || name.trim() == "";
        setTimeout(() => {
            if (nameInput != undefined)
                nameInput.focus();
        }, 10);
    });

    export function setPopup(value: Popup) {
        popup = value;
    }

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
        editing = !editing;
        if (popup != undefined) {
            ///This closes the popup for some reason. Width is now overridden in
            // global.css to make sure in edit mode the popup is wide enough
            // popup.update();
        }
    }

    function handleDelete() {
        if (area != undefined) {
            deleteArea(area);
        }
    }

    function handleMove() {
        polygon.pm.toggleEdit({
            draggable: true,
        })
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
</style>

<div>
    {#if editing}
        <div class="label">Name</div>
        <input bind:this={nameInput} bind:value={name} on:change="{updateArea}"/>
        <input bind:value={color} on:change="{updateArea}"/>
    {:else}
        <h3>{area.name}</h3>
    {/if}

    <div class="button-panel">
        <button on:click={handleMove}><ArrowsMove /></button>
        <button on:click={handleEdit}><Pencil /></button>
        <button on:click={handleDelete}><Trash /></button>
    </div>
</div>
