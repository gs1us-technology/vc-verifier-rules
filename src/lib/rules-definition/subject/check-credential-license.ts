import { invalidLicenseValueFormat } from "../../engine/gs1-credential-errors.js";
import { LicenseValueMinMax, gs1CredentialValidationRuleResult, subjectLicenseValue } from "../../gs1-rules-types.js";

// Check the License Value rule validation based on GS1 Credential Data Model Rules
// Rules:
// 1. The License Value must be numeric
// 2. The License Value must be between 3 and 14 characters in length
// Developer Notes: credentialSubject is defined as any because the credential subject is dynamic based on JSON-LD for a credential
export async function checkCredentialLicenseValue(credentialSubject: subjectLicenseValue, licenseLength: LicenseValueMinMax = { miniumLength: 3, maximumLength: 14 }): Promise<gs1CredentialValidationRuleResult> {

    if (!credentialSubject?.licenseValue) {
        return {verified: false, rule: invalidLicenseValueFormat};
    }

    const value = credentialSubject.licenseValue;

    if (isNaN(+value)) {
        return {verified: false, rule: invalidLicenseValueFormat};
    }

    if (value.length < licenseLength.miniumLength || value.length > licenseLength.maximumLength) {
        return {verified: false, rule: invalidLicenseValueFormat};
    } 

    return {verified: true};
}

export async function checkPrefixCredentialLicenseValue(credentialSubject: subjectLicenseValue): Promise<gs1CredentialValidationRuleResult> {
    return checkCredentialLicenseValue(credentialSubject,  { miniumLength: 2, maximumLength: 4 })
}