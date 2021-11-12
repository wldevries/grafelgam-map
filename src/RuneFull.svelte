<article>
    <img src="runes/{rune.name.toLowerCase()}.svg" alt={rune.description} />
    <h3>{rune.name} <span class="description">({rune.description})</span></h3>
    <ul>
        {#each rune.translations as translation}
            <li>{translation}</li>
        {/each}
    </ul>
</article>

<script lang="ts">
    import type { Rune } from "./Models"

    export let rune: Rune;
</script>

<style>
    article {
        max-width: 150px;
    }
    img {
        height: 150px;
        max-width: 150px;
        filter: invert(58%) sepia(11%) saturate(597%)
                hue-rotate(349deg) brightness(60%) contrast(90%)
                drop-shadow(1px 1px 0.1rem #333);
    }
    h3 {
        margin: 0.2em 0;
    }
    ul, li {list-style: none;}
    ul {
        margin: 0;
        padding: 0;
        display: flex;
        flex-wrap: wrap;
    }
    li {
        margin-right: 1em;
    }
    .description {
        opacity: 50%;
        font-size: 0.7em;
    }
</style>