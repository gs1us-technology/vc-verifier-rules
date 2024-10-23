import { checkPrefixCredentialLicenseValue } from "./subject/check-credential-license.js";
import { validateExtendedCompanyPrefixCredential } from "./chain/validate-extended-company-prefix.js";
import { validateExtendedLicensePrefix } from "./chain/validate-extended-license-prefix.js";
import { validateExtendedKeyCredential, validateExtendedKeyDataCredential } from "./chain/validate-extended-data-key.js";
import { gs1CredentialValidationRuleResult, subjectLicenseValue } from "../gs1-rules-types.js";
import { credentialChainMetaData } from "../engine/validate-extended-credential.js";

export type rulesEngineManagerConfig = {
    prefixLicense?: {(credentialSubject: subjectLicenseValue):  Promise<gs1CredentialValidationRuleResult>},
    GS1PrefixLicenseCredential?: {(credentialType: string, credentialChain: credentialChainMetaData):  Promise<gs1CredentialValidationRuleResult>},
    GS1CompanyPrefixLicenseCredential?: {(credentialType: string, credentialChain: credentialChainMetaData):  Promise<gs1CredentialValidationRuleResult>},
    KeyCredential?: {(credentialType: string, credentialChain: credentialChainMetaData):  Promise<gs1CredentialValidationRuleResult>},
    KeyDataCredential?: {(credentialType: string, credentialChain: credentialChainMetaData):  Promise<gs1CredentialValidationRuleResult>},
}

// Rules Engine Manager that handles GS1 Credential Rules validation
// Developer Notes: this is defined as dynamic object (any) for flexibility in calling the rules engine 
export const rulesEngineManager: any = {};

rulesEngineManager.prefixLicense = checkPrefixCredentialLicenseValue;
rulesEngineManager.GS1PrefixLicenseCredential = validateExtendedLicensePrefix;
rulesEngineManager.GS1CompanyPrefixLicenseCredential = validateExtendedCompanyPrefixCredential;
rulesEngineManager.KeyCredential  = validateExtendedKeyCredential;
rulesEngineManager.KeyDataCredential  = validateExtendedKeyDataCredential;
