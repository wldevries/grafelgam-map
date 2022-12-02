import { Writable, writable } from 'svelte/store';

export const modal = writable(null);
export const windowStyle = writable({});

export const google_jwt: Writable<string | null> = writable();
