import { VerifiableCredential, gs1CredentialValidationRule } from "./types";

// GS1 Credential rule validation result - Contains meta data about the credential being validated and the result of the GS1 Credential Rules Validation 
export type gs1RulesResult = {
    credential?: VerifiableCredential;
    credentialId: string;
    credentialName: string;
    verified: boolean;
    errors: gs1CredentialValidationRule[];
}

// Container Object for returning multiple gs1RulesResult 
export type gs1RulesResultContainer = {
    verified: boolean;
    result: gs1RulesResult[];
}

// GS1 Credential Validation Result
export type gs1CredentialValidationRuleResult = {
    verified: boolean; 
    rule?: gs1CredentialValidationRule;
}

// Function Definition to resolve external credential 
export interface externalCredential {
    (url: string): Promise<VerifiableCredential>;
};

export interface verifyExternalCredential {
    (credential: VerifiableCredential): Promise<gs1RulesResult>;
};

export type subjectId = {
    id?: string;
}

export type subjectSameAs = {
    sameAs?: string;
}

export type LicenseValueMinMax = {
    miniumLength: number;
    maximumLength: number;
}

export type subjectLicenseValue = {
    licenseValue?: string | undefined | null;
    alternativeLicenseValue?: string;
}

export type subjectOrganizationType = {
    "gs1:partyGLN"?: string;
    "gs1:organizationName"?: string;
}

export type subjectOrganization = {
    organization?: subjectOrganizationType;
}

export type subjectProductType = {
    "gs1:brand"?: string;
    "gs1:productDescription"?: string;
}

export type subjectProduct = {
    product?: subjectProductType;
}

export type subjectIdentificationKey = {
    identificationKeyType: string;
}
