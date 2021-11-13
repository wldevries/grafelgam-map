<article>
    <img src="runes/{rune.name.toLowerCase()}.svg" alt={rune.name} />
    <h3>{rune.name}</h3>    
    <h4 class="translation">{rune.translation} Rune</h4>
    <ul>
        {#each rune.translations as translation}
            <li>{translation.toLocaleLowerCase()}</li>
        {/each}
    </ul>
</article>

<script lang="ts">
    export let rune: Rune;
</script>

<style>
    article {
        max-width: 150px;
    }
    img {
        display: block;
        margin: auto;
        height: 150px;
        max-width: 150px;
        filter: invert(58%) sepia(11%) saturate(597%)
                hue-rotate(349deg) brightness(80%) contrast(90%)
                drop-shadow(1px 1px 0.1rem #333);
    }
    h3 {
        text-align: center;
        margin: 1em auto .2em auto;
    }
    h4 {
        text-align: center;
        margin: 0;
    }
    ul, li {
        list-style: none;
    }
    ul {
        margin: auto;
        padding: 0;
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
    }
    li {
        margin: 0 .5em;
        opacity: 60%;
        font-size: 0.8em;
    }
    .translation {
        display: float;
        opacity: 80%;
        font-size: 0.8em;
    }
</style>