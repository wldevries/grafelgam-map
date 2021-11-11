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
        max-width: 200px;
    }
    img {
        height: 200px;
        max-width: 200px;
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