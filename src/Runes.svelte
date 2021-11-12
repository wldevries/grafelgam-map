<div class="sentence">
    {#each Array.from(selectedRunes) as rune}
        <div class="icon">
            <RuneIcon bind:rune="{rune}" />
        </div>
    {/each}
</div>

<div class="runes">
    {#each Array.from(runes) as rune}
        <button on:click={() => { showRune(rune) }} class="rune">
            <RuneFull bind:rune="{rune}" />
        </button>
    {/each}
</div>

<script lang="ts">
    import { getContext, onMount } from 'svelte';
    import type { Rune } from "./Models"
    import RuneFull from "./RuneFull.svelte"
    import RuneIcon from "./RuneIcon.svelte"

    const { open } = getContext('simple-modal');

    export let runes: Rune[] = [];
    export let selectedRunes: Rune[] = [];

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
        selectedRunes = [...selectedRunes, rune];
    }
</script>

<style>
    .runes {
        display: flex;
        flex-wrap: wrap;
    }
    .sentence {
        display: flex;
        overflow: auto;
    }
    button {
        all: unset;
        cursor: pointer;
        display: inline-flex; /* keep the inline nature of buttons */
        align-items: flex-start; /* this is default */
    }
    .rune {
        margin: 20px;
    }
    .icon {
        margin: 5px;
    }
</style>
