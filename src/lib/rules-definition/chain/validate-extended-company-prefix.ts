import { invalidExtendedCredentialMissing, invalidIssuer, invalidLicenseValueFormat } from "../../engine/gs1-credential-errors.js";
import { credentialChainMetaData } from "../../engine/validate-extended-credential";
import { gs1RulesResult } from "../../gs1-rules-types";
import { parseGS1DigitalLink } from "../subject/check-credential-subject-Id-digital-link.js";
import { gs1CompanyPrefixCredentialType } from "../types/gs1-company-prefix-type";
import { gs1KeyCredentialType } from "../types/gs1-key-type";
import { checkCredentialIssuers, checkIssuerToSubjectId, compareLicenseValue } from "./shared-extended.js";

// No Implementation for this rule until GS1 Global Provided update test credentials
export async function validateExtendedCompanyPrefixCredential(credentialType: string, 
    credentialChain: credentialChainMetaData): Promise<gs1RulesResult> {

    const gs1CredentialCheck: gs1RulesResult = { credentialId: credentialChain.credential.id, credentialName: credentialType, verified: true, errors: []};
    const credential = credentialChain.credential;
    const credentialSubject = credential.credentialSubject as gs1KeyCredentialType;
    const extendedCredential = credentialChain.extendedCredentialChain?.credential;

    if (!!!extendedCredential) {
        gs1CredentialCheck.verified = false;
        gs1CredentialCheck.errors.push(invalidExtendedCredentialMissing);
        return gs1CredentialCheck;
    }

    const extendedCredentialSubject = extendedCredential?.credentialSubject as gs1CompanyPrefixCredentialType;

    // Verify Credential Issuer between credential and extended credential
    const issuerResult = await checkIssuerToSubjectId(credential, extendedCredentialSubject);

    // Check Issuer when credential issuer does not match extended credential subject id
    if (!issuerResult.verified) {

        if (!checkCredentialIssuers(credential, extendedCredential)) {
            gs1CredentialCheck.verified = false;
            gs1CredentialCheck.errors.push(invalidIssuer);
        }
    }

    // Verify company prefix partyGLN value with parsed digital link from key credential 
    const keyValue = parseGS1DigitalLink(credentialSubject.id);
    const companyPrefixLicenseValue = extendedCredentialSubject.licenseValue;

    if (!!!keyValue.parsedValue || !compareLicenseValue(keyValue.parsedValue,companyPrefixLicenseValue)) {
        gs1CredentialCheck.verified = false;
        gs1CredentialCheck.errors.push(invalidLicenseValueFormat);
    }

    return gs1CredentialCheck;
}

