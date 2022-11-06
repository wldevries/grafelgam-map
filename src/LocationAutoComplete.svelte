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
    import { CustomMapLocation, loadLocations, onChange } from "./LocationStore.js"
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

    let selectedLocation: MapLocation | undefined;
    let allLocations: MapLocation[] = [];
    let skipDispatch: boolean;

    export function select(location: MapLocation) {
        selectedLocation = location;
    }

    onMount(async () => {                
        onChange(async () => {
            await refresh();
        });
        await refresh();
    });

    async function refresh() {
        allLocations = await loadLocations();
        allLocations.sort((a, b) => a.name.localeCompare(b.name));

        if (selectedLocation instanceof CustomMapLocation) {
            let selectedId = selectedLocation.id;
            let newSelection = allLocations.find(l => l instanceof CustomMapLocation && l.id == selectedId);
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