
const StorageKey = "customLocations;"

export async function loadLocations() : Promise<MapLocation[]> {
    let locations = await (await fetch("locations.json")).json();

    let customLocations = loadCustomLocations();

    return locations.concat(customLocations);
}

export function addLocation(loc: CustomMapLocation) {
    let customLocations: CustomMapLocation[] = loadCustomLocations();
    
    let matchIndex = customLocations.findIndex(item => item.id == loc.id);
    if (matchIndex == -1) {
        customLocations.push(loc);
    }
    else {
        customLocations[matchIndex] = loc;
    }

    localStorage.setItem(StorageKey, JSON.stringify(customLocations));
}

function loadCustomLocations() {
    let customLocations: CustomMapLocation[];
    let locsJson = localStorage.getItem(StorageKey);
    if (locsJson == undefined || locsJson == "") {
        customLocations = [];
    }
    else {
        // TODO: do type checking
        customLocations = JSON.parse(locsJson);
    }
    return customLocations;
}
