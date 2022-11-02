
export async function loadLocations() {
    return await fetch("locations.json").then((response) =>
        response.json()
    );
}