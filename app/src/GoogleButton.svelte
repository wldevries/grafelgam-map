{#if payload}
    <button on:click={signout}>
        <!-- if no-referrer is not set it will often times return 403 -->
        <img src={payload?.picture} alt={payload?.name}
                referrerpolicy="no-referrer" class="rounded-circle"/>
        <span>Sign out</span>
    </button>
{:else}
    <div id="google-button"></div>
{/if}

<style>
    #google-button {
        margin-inline-start: 1rem;
    }

    .rounded-circle {
        border-radius: 50%;
        height: 30px;
    }
    
    button {
        all: unset;
        cursor: pointer;        
        user-select: none;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        padding: 0px 20px;
        font-weight: 700;
        color: #987;
        height: 100%;
    }
    button:hover {
        background-color: #404040;
    }
    button:active {
        background-color: #303030;
    }

</style>

<script lang="ts">
    import * as google from 'google-one-tap';
    import { onMount, tick } from "svelte";

    const StorageKey = "GrafelgamJwt";

    // @ts-ignore
    let googleClientId = GOOGLE_CLIENT_ID;

    let jwt: string | null;
    let payload: any | null;

    onMount(() => {
        document.onreadystatechange = () => {
            if (document.readyState === "complete") {                        
                initializeGoogle();
            }
        };
    });

    async function initializeGoogle() {
	    google.accounts.id.initialize({
            client_id: googleClientId,
            callback: handleCredentialResponse
        });

        let jwt = localStorage.getItem(StorageKey);
        if (jwt) {
            payload = getParsedJwt(jwt);
        }
        else {
            renderButton();
            google.accounts.id.prompt();
        }
    }

    function renderButton() {
	    const button = document.getElementById('google-button');
        if (button) {
            google.accounts.id.renderButton(
                button,
                { theme: 'outline', size: 'large' } // customization attributes
            );
        }
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

    function handleCredentialResponse(response: google.CredentialResponse){
        jwt = response.credential;
        payload = getParsedJwt(response.credential);

        localStorage.setItem(StorageKey, jwt);
    }

    function signout(){
        google.accounts.id.revoke(payload.email, async response => {
            if (response.successful) {
                jwt = null;
                payload = null;
                localStorage.removeItem(StorageKey);
                // force UI update so that div is available
                await tick();
                renderButton();
            }
        });
    }
</script>