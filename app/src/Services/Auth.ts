import { google_jwt } from "../Stores";

// @ts-ignore
let googleClientId = GOOGLE_CLIENT_ID;

const StorageKey = "GrafelgamJwt";

let access_token: string | null;

function checkStorage() {
    let value = localStorage.getItem(StorageKey);
    if (value) {
        google_jwt.set(value);
        access_token = sessionStorage.getItem('GOOGLE_ACCESS_TOKEN')
    }
}

checkStorage();

google_jwt.subscribe(t => {
    if (t) {        
        localStorage.setItem(StorageKey, t);
    } else {
        localStorage.removeItem(StorageKey);
        access_token = null;
    }
});

export async function getAccessToken(): Promise<string> {
    if (access_token) {
        return access_token;
    }

    const idToken = localStorage.getItem(StorageKey);
    const body =  JSON.stringify({
        'id_token': idToken || '',
    });
    // @ts-ignore
    const uri = API + '/.auth/login/google';
    const res = await fetch(uri,{
        method: "POST",
        body: body,
    });
    const json = await res.json();
    if (json && json.authenticationToken) {
        access_token = json.authenticationToken;
        return json.authenticationToken
    }
    throw res.status;
}

export function signoutGoogle() {
    google_jwt.set(null);
    localStorage.removeItem(StorageKey);
    sessionStorage.removeItem('GOOGLE_ACCESS_TOKEN');
}

/**
 * Returns a JS object representation of a Javascript Web Token from its common encoded
 * string form.
 *
 * @template T the expected shape of the parsed token
 * @param {string} token a Javascript Web Token in base64 encoded, `.` separated form
 * @returns {(T | undefined)} an object-representation of the token
 * or undefined if parsing failed
 */
export function getParsedJwt<T extends object = { [k: string]: string | number }>(
        token: string,
    ): T | undefined {
    try {
        return JSON.parse(window.atob(token.split('.')[1]))
    } catch {
        return undefined
    }
}