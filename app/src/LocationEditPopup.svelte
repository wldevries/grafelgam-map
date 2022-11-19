<script lang="ts">
    import { onMount } from 'svelte';
    import type { MapLocation } from './MapLocation';
    import { addLocation, deleteLocation, loadLocations } from "./LocationStore"
    import Trash from "svelte-bootstrap-icons/lib/Trash.svelte";
    import Pencil from "svelte-bootstrap-icons/lib/Pencil.svelte";
    import type { Popup } from 'leaflet';
    import { IconStore, MapIcon } from './IconStore';
    import { Api } from './Api';
	
	export let location: MapLocation;
    export let updateIcon: { (): void };
	
    let popup: Popup;
    let nameInput: HTMLInputElement;
    let fileinput: HTMLInputElement;

    let icons: MapIcon[] = [];

    let name: string = "";
    let country: string = "";
    let region: string = "";
    let locicon: string = "";
    let editing: boolean = true;
    
    onMount(async () => {
        if (location != undefined) {
            name = location.name;
            country = location.country;
            region = location.region;
            locicon = location.icon;
        }
        editing = name == undefined || name.trim() == "";

        setTimeout(() => {
            if (nameInput != undefined)
            nameInput.focus()
        }, 10);

        icons = await IconStore.loadIcons();
    });

    export function setPopup(value: Popup) {
        popup = value;
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

    function selectIcon(icon: MapIcon) {
        locicon = icon.name;
        updateLocation();
        if (updateIcon != undefined) { 
            updateIcon();
        }
    }
</script>

<style>
    img {
        width: 30px;
        height: 30px;
    }

    .selected-icon {
        background-color: bisque;
    }

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

        <div class="label">Region</div>
        <input bind:value={region} on:change="{updateLocation}"/>

        <div class="label">Country</div>
        <input bind:value={country} on:change="{updateLocation}"/>

        {#each icons as icon}
        <button class={icon.name == locicon ? 'selected-icon' : ''} on:click={() => selectIcon(icon)}>
            <img src="{icon.uri}" alt="{icon.name}">
        </button>
        {/each}

        <button on:click={()=>{fileinput.click();}}>Choose Image</button>
        <input style="display:none" type="file" accept=".jpg, .jpeg, .png" on:change={(e)=>onFileSelected(e)} bind:this={fileinput} >
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