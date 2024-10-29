import { dataMismatchBetweenDataKeyCredential, dataMissingToValidateCredentialChain, invalidIssuer } from "../../engine/gs1-credential-errors.js";
import { credentialChainMetaData } from "../../engine/validate-extended-credential";
import { CredentialSubject, gs1RulesResult, VerifiableCredential } from "../../types.js";
import { parseGS1DigitalLink } from "../subject/check-credential-subject-Id-digital-link.js";
import { gs1Organization } from "../types/gs1-shared-types.js";
import  { checkCredentialChainIssuers } from "./shared-extended.js";

// Types for Data Credential Chain Validation
export type credentialChainIssuers = {
    dataCredential: VerifiableCredential;
    keyCredential: VerifiableCredential;
    companyPrefix: VerifiableCredential;
}

export type credentialChainContext = {
    credential: VerifiableCredential;
    extendedCredentialChain?: credentialChainMetaData;
}

export type credentialSubjectKey = {
    id: string;
}

export type credentialSubjectData = {
    id: string;
    sameAs?: string
    organization?: gs1Organization;
}



export type credentialSubjectOrganization = {
    id: string;
    organization: gs1Organization;
    sameAs: string
}


export type credentialSubjectBasic = {
    id: string;
}

//     dataCredentialSubject?: credentialSubjectData | credentialSubjectOrganization;
export type credentialChainDataKey = {
    isValid: boolean;
    dataCredential?: VerifiableCredential;
    dataCredentialSubject?: CredentialSubject;
    KeyCredential?: credentialChainContext;
    keyCredentialSubject?: CredentialSubject;
    companyPrefixCredential?: credentialChainContext;
    companyPrefixCredentialSubject?: CredentialSubject;
}

// Common Helper Methods for Data Credential Chain Validation

// Setup Data Credential Chain for validation
// Developer Note: Future handle different parent types for key credential
function setupDataCredentialChain(credentialChain: credentialChainMetaData) : credentialChainDataKey {

    const dataCredentialChain : credentialChainDataKey = { 
        isValid: true,
        dataCredential: credentialChain.credential,
        dataCredentialSubject: credentialChain.credential.credentialSubject,
        KeyCredential: credentialChain.extendedCredentialChain,
        keyCredentialSubject: credentialChain.extendedCredentialChain ? credentialChain.extendedCredentialChain?.credential?.credentialSubject : undefined
    }

    dataCredentialChain.companyPrefixCredential = dataCredentialChain.KeyCredential?.extendedCredentialChain;
    dataCredentialChain.companyPrefixCredentialSubject = dataCredentialChain.companyPrefixCredential?.credential?.credentialSubject;

    // Return Missing Data Error if any of the expected credential subjects are missing from the chain
    if (!dataCredentialChain.dataCredentialSubject || !dataCredentialChain.keyCredentialSubject || !dataCredentialChain.companyPrefixCredentialSubject) {
        dataCredentialChain.isValid = false;
    }

    return dataCredentialChain;
}

// Validate Data Credential against Key Credential Digital Link subject fields
// When valueToCheck is not empty do an additional check against the parsed value of the GS1 Digital Link
function validateDataToKeyCredential(keyCredentialSubject: CredentialSubject | undefined, dataCredentialSubject: any | undefined, valueToCheck: string = "") : boolean {

    if (keyCredentialSubject === undefined) {
        throw new Error("Key Credential Subject is not defined.");
    }

    if (dataCredentialSubject === undefined) {
        throw new Error("Data Credential Subject is not defined.");
    }

    // Check Data Credential Against Key
    const keyDigitalLink = parseGS1DigitalLink(keyCredentialSubject.id);
    const dataCredentialId = dataCredentialSubject.sameAs ? dataCredentialSubject.sameAs : dataCredentialSubject.id;
    const dataCredentialIdDigitalLink = parseGS1DigitalLink(dataCredentialId);

    // Compare GS1 Digital Link in Data Credential and Key Credential ID
    if (keyDigitalLink.isValid && dataCredentialIdDigitalLink.isValid) {
        if (keyDigitalLink.parsedValue !== dataCredentialIdDigitalLink.parsedValue) {
            return false;
        }
    } else {
        return false;
    }

    if (valueToCheck !== "") {
        return keyDigitalLink.parsedValue === valueToCheck;
    }

    return true
}

// Compare Issuers of Organization Data Credential and it's chain.
function checkDataCredentialIssuerChain(dataCredentialChain: credentialChainDataKey) : boolean {
   

    if (dataCredentialChain === undefined) 
        throw new Error("Data Credential Chain is not defined.");

    if (dataCredentialChain.dataCredential === undefined) 
        throw new Error("dataCredential is required to validate GS1 Credential Chain.");

    if (dataCredentialChain.KeyCredential === undefined) 
        throw new Error("KeyCredential is required to validate GS1 Credential Chain.");

    if (dataCredentialChain.companyPrefixCredential === undefined) 
        throw new Error("companyPrefixCredential is required to validate GS1 Credential Chain.");

    return checkCredentialChainIssuers({ dataCredential: dataCredentialChain.dataCredential, 
        keyCredential: dataCredentialChain.KeyCredential.credential, 
        companyPrefix: dataCredentialChain.companyPrefixCredential.credential });
}

// Rule Functions for Data Credential Chain Validation
 
// Validate Product Data Credential Chain 
export async function validateExtendedKeyDataCredential(credentialType: string,
    credentialChain:  credentialChainMetaData): Promise<gs1RulesResult> {
    
    const gs1CredentialCheck: gs1RulesResult = { credentialId: credentialChain.credential.id, credentialName: credentialType, verified: false, errors: []};

    const dataCredentialChain = setupDataCredentialChain(credentialChain);
    if (!dataCredentialChain.isValid) {
        gs1CredentialCheck.errors.push(dataMissingToValidateCredentialChain);
        return gs1CredentialCheck;
    }

    // Check Data Credential Against Key
    const checkDataToKey = validateDataToKeyCredential(dataCredentialChain.keyCredentialSubject, dataCredentialChain.dataCredentialSubject);
    if (!checkDataToKey) {
        gs1CredentialCheck.errors.push(dataMismatchBetweenDataKeyCredential);
    }

    if (!checkDataCredentialIssuerChain(dataCredentialChain)) {
        gs1CredentialCheck.errors.push(invalidIssuer)
    }

    // Mark verified status if Product Data Chain is valid
    gs1CredentialCheck.verified = gs1CredentialCheck.errors.length === 0;
    return gs1CredentialCheck;
}

// Validate Organization Data Credential Chain 
export async function validateExtendedKeyCredential(credentialType: string,
    credentialChain:  credentialChainMetaData): Promise<gs1RulesResult> {

    const gs1CredentialCheck: gs1RulesResult = { credentialId: credentialChain.credential.id, credentialName: credentialType, verified: false, errors: []};
 
    const dataCredentialChain = setupDataCredentialChain(credentialChain);
    if (!dataCredentialChain.isValid) {
        gs1CredentialCheck.errors.push(dataMissingToValidateCredentialChain);
        return gs1CredentialCheck;
    }

    // Check Data Credential Against Key
    const checkDataToKey = validateDataToKeyCredential(dataCredentialChain.keyCredentialSubject, 
        dataCredentialChain.dataCredentialSubject);
        
    if (!checkDataToKey) {
        gs1CredentialCheck.errors.push(dataMismatchBetweenDataKeyCredential);
    }

    if (!checkDataCredentialIssuerChain(dataCredentialChain)) {
        gs1CredentialCheck.errors.push(invalidIssuer)
    }


    // Mark verified status if Organization Data Chain is valid
    gs1CredentialCheck.verified = gs1CredentialCheck.errors.length === 0;
    return gs1CredentialCheck;
}

