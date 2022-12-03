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

export function getAccessToken() {
    return new Promise((resolve, reject) => {
        if (access_token) {
            return resolve(access_token);
        } else {
            const client = google.accounts.oauth2.initTokenClient({
                client_id: googleClientId,
                scope: "openid",
                callback: (response) => {
                    if (response.access_token) {
                        // console.log(response);
                        access_token = response.access_token;
                        // console.log(access_token);
                        sessionStorage.setItem('GOOGLE_ACCESS_TOKEN', access_token ?? "");
                        resolve(access_token);
                    } else {
                        reject(response?.error);
                    }
                },
            });
            client.requestAccessToken();
        }
    });
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