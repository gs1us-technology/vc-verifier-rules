import { invalidIssueSubject } from "../../engine/gs1-credential-errors.js";
import { gs1CredentialValidationRuleResult, subjectId } from "../../gs1-rules-types.js";
import { CredentialSubject, VerifiableCredential } from "../../types.js";

export type credentialChainIssuers = {
    dataCredential?: VerifiableCredential;
    keyCredential?: VerifiableCredential;
    companyPrefix?: VerifiableCredential;
}

// Return Issue ID (DID) for a verifiable credential.
// Will Return the Issuer if it is a string or the Issuer ID if it is an object
export function getCredentialIssuer(credential: VerifiableCredential) : string {

    // When credential is not defined return empty string for issuer
    if (!!!credential) {
        return "";
    }

    return typeof credential.issuer === "string" ? credential.issuer : credential.issuer.id;
 }

// Extended Credential Validation Rules
// Rules:
// - Validate Issuer of credential matches the Subject ID of Extended Credential
export async function checkIssuerToSubjectId(credential: VerifiableCredential, extendedCredentialSubject: CredentialSubject | undefined): Promise<gs1CredentialValidationRuleResult> {

    // Compare Issuer and Subject ID
    const credentialIssuer = getCredentialIssuer(credential);
    if (credentialIssuer !== extendedCredentialSubject?.id) {
        return {verified: false, rule: invalidIssueSubject};
    }  

    return {verified: true};
}

// Check the Issuers of the credentials in the chain to ensure they are valid
// Compare Issuers of Organization Data Credential and it's chain.
// The Organization Data Credential Issuer must match the Key Credential Issuer or the Company Prefix Credential Subject Id
export function checkCredentialChainIssuers(credentialToCheck: credentialChainIssuers) : boolean {

    if (!!!credentialToCheck) {
        throw new Error("Credential Chain Issuers are not defined.");
    }

    if (!!!credentialToCheck.dataCredential || !!!credentialToCheck.keyCredential || !!!credentialToCheck.companyPrefix) {
        return false;
    }

    const organizationCredentialIssuer = getCredentialIssuer(credentialToCheck.dataCredential);
    const keyCredentialIssuer = getCredentialIssuer(credentialToCheck.keyCredential);
    const companyPrefixCredentialIssuer = getCredentialIssuer(credentialToCheck.companyPrefix);
    const companyPrefixSubjectID = credentialToCheck.companyPrefix.credentialSubject.id;

    if (!!!organizationCredentialIssuer || !!!keyCredentialIssuer || !!!companyPrefixCredentialIssuer || !!!companyPrefixSubjectID) {
        return false;
    }
    
    if (organizationCredentialIssuer === keyCredentialIssuer) {
        if (keyCredentialIssuer !== companyPrefixCredentialIssuer) {
            if (keyCredentialIssuer !== companyPrefixSubjectID) {
                return false;
            }
        }
    } else {
        return false;
    }

    return true;
}

// Comparer the issuers between two Verifiable Credentials
export function checkCredentialIssuers(credential: VerifiableCredential, credentialToCompare: VerifiableCredential): boolean {

    const credentialIssuer = getCredentialIssuer(credential);
    const credentialToCompareIssuer = getCredentialIssuer(credentialToCompare);

    if (credentialIssuer !== credentialToCompareIssuer) {
        return false;
    }

    return true;
}


// Compare license value between credentials by padding zeros to the start and comparing the values
export function compareLicenseValue(licenseValue: string, prefixValue: string) : boolean {
    const  prefixPosition = licenseValue.indexOf(prefixValue);
    return licenseValue?.startsWith(prefixValue, prefixPosition);
}