<article>
    <img src="runes/{rune.name.toLowerCase()}.svg" alt={rune.description} />
    <h5>{rune.name}</h5>
</article>

<script lang="ts">
    import type { Rune } from "./Models"

    export let rune: Rune;
</script>

<style>
    img {
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
        word-wrap:break-word;
    }
</style>