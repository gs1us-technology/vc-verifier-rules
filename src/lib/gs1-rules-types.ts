import { gs1CredentialValidationRule } from "./types";


// GS1 Credential Validation Result
export type gs1CredentialValidationRuleResult = {
    verified: boolean; 
    rule?: gs1CredentialValidationRule;
}

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
