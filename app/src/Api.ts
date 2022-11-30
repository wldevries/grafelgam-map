import type { Feature, Point } from "geojson";

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
    getCustomPlaces: API + '/GetCustomPlaces?code=' + API_CODE,
    // @ts-ignore
    addPlace: API + '/AddPlace?code=' + API_CODE,
    // @ts-ignore
    getAreas: API + '/GetAreas?code=' + API_CODE,
};

export class Api {
    static baseAddress : string | undefined;

    public static async getBaseAddress() {
        if (this.baseAddress == undefined) {
            const res = await fetch(endpoints.getBaseAddress, {
                method: "GET"
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
            body: uploadData
        });
        
        const json = await res.json()
        if (json.status != "success") {
            alert(`${json.status}: ${json.message}`);
        }
    }

    public static async getIcons(): Promise<{name: string, url: string}[]>  {
        const res = await fetch(endpoints.getIcons, {
            method: "GET"
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
            method: "GET"
        });
        
        const json = await res.json()
        if (json.status == "success"){
            return json.data;
        } else {
            throw json;
        }
    }

    public static async getCustomPlaces(): Promise<GeoJSON.FeatureCollection<GeoJSON.Point>> {
        const res = await fetch(endpoints.getCustomPlaces, {
            method: "GET"
        });
        
        const json = await res.json()
        if (json.status == "success"){
            return json.data;
        } else {
            throw json;
        }
    }
    
    public static async addPlace(feature: Feature<Point>) {
        const res = await fetch(endpoints.addPlace, {
            method: 'POST',
            body: JSON.stringify(feature)
        });
        
        const json = await res.json()
        if (json.status != "success") {
            alert(`${json.status}: ${json.message}`);
        }       
    }
    
    public static async getAreas(): Promise<GeoJSON.FeatureCollection<GeoJSON.Polygon>> {    
        const res = await fetch(endpoints.getAreas, {
            method: "GET"
        });
        
        const json = await res.json()
        if (json.status == "success"){
            return json.data;
        } else {
            throw json;
        }
    }

}