<script lang="ts">
    import { onMount } from 'svelte';
    import type { MapLocation } from './MapLocation';
    import { addLocation, deleteLocation } from "./LocationStore"
    import Trash from "svelte-bootstrap-icons/lib/Trash.svelte";
    import Pencil from "svelte-bootstrap-icons/lib/Pencil.svelte";
    import type { Popup, Marker } from 'leaflet';
    import { IconStore, MapIcon } from './IconStore';
    import { Api } from './Api';
    import { bindLocationViewPopup } from './MapPopup';
    import { setLocationIcon } from './IconAssigner';
	
	export let location: MapLocation;
	
    let popup: Popup;
    let marker: Marker;
    let nameInput: HTMLInputElement;
    let fileinput: HTMLInputElement;

    let icons: MapIcon[] = [];

    let name: string = "";
    let country: string = "";
    let region: string = "";
    let locicon: string = "";
    
    onMount(async () => {
        if (location != undefined) {
            name = location.name;
            country = location.country;
            region = location.region;
            locicon = location.icon;
        }

        setTimeout(() => {
            if (nameInput != undefined)
            nameInput.focus()
        }, 10);

        icons = await IconStore.loadIcons();
    });

    export function setPopup(options: { popup: Popup; layer: Marker; }) {
        popup = options.popup;
        marker = options.layer;
    }

	const onFileSelected = async e => {
        let image = e.target.files[0];
        await Api.uploadIcon(image);
        icons = await IconStore.loadIcons();
    };

    function updateLocation() {
        if (location != undefined) {
            location.name = name.trim();
            location.country = country.trim();
            location.region = region.trim();
            location.icon = locicon.trim();

            if (location.name.length > 0) {
                addLocation(location);
            }
        }
    }
    
    // Switch to not editing mode
    function handleEdit() {
        marker.unbindPopup();
        bindLocationViewPopup(marker, location);
        marker.openPopup();
    }

    function handleDelete() {
        if (location != undefined) {
            deleteLocation(location);
        }
    }

    function selectIcon(icon: MapIcon) {
        locicon = icon.name;
        updateLocation();
        setLocationIcon(marker, location);
    }
</script>

<style>
    img {
        width: 30px;
        height: 30px;
    }

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
    <input bind:this={nameInput} bind:value={name} on:change="{updateLocation}"/>

    <div class="label">Region</div>
    <input bind:value={region} on:change="{updateLocation}"/>

    <div class="label">Country</div>
    <input bind:value={country} on:change="{updateLocation}"/>

    <div class="label">Marker icon</div>
    <div>
        {#each icons as icon}
        <button class={icon.name == locicon ? 'active' : ''} on:click={() => selectIcon(icon)}>
            <img src="{icon.uri}" alt="{icon.name}">
        </button>
        {/each}
    </div>

    <button on:click={()=>{fileinput.click();}}>Choose Image</button>
    <input style="display:none" type="file" accept=".jpg, .jpeg, .png" on:change={(e)=>onFileSelected(e)} bind:this={fileinput} >

    <div class="button-panel">
        <button on:click={handleEdit} class="active"><Pencil /></button>        
        <button on:click={handleDelete}><Trash /></button>        
    </div>
</div>
