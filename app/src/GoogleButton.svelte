<div id="google-button"></div>

<script lang="ts">
    import * as google from 'google-one-tap';
    import { onMount } from "svelte";

    // @ts-ignore
    let googleClientId = GOOGLE_CLIENT_ID;

    onMount(() => {
        document.onreadystatechange = () => {
            if (document.readyState === "complete") {                        
                google.accounts.id.initialize({
                    client_id: googleClientId,
                    callback: handleCredentialResponse
                });
                const button = document.getElementById('google-button');
                if (button) {
                    google.accounts.id.renderButton(
                        button,
                        { theme: 'outline', size: 'large' } // customization attributes
                    );
                }
                google.accounts.id.prompt((notification) => {
                    if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                        // try next provider if OneTap is not displayed or skipped
                        console.log(notification);
                    }
                });
            }
        };
    });

    function handleCredentialResponse(obj: google.CredentialResponse){
        console.log(obj);
    }
</script>