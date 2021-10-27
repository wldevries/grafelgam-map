<script lang="ts">
    import { onMount } from 'svelte';
    import { slide } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
    
    import * as L from 'leaflet';

    interface Location {
        name: string,
        country: string,
        loc: number[]
    }

    export let navmenu_open = false;
    export let locations: Location[] = [];
    export let countries: Set<string> = new Set();
    
    let map: any;
    let locationLayer: any;

    function showmap(location: Location) {
        if (locationLayer != undefined) {
            map.removeLayer(locationLayer);
        }
        map.setView(location.loc, 5);
        navmenu_open = false;
        
        locationLayer = new L.FeatureGroup();

        var marker = L.marker(location.loc)
            .bindPopup(location.name)
            .openPopup();
        locationLayer.addLayer(marker);

        map.addLayer(locationLayer);
    }

    onMount(() => {
        map = L.map("map");
        var options = {
            minZoom: 1,
            maxZoom: 5,
            continuousWorld: false,
            noWrap: true,
        };
        L.tileLayer("tiles/{z}/{x}/{y}.png", options).addTo(map);

        map.setView([0, 0], 3);

        // Debug out for location
        map.on("click", function (ev) {
            var latlng = map.mouseEventToLatLng(ev.originalEvent);
            console.log(latlng.lat + ", " + latlng.lng);
        });

        loadMarkers();

        async function loadMarkers() {
            // using Promise
            locations = await fetch("locations.json")
                .then((response) => response.json());

            locations.sort((a, b) => a.name.localeCompare(b.name));
            
            countries.clear();
            locations.forEach(loc => countries.add(loc.country));

            // Hide markers when zoomed out
            // map.on("zoomend", function () {
            //     if (map.getZoom() < 5) {
            //         map.removeLayer(locationLayer);
            //     } else {
            //         map.addLayer(locationLayer);
            //     }
            // });

            // Zoom to last location
            map.setView(locations[locations.length - 1].loc, 3);
        }
    });
</script>

<main>
    <div class="navbar">
        <button on:click="{() => navmenu_open = !navmenu_open}" class="navtoggle">Locations</button>        
        <h2>Grafelgam</h2>
    </div>
    
    {#if navmenu_open}
    <div class="navmenu" transition:slide="{{delay: 250, duration: 300, easing: quintOut }}">
        {#each Array.from(countries) as country}
        <h3>{country}</h3>
        <ul>
            {#each locations.filter(l => l.country == country) as location}
            <li><button on:click={() => showmap(location)}>
                <span>{location.name}</span>
            </button></li>
            {/each}
        </ul>
        {/each}
    </div>
    {/if}

    <div id="map" />
</main>

<style>
    ul {
        background: #333333;
        margin: 0px;
        padding: 0px;
    }

    li {
        color: #987;
        line-height: 2em;
        list-style-type: none;
    }

    h2 {
        color: #987;
        margin: 0;
        padding: 0;
    }

    h3 {
        margin: 20px 0px 10px 40px;
    }

    .navbar {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        background-color:#333333;
        position:fixed;
        z-index: 1;
        width: 100%;
        height: 65px;
        line-height: 50px;
        top: 0px;
    }

    .navtoggle {
        all: unset;
        color: #987;
        cursor: pointer;
        padding: 2px 40px;
    }

    .navmenu {
        color: #987;
        background-color:#333333;
        position: absolute;
        top: 65px;
        margin: 0;
        padding: 0;
        z-index: 1;
        width: 100%;
        /* margin: 65px 0px 0px 0px; */
    }

    .navmenu button {
        all: unset;
        width: 100%;
        color: #987;
        cursor: pointer;
    }
    .navmenu li:hover {
        background-color: #443322;
    }
    .navmenu span {
        margin: 0px 45px;
    }

    #map {
        position: fixed;
        background: #EEE;
        z-index: 0;
        top: 65px;
        left: 0px;
        right: 0px;
        bottom: 0px;
    }

    main {
        height: 100%;
    }
</style>
