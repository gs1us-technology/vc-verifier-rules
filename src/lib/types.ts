export type rulesTestResult = {
    verified: boolean,
    rule: string;
}

export type Proof = {
    type: string;
    challenge?: string | undefined;
}

export type CredentialSubject = {
    id: string | URL;
    licenseValue?: string;
    keyAuthorization? : string;
    extendsCredential?: string;
}

// @context: is a complex object that can be an array that contains strings or objects
export interface sharedVerifiable  {
    '@context': (string | any)[];
    type: string[];
    proof: Proof | Proof[];
}

// TODO: Should be able to remove this once libraries are stable
export interface credentialStatus {
    id: string | URL;
    type: string;
    revocationListIndex: string | number;
    revocationListCredential:  string | URL;
}

export interface extVerifiableCredential {
    issuer: string | any;
    issuanceDate: string;
    id: string;
    credentialSubject: CredentialSubject; 
    credentialStatus?: credentialStatus;
}

export interface CredentialPresentation  { 
    verifiableCredential: VerifiableCredential | VerifiableCredential[];
}

export interface extVerifiablePresentation extends CredentialPresentation {
    id?: string;
    holder: string | any;
    verifiableCredential: VerifiableCredential | VerifiableCredential[];
    proof: Proof;
    credential?: VerifiableCredential
}

export type VerifiableCredential = sharedVerifiable & extVerifiableCredential;
export type VerifiablePresentation = sharedVerifiable & extVerifiablePresentation;

export type VerifiablePresentationContainer = {
    presentation: VerifiablePresentation
}


// *****  Validation Rule Checks *****
export type verificationCheck = {
    status: "good" | "bad";
    title: "Proof" | "Activation" | "Expired" | "Revocation" | "GS1CredentialValidation";
}

export type gs1CredentialValidationRule = {
    code: string;
    rule: string;
}

export type errorMessage = {
    name: string;
    message: string;
}

// *****  Verification Library Result Objects *****
export type credentialResults = {
    verified: boolean, 
    credentialId: string,
    credentialValidationRules?: gs1CredentialValidationRule[];
}


export type verificationResult = {
    verified: boolean;
    verifications?: verificationCheck[];
    credentialResults?: credentialResults[];
}



