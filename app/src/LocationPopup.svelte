<script lang="ts">
    import type { MapLocation } from './MapLocation';
	
	export let location: MapLocation;
</script>

<div>
    <h3>{location.name}</h3>
    <p>{location.country}
    {#if location.region != undefined && location.region != ""}
        <span>({location.region})</span>
    {/if}
    </p>
</div>
