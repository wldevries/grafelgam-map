/**
 * Helper method to type check a plain Feature to a point Feature
 */
export function featureIsPlace(obj: GeoJSON.Feature): obj is GeoJSON.Feature<GeoJSON.Point> {
    // 👇️ check for type property
    return 'type' in obj && obj.geometry.type === 'Point';
}

/**
 * Helper method to type check a plain Feature to a polygon Feature
 */
export function featureIsArea(obj: GeoJSON.Feature): obj is GeoJSON.Feature<GeoJSON.Polygon> {
    // 👇️ check for type property
    return 'type' in obj && obj.geometry.type === 'Polygon';
}
