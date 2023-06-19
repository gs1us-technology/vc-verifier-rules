import { invalidIdentityKeyTypeValue } from "../../engine/gs1-credential-errors.js";
import { gs1CredentialValidationRuleResult, subjectIdentificationKey } from "../../gs1-rules-types";

// Check the License Value rule validation based on GS1 Credential Data Model Rules
// Ensure the identification Key Type value is either GTIN or GLN
export async function checkIdentityKeyTypeValue(credentialSubject: subjectIdentificationKey): Promise<gs1CredentialValidationRuleResult> {

    const value = credentialSubject.identificationKeyType;

    if (value !== "GTIN" && value !== "GLN") {
        return {verified: false, rule: invalidIdentityKeyTypeValue};
    } 

    return {verified: true};
}

