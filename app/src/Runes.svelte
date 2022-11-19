{#if selectedRunes.length > 0}
    <div class="sentence"
         transition:slide|local={{duration: 200, easing: quintOut}}>
        {#each Array.from(selectedRunes) as rune (rune.id)}
            <button on:click={() => { removeRune(rune.id) }} class="icon"
                    animate:flip|local={{duration: 200, easing: quintOut}}
                    transition:fade|local={{duration: 200, easing: quintOut}}>
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
    import { fade, slide } from "svelte/transition";
    import { flip } from 'svelte/animate';
    import { quintOut } from "svelte/easing";
    import { onMount } from 'svelte';

    import { v4 as uuid } from 'uuid';

    import RuneFull from "./RuneFull.svelte"
    import RuneIcon from "./RuneIcon.svelte"

    const storageKey = "runeSentence";

    export let runes: Rune[] = [];
    export let selectedRunes: RuneWithId[] = [];

    class RuneWithId implements Rune {
        static fromRune(rune: Rune) {
            return new RuneWithId(uuid(), rune.name, rune.translation, rune.translations);
        }

        constructor(
            public id: string,
            public name: string,
            public translation: string,
            public translations: string[]) {}
    }

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
                    let runeid = RuneWithId.fromRune(rune);
                    selectedRunes = [...selectedRunes, runeid];
                }
            });
        }
    }

    function removeRune(id: string) {
        const index = selectedRunes.findIndex(r => r.id === id);
        if (index != -1) {
            selectedRunes.splice(index, 1);
            selectedRunes = selectedRunes;
            saveLocalStorage();
        }
    }

    function addRune(rune: Rune) {
        let runeid = RuneWithId.fromRune(rune);
        selectedRunes = [...selectedRunes, runeid];
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
        justify-content: center;
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
        display: flex;        
        justify-content: center;
    }
    .rune {
        padding: 20px;
        flex-grow: 1;
    }
    .icon {
        padding: 5px;
        flex-shrink: 0;
    }
</style>
