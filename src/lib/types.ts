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
    CredentialPresentation?: CredentialPresentation
}

// @context: is a complex object that can be an array that contains strings or dynamic objects
export interface sharedVerifiable  {
    '@context'?: object | string[];
    type?: string[];
    proof?: Proof | Proof[];
}

export interface verifiableJwt {
    '@context'?: object | string[];
    id: string;
    type?: string[];
}


export interface credentialIssuer {
    id: string;
    type?: string;
}

export interface extVerifiableCredential {
    issuer: string | credentialIssuer;
    issuanceDate: string;
    id: string;
    name?: string;
    credentialSubject: CredentialSubject; 
}

export interface CredentialPresentation  { 
    verifiableCredential: VerifiableCredential | VerifiableCredential[];
}


export interface extVerifiablePresentation extends CredentialPresentation {
    id?: string;
    holder: string | object;
    verifiableCredential: VerifiableCredential | VerifiableCredential[];
    proof?: Proof;
    credential?: VerifiableCredential
}

export type VerifiableCredential = sharedVerifiable & extVerifiableCredential;
export type VerifiablePresentation = sharedVerifiable & extVerifiablePresentation;

export type VerifiablePresentationContainer = {
    presentation: VerifiablePresentation
}

// GS1 Validation Rule Checks Status
export type verificationCheck = {
    status: "good" | "bad";
    title: "Proof" | "Activation" | "Expired" | "Revocation" | "JsonSchema" | "GS1CredentialValidation";
}

// Code and Rule Associated with GS1 Validation Rules - See lib/engine/gs1-credential-errors.ts for list of codes
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
    credentialName: string;
    credentialValidationRules?: gs1CredentialValidationRule[];
    error?: string[];
}

// GS1 Credential rule validation result - Contains meta data about the credential being validated and the result of the GS1 Credential Rules Validation 
export type gs1RulesResult = {
    credential?: VerifiableCredential;
    credentialId: string;
    credentialName: string;
    verified: boolean;
    errors: gs1CredentialValidationRule[];
    resolvedCredential?: gs1RulesResult;
}

// Container Object for returning multiple gs1RulesResult 
export type gs1RulesResultContainer = {
    verified: boolean;
    result: gs1RulesResult[];
}

export type verificationResult = {
    verified: boolean;
    verifications?: verificationCheck[];
    credentialResults?: credentialResults[];
}

// Function Definition to resolve external credential 
export interface externalCredential {
    (url: string): Promise<VerifiableCredential>;
}

export interface verifyExternalCredential {
    (credential: VerifiableCredential): Promise<gs1RulesResult>;
}

export interface jsonSchemaLoader {
    (schemaId: string): Uint8Array;
}

export type gs1ValidatorDocumentResolver = {
    externalCredentialLoader: externalCredential, 
    externalCredentialVerification: verifyExternalCredential,
    externalJsonSchemaLoader: jsonSchemaLoader
}

export type gs1ValidatorRequest = {
    fullJsonSchemaValidationOn: boolean
    gs1DocumentResolver: gs1ValidatorDocumentResolver
}

export type JsonSchemaMetaModelSubject = {
    credentialSubject: object
}

export type JsonSchemaMetaModel = {
    $id: string;
    properties: JsonSchemaMetaModelSubject;
}

export type gs1CredentialTypes =
{
    name: string;
    schemaId: string;
}

export type gs1RulesSchemaMetaModel = unknown