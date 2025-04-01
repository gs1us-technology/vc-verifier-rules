import { invalidExtendedCredentialMissing, invalidIssueForPrefixLicense, invalidLicenseValueFormat, invalidLicenseValueStartPrefix } from "../../engine/gs1-credential-errors.js";
import { credentialChainMetaData } from "../../engine/validate-extended-credential.js";
import { gs1CredentialValidationRuleResult, subjectLicenseValue } from "../../gs1-rules-types.js";
import { gs1RulesResult, VerifiableCredential } from "../../types.js";
import { checkIssuerToSubjectId, checkIssuerToSubjectId_schema, compareLicenseValue, getCredentialIssuer } from "./shared-extended.js";

// License Prefix Credential Must be issued by GS1 Global
const GS1_GLOBAL_DID = "did:web:id.gs1.org";

// Compare company prefix license to prefix license value to validate the license value starts with prefix license value
// Developer Notes: CredentialSubject is defined as any because the credential subject is dynamic based on JSON-LD for a credential
export async function compareLicenseLengthsToExtended(credentialSubject: subjectLicenseValue | undefined, extendedCredentialSubject: subjectLicenseValue | undefined): Promise<gs1CredentialValidationRuleResult> {

    const licenseValue = credentialSubject?.licenseValue;
    const extendedLicenseValue = extendedCredentialSubject?.licenseValue;

    if (!licenseValue || !extendedLicenseValue) {
        return {verified: false, rule: invalidLicenseValueFormat};
    }

    // Compare License Field Lengths
    if (compareLicenseValue(licenseValue, extendedLicenseValue)) {
        if (licenseValue.length <= extendedLicenseValue.length) {
            return {verified: false, rule: invalidLicenseValueStartPrefix};
        }
    } else {
        return {verified: false, rule: invalidLicenseValueFormat};
    }
    return {verified: true};
}

export function compareLicenseLengthsToExtended_schema(credentialSubject: subjectLicenseValue | undefined, extendedCredentialSubject: subjectLicenseValue | undefined): gs1CredentialValidationRuleResult {

    const licenseValue = credentialSubject?.licenseValue;
    const extendedLicenseValue = extendedCredentialSubject?.licenseValue;

    if (!licenseValue || !extendedLicenseValue) {
        return {verified: false, rule: invalidLicenseValueFormat};
    }

    // Compare License Field Lengths
    if (compareLicenseValue(licenseValue, extendedLicenseValue)) {
        if (licenseValue.length <= extendedLicenseValue.length) {
            return {verified: false, rule: invalidLicenseValueStartPrefix};
        }
    } else {
        return {verified: false, rule: invalidLicenseValueFormat};
    }
    return {verified: true};
}

// Validate the extended credentials for Prefix License Credential
export async function validateExtendedLicensePrefix(credentialType: string, 
    credentialChain: credentialChainMetaData): Promise<gs1RulesResult> {

    const gs1CredentialCheck: gs1RulesResult = { credentialId: credentialChain.credential.id, credentialName: credentialType, verified: true, errors: []};

    const credential = credentialChain.credential;
    const credentialSubject = credential.credentialSubject;
    const extendedCredential = credentialChain.extendedCredentialChain?.credential;
    const extendedCredentialSubject = extendedCredential?.credentialSubject;

    if (!extendedCredential) {
        gs1CredentialCheck.verified = false;
        gs1CredentialCheck.errors.push(invalidExtendedCredentialMissing);
        return gs1CredentialCheck;
    }

    // Verify Prefix License Credential Issuer is GS1 Global
    const extendedCredentialIssuer = getCredentialIssuer(extendedCredential);
    if (extendedCredentialIssuer !== GS1_GLOBAL_DID) {
        gs1CredentialCheck.verified = false;
        gs1CredentialCheck.errors.push(invalidIssueForPrefixLicense);
        return gs1CredentialCheck;
    }

    const issuerResult = await checkIssuerToSubjectId(credential, extendedCredentialSubject);
    if (!issuerResult.verified && issuerResult.rule) {
        gs1CredentialCheck.errors.push(issuerResult.rule);
    }

    const compareLicenseLResult = await compareLicenseLengthsToExtended(credentialSubject, extendedCredentialSubject);
    if (!compareLicenseLResult.verified && compareLicenseLResult.rule) {
        gs1CredentialCheck.errors.push(compareLicenseLResult.rule);
    }

    if (gs1CredentialCheck.errors.length > 0) {
        gs1CredentialCheck.verified = false;
    }

    return gs1CredentialCheck;
}

// Validate the extended credentials for Prefix License Credential
export function validateExtendedLicensePrefix_JsonSchema(credentialType: string, 
    credentialChain: credentialChainMetaData): gs1RulesResult {

    const gs1CredentialCheck: gs1RulesResult = { credentialId: credentialChain.credential.id, credentialName: credentialType, verified: true, errors: []};

    const credential = credentialChain.credential;
    const credentialSubject = credential.credentialSubject;
    const extendedCredential = credentialChain.extendedCredentialChain?.credential;
    const extendedCredentialSubject = extendedCredential?.credentialSubject;

    if (!extendedCredential) {
        gs1CredentialCheck.verified = false;
        gs1CredentialCheck.errors.push(invalidExtendedCredentialMissing);
        return gs1CredentialCheck;
    }

    // Verify Prefix License Credential Issuer is GS1 Global
    const extendedCredentialIssuer = getCredentialIssuer(extendedCredential);
    if (extendedCredentialIssuer !== GS1_GLOBAL_DID) {
        gs1CredentialCheck.verified = false;
        gs1CredentialCheck.errors.push(invalidIssueForPrefixLicense);
        return gs1CredentialCheck;
    }

    const issuerResult = checkIssuerToSubjectId_schema(credential, extendedCredentialSubject);
    if (!issuerResult.verified && issuerResult.rule) {
        gs1CredentialCheck.errors.push(issuerResult.rule);
    }

    const compareLicenseLResult = compareLicenseLengthsToExtended_schema(credentialSubject, extendedCredentialSubject);
    if (!compareLicenseLResult.verified && compareLicenseLResult.rule) {
        gs1CredentialCheck.errors.push(compareLicenseLResult.rule);
    }

    if (gs1CredentialCheck.errors.length > 0) {
        gs1CredentialCheck.verified = false;
    }

    return gs1CredentialCheck;
}


// Validate the extended credentials for Prefix License Credential
export function validatePrefixRootOfTrust_JsonSchema(credentialType: string, credential: VerifiableCredential): gs1RulesResult {

    const gs1CredentialCheck: gs1RulesResult = { credentialId: credential.id, credentialName: credentialType, verified: true, errors: []};

    // Verify Prefix License Credential Issuer is GS1 Global
    const extendedCredentialIssuer = getCredentialIssuer(credential);
    if (extendedCredentialIssuer !== GS1_GLOBAL_DID) {
        gs1CredentialCheck.verified = false;
        gs1CredentialCheck.errors.push(invalidIssueForPrefixLicense);
        return gs1CredentialCheck;
    }
        
    return gs1CredentialCheck;
}