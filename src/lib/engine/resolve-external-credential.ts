import { resolveCredentialResult } from "../rules-definition/types/gs1-credential-type.js";
import { CredentialPresentation, VerifiableCredential, externalCredential } from "../types.js";

// Flag to show/hide errors when external credential can not be resolved
const LOG_EXTERNAL_CREDENTIALS_ERRORS = false;

// Resolve External credential requested by the GS1 Credential Rules Engine
// - First Step is to check if the external credential is in the provided presentation
// - If not, then the external credential is resolved via the externalCredentialLoader callback
// - If both options fail an error is returned to the caller
export async function resolveExternalCredential(externalCredentialLoader: externalCredential, verifiablePresentation:  CredentialPresentation, url?: string): Promise<resolveCredentialResult> {

    try {

        // Check if external credential is in the provided presentation
        if (verifiablePresentation) {
            const presentationVerifiableCredential = verifiablePresentation.verifiableCredential;
            if (Array.isArray(presentationVerifiableCredential)) {
                const credential = presentationVerifiableCredential.find( (q: VerifiableCredential) => q.id === url);
                if (credential !== undefined) {
                    return { credential: credential, inPresentation : true, };
                }
            } else {
                if (presentationVerifiableCredential.id === url) {
                    return { credential: presentationVerifiableCredential, inPresentation : true };
                }
            }
        }
        
        // Resolve the external credential via callback 
        if (!url) {
            throw new Error(`External Credential "${url}" can not be resolved.`);
        }
        const externalResult = await externalCredentialLoader(url);
        return { credential: externalResult, inPresentation : false };

    } catch(e) {
        if (LOG_EXTERNAL_CREDENTIALS_ERRORS) {
            console.log(e);
        }
        
        return { credential: undefined, inPresentation : false, error:  `External Credential "${url}" can not be resolved.`};
    }

}