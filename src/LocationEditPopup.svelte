<script lang="ts">
    import { onMount } from 'svelte';
    import { addLocation, MapLocation } from './LocationStore';
    import { deleteLocation } from "./LocationStore"
    import Trash from "svelte-bootstrap-icons/lib/Trash.svelte";
    import Pencil from "svelte-bootstrap-icons/lib/Pencil.svelte";
	
	export let location: MapLocation;
	
    let popup: L.Popup;
    let nameInput: HTMLInputElement;

    let name: string = "";
    let country: string = "";
    let region: string = "";
    let editing: boolean = true;
    
    onMount(() => {
        if (location != undefined) {
            name = location.name;
            country = location.country;
            region = location.region;
        }
        editing = name == undefined || name.trim() == "";
        setTimeout(() => {
            if (nameInput != undefined)
            nameInput.focus()
        }, 10);
    });

    export function setPopup(value: L.Popup) {
        popup = value;
    }

    function updateLocation() {
        if (location != undefined) {
            location.name = name.trim();
            location.country = country.trim();
            location.region = region.trim();

            if (location.name.length > 0) {
                addLocation(location);
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
        if (location != undefined) {
            deleteLocation(location);
        }
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
        <input bind:this={nameInput} bind:value={name} on:change="{updateLocation}"/>

        <div class="label">Country</div>
        <input bind:value={country} on:change="{updateLocation}"/>

        <div class="label">Region</div>
        <input bind:value={region} on:change="{updateLocation}"/>
    {:else}
        <h3>{location.name}</h3>
        <p>{location.country}
        {#if location.region != undefined && location.region != ""}
            <span>({location.region})</span>
        {/if}
        </p>
    {/if}

    <div class="button-panel">
        <button on:click={handleEdit}><Pencil /></button>        
        <button on:click={handleDelete}><Trash /></button>        
    </div>
</div>
