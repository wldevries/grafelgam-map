<script lang="ts">
    import { onMount } from 'svelte';
    import { addLocation, CustomMapLocation } from './LocationStore';
    import { deleteLocation } from "./LocationStore"
    import Trash from "svelte-bootstrap-icons/lib/Trash.svelte";
	
	export let location: CustomMapLocation;
	
    let nameInput: HTMLInputElement;

    let name: string = "";
    let country: string = "";
    let region: string = "";
    
    onMount(() => {
        if (location != undefined) {
            name = location.name;
            country = location.country;
            region = location.region;
        }
        setTimeout(() => nameInput.focus(), 10);
    });

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
    <div class="label">Name</div>
    <input bind:this={nameInput} bind:value={name} on:change="{updateLocation}"/>

    <div class="label">Country</div>
    <input bind:value={country} on:change="{updateLocation}"/>

    <div class="label">Region</div>
    <input bind:value={region} on:change="{updateLocation}"/>

    <div class="button-panel">
        <button on:click={handleDelete}><Trash/></button>        
    </div>
</div>
