import { VerifiableCredential, verificationResult } from "../../types";

export type resolveVerifiableCredentialResult = {
    credential: VerifiableCredential;
    results: verificationResult;
}

export type resolveCredentialResult = {
    inPresentation: boolean;
    credential?: VerifiableCredential;
    error?: string;
}
