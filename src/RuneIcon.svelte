<article>
    <img src="runes/{rune.name.toLowerCase()}.svg" alt={rune.description} />
    <h5>{rune.name}</h5>
    {#if showTranslations}
        <p class="translation">{rune.translations[Math.floor(Math.random() * rune.translations.length)].toLocaleLowerCase()}</p>
    {/if}
</article>

<script lang="ts">
    import type { Rune } from "./Models"

    export let rune: Rune;
    export let showTranslations: boolean = false;
</script>

<style>
    img {
        display: block;
        height: 50px;
        max-width: 50px;
        margin: auto;
        filter: invert(58%) sepia(11%) saturate(597%)
                hue-rotate(349deg) brightness(60%) contrast(90%)
                drop-shadow(1px 1px 0.1rem #333);
    }
    h5 {
        margin: auto;
        text-align: center;
        word-wrap: break-word;
    }
    .translation {
        margin: auto;
        text-align: center;
    }
</style>