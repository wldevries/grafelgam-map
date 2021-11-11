<div>
    {#each Array.from(runes) as rune}
        <!-- <button on:click={() => { showRune(rune) }}>
            <img src="runes/{rune.name}.svg" alt={rune.description} />
        </button> -->
        <div class="rune">
            <RunePopup bind:rune="{rune}" />
        </div>
    {/each}
</div>

<script lang="ts">
    import { getContext, onMount } from 'svelte';
    import type { Rune } from "./Models"
    import RunePopup from "./RunePopup.svelte"

    const { open } = getContext('simple-modal');

    export let runes: Rune[] = [];

    onMount(() => {
        loadRunes();
    });
    
    async function loadRunes() {
        runes = await fetch("runes.json").then((response) =>
            response.json()
        );

        runes.sort((a, b) => a.name.localeCompare(b.name));
    }

    function showRune(rune: Rune) {
        open(RunePopup, { rune: rune })
    }
</script>

<style>
    div {
        display: flex;
        flex-wrap: wrap;
    }
    img {
        margin: 10px;
    }
    button {
        all: unset;
        cursor: pointer;
    }
    .rune {
        margin: 20px;
    }
</style>
