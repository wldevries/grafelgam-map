<script lang="ts">
    import { onMount, createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();
	
	export let location: CustomMapLocation;
	
    let name: string = "";
    let country: string = "";
    let region: string = "";
    
    onMount(() => {
        if (location != undefined) {
            name = location.name;
            country = location.country;
            region = location.region;
        }
    });

    function updateLocation() {
        if (location != undefined) {
            location.name = name;
            location.country = country;
            location.region = region;
        }
    }
</script>

<style>
    .label {
        margin-top: 4px;
    }
</style>

<div>
    <div class="label">Name</div>
    <input bind:value={name} on:change="{updateLocation}"/>

    <div class="label">Country</div>
    <input bind:value={country} on:change="{updateLocation}"/>

    <div class="label">Region</div>
    <input bind:value={region} on:change="{updateLocation}"/>    
</div>
