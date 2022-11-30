
export async function loadAreasWeb() : Promise<GeoJSON.Feature<GeoJSON.Polygon>[]> {
    const areaJson = await fetch("areas2.json");
    return await areaJson.json();
}

export async function loadPlacesWeb() : Promise<GeoJSON.Feature<GeoJSON.Point>[]> {
    const locationJson = await fetch("locations2.json");
    return await locationJson.json();
}    
