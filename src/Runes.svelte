{#if selectedRunes.length > 0}
    <div class="sentence">
        {#each Array.from(selectedRunes) as rune, i}
            <button on:click={() => { removeRune(i) }} class="icon">
                <RuneIcon bind:rune="{rune}" showTranslations="{true}" />
            </button>
        {/each}
    </div>
{/if}

<div class="runes">
    {#each Array.from(runes) as rune}
        <button on:click={() => { addRune(rune) }} class="rune">
            <RuneFull bind:rune="{rune}" />
        </button>
    {/each}
</div>

<script lang="ts">
    import { getContext, onMount } from 'svelte';
    import type { Rune } from "./Models"
    import RuneFull from "./RuneFull.svelte"
    import RuneIcon from "./RuneIcon.svelte"

    const storageKey = "runeSentence";

    export let runes: Rune[] = [];
    export let selectedRunes: Rune[] = [];

    onMount(async () => {
        if (runes.length == 0) {
            await loadRunes();
        }
        if (selectedRunes.length == 0) {
            loadSaved();
        }
    });

    async function loadRunes() {
        runes = await fetch("runes.json").then((response) =>
            response.json()
        );

        runes.sort((a, b) => a.name.localeCompare(b.name));
    }

    function loadSaved() {
        const namesJson = localStorage.getItem(storageKey);
        const names: string[] = JSON.parse(namesJson);
        if (Array.isArray(names)) {
            names.forEach(n => {
                const rune = runes.find(r => r.name === n);
                if (rune != undefined) {
                    selectedRunes = [...selectedRunes, rune];
                }
            });
        }
    }

    function removeRune(index: number) {
        selectedRunes.splice(index, 1);
        selectedRunes = selectedRunes;
        saveLocalStorage();
    }

    function addRune(rune: Rune) {
        selectedRunes = [...selectedRunes, rune];
        saveLocalStorage();
    }

    function saveLocalStorage() {
        localStorage.setItem(storageKey,JSON.stringify(selectedRunes.map(r => r.name)));
    }

</script>

<style>
    .runes {
        display: flex;
        flex-wrap: wrap;
    }
    .sentence {
        background-color: #222;
        padding: 20px;
        z-index: 1;
        position: sticky;
        display: flex;
        overflow: auto;
        top: 0px;
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
