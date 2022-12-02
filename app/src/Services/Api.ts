import type { Feature } from "geojson";
import { getAccessToken } from "./Auth";

const endpoints = {
    // @ts-ignore
    getBaseAddress: API + '/GetBaseAddress?code=' + API_CODE,
    // @ts-ignore
    uploadIcon: API + '/PostIcon?code=' + API_CODE,
    // @ts-ignore
    getIcons: API + '/GetIcons?code=' + API_CODE,
    // @ts-ignore
    getPlaces: API + '/GetPlaces?code=' + API_CODE,
    // @ts-ignore
    getAreas: API + '/GetAreas?code=' + API_CODE,
    // @ts-ignore
    getFeatures: API + '/GetFeatures?code=' + API_CODE,
    // @ts-ignore
    addFeature: API + '/AddFeature?code=' + API_CODE,
    // @ts-ignore
    deleteFeature: API + '/DeleteFeature?code=' + API_CODE,
};

async function getHeaders() {
    const headers = new Headers();
    headers.set('Access-Control-Request-Headers', 'authorization,content-type');
    headers.set('Content-Type', 'application/json');

    let bearer = await getAccessToken();
    if (bearer) {
        headers.set("Authorization", `Bearer ${bearer}`);
    }
    return headers;
}

export class Api {
    static baseAddress : string | undefined;

    public static async getBaseAddress() {
        if (this.baseAddress == undefined) {
            const res = await fetch(endpoints.getBaseAddress, {
                method: "GET",
                headers: await getHeaders(),
            });
            
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
            
        const res = await fetch(endpoints.uploadIcon, {
            method: 'POST',
            headers: await getHeaders(),
            body: uploadData,
        });
        
        const json = await res.json()
        if (json.status != "success") {
            alert(`${json.status}: ${json.message}`);
        }
    }

    public static async getIcons(): Promise<{name: string, url: string}[]>  {
        const res = await fetch(endpoints.getIcons, {
            method: "GET", 
            headers: await getHeaders(),
        });
        
        const json = await res.json()
        if (json.status == "success"){
            return json.data;
        } else {
            throw json;
        }
    }
    
    public static async getPlaces(): Promise<GeoJSON.FeatureCollection<GeoJSON.Point>> {    
        const res = await fetch(endpoints.getPlaces, {
            method: "GET",
            headers: await getHeaders(),
        });
        
        const json = await res.json()
        if (json.status == "success"){
            return json.data;
        } else {
            throw json;
        }
    }
    
    public static async getAreas(): Promise<GeoJSON.FeatureCollection<GeoJSON.Polygon>> {    
        const res = await fetch(endpoints.getAreas, {
            method: "GET",
            headers: await getHeaders(),
        });
        
        const json = await res.json()
        if (json.status == "success"){
            return json.data;
        } else {
            throw json;
        }
    }
    
    public static async getFeatures(): Promise<GeoJSON.FeatureCollection<GeoJSON.Polygon>> {    
        const myheaders = await getHeaders();
        console.log(myheaders);
        const res = await fetch(endpoints.getFeatures, {
            method: "GET",
            headers: myheaders,
            // mode: "no-cors",
            // referrerPolicy: 'no-referrer',
            // credentials: 'include',
        });
        
        if (res.ok) {
            const json = await res.json()
            if (json.status == "success"){
                return json.data;
            } else {
                console.log(res);
                console.log(json);
                throw json;
            }
        } else {
            throw res;
        }
    }

    public static async addFeature(feature: Feature) {
        const res = await fetch(endpoints.addFeature, {
            method: 'POST',
            headers: await getHeaders(),
            body: JSON.stringify(feature),
        });
        
        const json = await res.json()
        if (json.status != "success") {
            alert(`${json.status}: ${json.message}`);
        }       
    }

    public static async deleteFeature(featureId: string) {
        const res = await fetch(endpoints.deleteFeature + '&featureId=' + featureId, {
            method: 'POST',
            headers: await getHeaders(),
        });
        
        const json = await res.json()
        if (json.status != "success") {
            alert(`${json.status}: ${json.message}`);
        }       
    }
}