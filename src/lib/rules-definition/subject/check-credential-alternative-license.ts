import { invalidAlternativeLicenseNotCompatible, invalidAlternativeLicenseNotSupported, invalidAlternativeLicenseValue, invalidLicenseValueFormat } from "../../engine/gs1-credential-errors.js";
import { gs1CredentialValidationRuleResult, subjectLicenseValue } from "../../gs1-rules-types.js";

// Check the Alternative License Value rule validation based on GS1 Credential Data Model Rules
// Rules:
// - Alternative License value is only required when license value starts with '0'
// - Alternative License value must be the same as the license value with the leading '0' removed
// - When the license value does not start with '0' then the alternative license value must be null
// Developer Notes: credentialSubject is defined as any because the credential subject is dynamic based on JSON-LD for a credential
export async function checkCredentialAlternativeLicenseValue(credentialSubject: subjectLicenseValue): Promise<gs1CredentialValidationRuleResult> {

    const value = credentialSubject.licenseValue;
    const altValue = credentialSubject.alternativeLicenseValue;

    if (!!!value ) {
        return {verified: false, rule: invalidLicenseValueFormat};
    }

    if (value.startsWith('0')) {
        if (!!!altValue) {
            return {verified: false, rule: invalidAlternativeLicenseValue};
        }

        if (value !== '0' +  altValue)  {
            return {verified: false, rule: invalidAlternativeLicenseNotCompatible};
        }
    } else {
        if (altValue !== undefined) {
            return {verified: false, rule: invalidAlternativeLicenseNotSupported};
        }
    }
  
    return {verified: true};
}

export async function checkCredentialIdentityKeyAlternativeLicenseValue(credentialSubject: any): Promise<gs1CredentialValidationRuleResult> {

    if (credentialSubject.licenseValue === null) {
        return {verified: false, rule: invalidLicenseValueFormat};
    }

    if (credentialSubject.alternativeLicenseValue === null) {
        return {verified: false, rule: invalidLicenseValueFormat};
    }

    var primaryLicense = credentialSubject.licenseValue.substring(0, credentialSubject.licenseValue.length - 1);
    primaryLicense = primaryLicense.padStart(credentialSubject.alternativeLicenseValue.length, '0');

    // Review logic with PM
    // Primary License   = 084141555550 - drop last digit and then pad with 0 to same length as alt
    // Alterante License = 008414155555
    // should be equal:  8414155555
    if (primaryLicense !== credentialSubject.alternativeLicenseValue)  {
        return {verified: false, rule: invalidAlternativeLicenseNotCompatible};
    }
  
    return {verified: true};
}