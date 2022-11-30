import { Api } from "./Api";

export class MapIcon {
    public name: string;
    public uri: string;

    constructor(name: string, uri: string) {
        this.name = name;
        this.uri = uri;        
    }
}

export class IconStore{
    public static async loadIcons(): Promise<MapIcon[]> {
        const icons = await Api.getIcons();
        return icons.map((icon) => {
            return new MapIcon(icon.name, icon.url);
        });
    }
    
    public static async nameToIcon(name: string): Promise<MapIcon | undefined> {
        return name == undefined || name.trim() == ""
        ? undefined
        : new MapIcon(name, await Api.getBaseAddress() + '/icons/' + name);
    }
}