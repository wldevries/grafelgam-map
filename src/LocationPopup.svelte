<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();
	
	export let location: MapLocation;
	
	// function addValue(delta) {
	// 	count += delta;
	// 	dispatch('change', count);
	// }
</script>
<!-- 
<style>
	button {
		width: 2rem
	}
</style>

<div>
	<button on:click={() => addValue(-1)}>
		-
	</button>
	<button on:click={() => addValue(1)}>
		+
	</button>	
</div> -->

<div>
    <h3>{location.name}</h3>
    {#if location.region == undefined}
        <p>{location.country} hoi</p>
    {:else}
        <p>{location.country} ({location.region})</p>
    {/if}
</div>
