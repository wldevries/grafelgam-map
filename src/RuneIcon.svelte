<article>
    <img src="runes/{rune.name.toLowerCase()}.svg" alt={rune.name} />
    <h4>{rune.name}</h4>
    {#if showTranslations}
        <p class="translation">{rune.translation.toLocaleLowerCase()}</p>
    {/if}
</article>

<script lang="ts">    
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
                hue-rotate(349deg) brightness(70%) contrast(90%);
    }
    h4 {
        margin: .5em auto auto auto;
        text-align: center;
        word-wrap: break-word;
    }
    .translation {
        margin: auto;
        text-align: center;
    }
</style>