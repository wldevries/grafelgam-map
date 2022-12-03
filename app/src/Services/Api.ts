import type { Feature } from "geojson";
import { getAccessToken } from "./Auth";

const endpoints = {
    // @ts-ignore
    getBaseAddress: API + '/GetBaseAddress',
    // @ts-ignore
    uploadIcon: API + '/PostIcon',
    // @ts-ignore
    getIcons: API + '/GetIcons',
    // @ts-ignore
    getPlaces: API + '/GetPlaces',
    // @ts-ignore
    getAreas: API + '/GetAreas',
    // @ts-ignore
    getFeatures: API + '/GetFeatures',
    // @ts-ignore
    addFeature: API + '/AddFeature',
    // @ts-ignore
    deleteFeature: API + '/DeleteFeature',
};

async function getHeaders() {
    const headers = new Headers();
    headers.set('Access-Control-Request-Headers', 'authorization,content-type,Access-Control-Allow-Credentials');
    headers.set('Content-Type', 'application/json');
    // @ts-ignore
    headers.set('x-functions-key', API_CODE);

    let bearer = await getAccessToken();
    if (bearer) {
        headers.set("Authorization", `Bearer ${bearer}`);
    }
    return headers;
}


async function withOptions(options: RequestInit) {
    options.headers = await getHeaders();
    options.credentials = 'include';
    options.mode = 'cors';
    options.cache = 'default';
    options.referrerPolicy = "origin";
    console.log(options);
    return options;
}

export class Api {
    static baseAddress : string | undefined;

    public static async getBaseAddress() {
        if (this.baseAddress == undefined) {
            const req = new Request(
                endpoints.getBaseAddress,
                await withOptions({
                    method: "GET",
                 })
            );

            const res = await fetch(req);
            
            const json = await res.json()
            if (json.status == "success"){
                this.baseAddress = json.data;
            }
        }
        return this.baseAddress
    }

    public static async uploadIcon(image: File) {    
        const uploadData = new FormData();
        uploadData.append('file', image, image.name);
        
        // TODO: should we allow adding custom names?
        // uploadData.append('icon', "fakename.png");
            
        const req = new Request(
            endpoints.uploadIcon,
            await withOptions({
                method: 'POST',
                body: uploadData,
            })
        );
        
        const res = await fetch(req);
        
        const json = await res.json()
        if (json.status != "success") {
            alert(`${json.status}: ${json.message}`);
        }
    }

    public static async getIcons(): Promise<{name: string, url: string}[]>  {
        const req = new Request(
            endpoints.getIcons,
            await withOptions({
                method: "GET", 
                headers: await getHeaders(),
            })
        );
        const res = await fetch(req);
        
        const json = await res.json()
        if (json.status == "success"){
            return json.data;
        } else {
            throw json;
        }
    }
    
    public static async getPlaces(): Promise<GeoJSON.FeatureCollection<GeoJSON.Point>> {    
        const req = new Request(
            endpoints.getPlaces,
            await withOptions({
                method: "GET",
            })
        );

        const res = await fetch(req);
        
        const json = await res.json()
        if (json.status == "success"){
            return json.data;
        } else {
            throw json;
        }
    }
    
    public static async getAreas(): Promise<GeoJSON.FeatureCollection<GeoJSON.Polygon>> {    
        const req = new Request(
            endpoints.getAreas,
            await withOptions({
                method: "GET",
            })
        );

        const res = await fetch(req);
        
        const json = await res.json()
        if (json.status == "success"){
            return json.data;
        } else {
            throw json;
        }
    }
    
    public static async getFeatures(): Promise<GeoJSON.FeatureCollection<GeoJSON.Polygon>> {    
        const req = new Request(
            endpoints.getFeatures,
            await withOptions({
                method: "GET",
            })
        );

        const res = await fetch(req);
        
        if (res.ok) {
            const json = await res.json()
            if (json.status == "success"){
                return json.data;
            } else {
                throw json;
            }
        } else {
            throw res;
        }
    }

    public static async addFeature(feature: Feature) {
        const req = new Request(
            endpoints.addFeature,
            await withOptions({
                method: 'POST',
                body: JSON.stringify(feature),
            })
        );

        const res = await fetch(req);
        
        const json = await res.json()
        if (json.status != "success") {
            alert(`${json.status}: ${json.message}`);
        }       
    }

    public static async deleteFeature(featureId: string) {
        const req = new Request(
            endpoints.deleteFeature + '?featureId=' + featureId,
            await withOptions({
                method: 'POST',
            })
        );
        
        const res = await fetch(req);
        
        const json = await res.json()
        if (json.status != "success") {
            alert(`${json.status}: ${json.message}`);
        }       
    }
}
