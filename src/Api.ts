
let api = "http://localhost:7295";

export async function uploadIcon(image: File) {    
    const uploadData = new FormData();
    uploadData.append('file', image, image.name);
    
    // TODO: should we allow adding custom names?
    // uploadData.append('icon', "fakename.png");
        
    const res = await fetch(api + '/api/PostIcon', {
        method: 'POST',
        body: uploadData
    });
    
    const json = await res.json()
    alert(json.message);
}
