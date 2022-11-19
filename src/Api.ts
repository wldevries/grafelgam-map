
const api = "http://localhost:7295/api";

export class Api {
    static baseAddress : string | undefined;

    public static async getBaseAddress() {
        if (this.baseAddress == undefined) {
            const res = await fetch(api + '/GetBaseAddress', {
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
            
        const res = await fetch(api + '/PostIcon', {
            method: 'POST',
            body: uploadData
        });
        
        const json = await res.json()
        if (json.status != "success") {
            alert(`${json.status}: ${json.message}`);
        }
    }

    public static async getIcons() {    
        const res = await fetch(api + '/GetIcons', {
            method: "GET"
        });
        
        const json = await res.json()
        if (json.status == "success"){
            return json.data;
        } else {
            alert(`${json.status}: ${json.message}`);
        }
    }
}