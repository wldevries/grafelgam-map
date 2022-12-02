import { google_jwt } from "../Stores";
import { ApiFeatureStore } from "./ApiFeatureStore"
import { LocalFeatureStore } from "./LocalFeatureStore"

const localFeatureStore = new LocalFeatureStore();
const apiFeatureStore = new ApiFeatureStore();

let impl: FeatureStore = localFeatureStore;

google_jwt.subscribe(t => {
    if (t) {
        impl = apiFeatureStore;
    } else {
        impl = localFeatureStore;
    }
});

export const featureStore = {
    Deleted: impl.Deleted,
    Changed: impl.Changed,
    load: impl.load.bind(impl),
    update: impl.update.bind(impl),
    delete: impl.delete.bind(impl),
};
