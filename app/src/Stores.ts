import { writable } from 'svelte/store';

export const modal = writable(null);
export const windowStyle = writable({});

import { ApiFeatureStore } from "./Services/ApiFeatureStore"
export const featureStore: FeatureStore = new ApiFeatureStore();

// import { LocalFeatureStore } from "./Services/LocalFeatureStore"
// export const featureStore = new LocalFeatureStore();
