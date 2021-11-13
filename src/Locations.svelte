<script lang="ts">
    import { onMount } from "svelte";
    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();

    export let allLocations: Location[] = [];
    export let countries: Set<string> = new Set();

    onMount(() => {
        loadLocations();
    });

    function showLocations(locations: Location[]) {
        dispatch("showLocations", {
            locations: locations,
        });
    }
    async function loadLocations() {
        allLocations = await fetch("locations.json").then((response) =>
            response.json()
        );

        allLocations.sort((a, b) => a.name.localeCompare(b.name));

        countries.clear();
        allLocations.forEach((loc) => countries.add(loc.country));
    }
</script>

<div class="locations">
    {#each Array.from(countries).sort((a, b) => a.localeCompare(b)) as country}
        <section class="country-list">
            <button
                class="country-heading"
                on:click={() =>
                    showLocations(allLocations.filter((l) => l.country == country))}
            >
                <h3>{country}</h3>
            </button>

            <ul class="country-entries">
                {#each allLocations.filter((l) => l.country == country) as location}
                    <li class="country-entry">
                        <button on:click={() => showLocations([location])}>
                            <span>{location.name}</span>
                        </button>
                    </li>
                {/each}
            </ul>
        </section>
    {/each}
</div>

<style>
    .locations {
        columns: 180px;
        column-gap: 5px;
    }

    ul {
        margin: 0px;
        padding: 0px;
    }

    li {
        list-style-type: none;
        margin: 0px;
        padding: 0px;
    }

    button {
        all: unset;
        cursor: pointer;
    }
    
    .country-list {
        margin: 5px;
        break-inside: avoid;
    }

    .country-list button {
        width: 100%;
    }
    .country-list button:hover {
        background-color: #333;
    }
    .country-list button:active {
        background-color: #303030;
    }

    .country-heading h3 {
        line-height: 2.5em;
        margin: 5px 10px 0 10px;
    }

    .country-entry {
        margin: 0px;
        line-height: 2em;
        font-weight: 600;
    }
    .country-entry span {
        margin: 0px 15px;
    }
</style>
