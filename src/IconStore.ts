export class MapIcon {
    public name: string;
    public uri: string;

    constructor(name: string, uri: string) {
        this.name = name;
        this.uri = uri;        
    }
}

export function loadIcons(): MapIcon[] {
    const names = [
        "castle.png",
        "castle(1).png",
        "castle(2).png",
        "castle(3).png",
        "castle(4).png",
        "castle(5).png",
        "castle(6).png",
        "gate.png",
        "house.png",
        "village.png",
        "tower.png",
        "stump-house.png",
    ]
    return names.map(n => new MapIcon(n, 'icons/' + n));
}