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
    import { onMount, tick } from "svelte";
    import { getParsedJwt, signoutGoogle } from './Services/Auth';
    import { google_jwt } from './Stores';

    // @ts-ignore
    let googleClientId = GOOGLE_CLIENT_ID;

    let payload: any | null;
    let prompted = false;

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
            callback: handleCredentialResponse,
        });

        google_jwt.subscribe(t => {
            if (t) {
                payload = getParsedJwt(t);
                // No need to prompt if we were already signed in
                prompted = true;

                if (!payload || !payload.name) {
                    google_jwt.set(null);
                }
            } else {
                payload = null;
                renderButton();
                if (!prompted) {
                    google.accounts.id.prompt();
                    prompted = true;
                }
            }
        });        
    }

    function renderButton() {
	    const button = document.getElementById('google-button');
        if (button) {
            google.accounts.id.renderButton(
                button,
                { theme: 'outline', size: 'large' }, // customization attributes
            );
        }
    }

    function handleCredentialResponse(response: google.CredentialResponse){
        google_jwt.set(response.credential);
        payload = getParsedJwt(response.credential);        
    }

    function signout() {
        google.accounts.id.revoke(payload.email, async response => {
            if (response.successful) {
                signoutGoogle();
                // force UI update so that div is available
                await tick();
                renderButton();
            }
        });
    }
</script>