<div class="search">
    <AutoComplete
        placeholder="search…"
        items={allLocations}
        bind:selectedItem={selectedLocation}        
        labelFieldName="name"
        onChange="{locationChanged}"
        showClear="true" />
</div>

<script lang="ts">
    import AutoComplete from "simple-svelte-autocomplete";
    import { onMount } from "svelte";
    import { MapLocation } from "./MapLocation";
	import { createEventDispatcher } from 'svelte';
    import { loadPlacesWeb } from "./Services/WebLoader"
    import { featureStore } from "./Services/Stores";

	const dispatch = createEventDispatcher();

    let selectedLocation: MapLocation | undefined;
    let allLocations: MapLocation[] = [];
    let skipDispatch: boolean;

    export function select(location: MapLocation) {
        // Skip even dispatch if selection was made from the outside
        skipDispatch = true;
        selectedLocation = location;
    }

    onMount(async () => {                
        featureStore.Changed.on(async () => {
            await refresh();
        });
        await refresh();
    });

    async function refresh() {
        allLocations = (await loadPlacesWeb()).map(f => MapLocation.fromFeature(f));
        allLocations.sort((a, b) => a.name.localeCompare(b.name));

        if (selectedLocation instanceof MapLocation) {
            let selectedId = selectedLocation.id;
            let newSelection = allLocations.find(l => l.isCustom() && l.id == selectedId);
            // Fore some reason setting undefined does not clear the selection in AutoComplete
            selectedLocation = newSelection;
        
            // We want to update the selection, if we do that we force push
            // a new selection on the map closing any popup
            skipDispatch = true;
        }
    }
    
    function locationChanged() {
        if (skipDispatch) {
            skipDispatch = false;
        }
        else {
            dispatch('select', {
                location: selectedLocation
            });
        }
    }

</script>

<style>    
    
    /* More styling is on autocomplete class in global styles */
    .search {
        width: 250px;
        position: fixed;
        top: 76px;
        left: 80px;
    }

</style>