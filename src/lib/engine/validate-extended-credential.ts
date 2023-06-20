import { externalCredential, gs1RulesResult, verifyExternalCredential } from "../gs1-rules-types.js";
import { rulesEngineManager } from "../rules-definition/rules-manager.js";
import { getCredentialRuleSchema, getCredentialType } from "../get-credential-type.js";
import { CredentialSubjectSchema, gs1CredentialSchema, propertyMetaData } from "../rules-schema/rules-schema-types.js";
import { invalidGS1CredentialTypes, invalidRootCredentialType, unsupportedCredentialChain } from "./gs1-credential-errors.js";
import { resolveExternalCredential } from "./resolve-external-credential.js";
import { formateConsoleLog } from "../utility/console-logger.js";
import { CredentialPresentation, VerifiableCredential, VerifiablePresentation } from "../types.js";

// Metadata for the Credential Chain
export type credentialChainMetaData = {
    credential: VerifiableCredential;
    inPresentation: boolean;
    schema: gs1CredentialSchema;
    credentialSubjectSchema: CredentialSubjectSchema | unknown;
    extendedCredentialChain?: credentialChainMetaData;
    error?: string;
}

// Flag to Turn On/Off Logging of the GS1 Credential Chain
const LOG_CREDENTIAL_CHAIN = false;

// Build Credential Chain starting with the credential provided and resolve the credential chain until the root GS1 Credential
export async function buildCredentialChain(externalCredentialLoader: externalCredential, verifiablePresentation: CredentialPresentation, credential: VerifiableCredential) : Promise<credentialChainMetaData> {

    const credentialSubject = credential?.credentialSubject;
    const credentialSchema = getCredentialRuleSchema(credential);

    // inPresentation defaults to true to short circuit the credential chain lookup flow
    const credentialSubjectSchemaRule = credentialSchema.properties?.credentialSubject;
    const credentialChain: credentialChainMetaData = {
        credential, 
        inPresentation: true,
        schema: credentialSchema, 
        credentialSubjectSchema: credentialSubjectSchemaRule, 
        extendedCredentialChain: undefined};

    // Check for Extended Credential Chain
    if (credentialSubjectSchemaRule) {
        const extendsCredentialMetaData = credentialSubjectSchemaRule.extendsCredentialType;
        if (extendsCredentialMetaData) {
            const extendedCredentialValue = credentialSubject.extendsCredential || credentialSubject.keyAuthorization;
            const extendedCredentialResult = await resolveExternalCredential(externalCredentialLoader, verifiablePresentation, extendedCredentialValue);
            
            if (extendedCredentialResult.credential) {
                // Walk the credential chain
                const extendedCredentialChain = await buildCredentialChain(externalCredentialLoader, verifiablePresentation, extendedCredentialResult.credential);

                // Once the root credential is reached, the extendedCredentialChain is undefined
                if (extendedCredentialChain.credential) {
                    // After Resolving the Extended Credential track if it came from the presentation or was resolved externally
                    // If the extended credential was resolved externally, then it must be verified during validation
                    extendedCredentialChain.inPresentation = extendedCredentialResult.inPresentation;
                    credentialChain.extendedCredentialChain = extendedCredentialChain;
                } else {
                    credentialChain.error = extendedCredentialResult.error;
                }
            }
            else {
                credentialChain.error = extendedCredentialResult.error;
            }
        }
    } 
  
    return credentialChain;
}

// Valid parent credential against extended child credential types
// GS1 Credential chain requires validation between different credential types (See GS1 Data Model for More Details)
// - Validate Credential Types between parent and child extended credentials
// - Validate Credential Subject between parent and child extended credentials (See GS1 Data Model for More Details)
export async function validateCredentialChain(externalCredentialVerification: verifyExternalCredential, credentialChain: credentialChainMetaData, validateChain: boolean) : Promise<gs1RulesResult> {

    const credential: VerifiableCredential = credentialChain.credential
    const credentialSchema: gs1CredentialSchema = credentialChain.schema;
    const credentialSchemaSubject: CredentialSubjectSchema | undefined = credentialSchema.properties?.credentialSubject;
    const extendedCredential: any = credentialChain.extendedCredentialChain?.credential;
    const gs1CredentialCheck: gs1RulesResult = { credentialId: credential.id, credentialName: credentialSchema.credentialType, verified: true, errors: []};

    if (!credentialChain.inPresentation) {
        const checkCredentialResult = await externalCredentialVerification(credentialChain.credential);
        if (!checkCredentialResult.verified) {
            gs1CredentialCheck.verified = false;
            gs1CredentialCheck.errors = gs1CredentialCheck.errors.concat(checkCredentialResult.errors);
        }
    }

    // When there is no extended credential exit out of the chain
    if (!!!extendedCredential) {
        return gs1CredentialCheck;
    }

    const extendedCredentialSchema = getCredentialRuleSchema(extendedCredential);
    const extendedCredentialType = extendedCredentialSchema.credentialType;

    // Check if Parent is Supported Type
    const parentInvalid = credentialSchemaSubject?.extendsCredentialType?.type.includes(extendedCredentialType)
    if (!!!parentInvalid) {
        gs1CredentialCheck.errors.push(invalidGS1CredentialTypes);
    }

    // Check if Child is Supported Type
    const extendedCredentialSubjectSchema = extendedCredentialSchema.properties?.credentialSubject;
    const credentialType = getCredentialType(credential.type)

    const childIsValid = extendedCredentialSubjectSchema?.childCredential?.type.includes(credentialType)
    if (!childIsValid) {
        gs1CredentialCheck.errors.push(invalidGS1CredentialTypes);
    }

    // Get Specific Extended Credential Type Rule to call to validate extended credential chain 
    // Library currently only supports one extended credential type rule check
    const extendedCredentialType_rule =  credentialSchemaSubject?.extendsCredentialType?.rule;

    if (!!!extendedCredentialType_rule || typeof rulesEngineManager[extendedCredentialType_rule] === "undefined") {
        gs1CredentialCheck.verified = false;
        gs1CredentialCheck.errors.push(unsupportedCredentialChain);
        return gs1CredentialCheck;
    }

    if (LOG_CREDENTIAL_CHAIN) {
        formateConsoleLog(credentialSchema.credentialType);
    }

    if (validateChain) {
        const extendedCredentialValidationResult = await rulesEngineManager[extendedCredentialType_rule](credentialType, credentialChain);
        if (!extendedCredentialValidationResult.verified) {
            gs1CredentialCheck.errors = gs1CredentialCheck.errors.concat(extendedCredentialValidationResult.errors);
        }
    
        if (gs1CredentialCheck.errors.length > 0) {
            gs1CredentialCheck.verified = false;
        }
    }
  
    // Walk Up Credential Chain until we reach the root credential
    if (credentialChain.extendedCredentialChain?.extendedCredentialChain) {
        const validateExtendedCredentialResult = await validateCredentialChain(externalCredentialVerification, credentialChain.extendedCredentialChain, false);

        // When Resolve VC is not in the presentation add to the output
        if (!credentialChain.extendedCredentialChain?.extendedCredentialChain.inPresentation) {
            const resolvedCredentialMetaData = credentialChain.extendedCredentialChain?.extendedCredentialChain;
            gs1CredentialCheck.resolvedCredential =  { 
                credential: resolvedCredentialMetaData?.credential,
                credentialId: resolvedCredentialMetaData?.credential?.id, 
                credentialName: resolvedCredentialMetaData?.schema?.credentialType, 
                verified: validateExtendedCredentialResult.verified, 
                errors: validateExtendedCredentialResult.errors
            };
        }

        // Add Errors to Result - will be bubbled up the chain to the child credential result
        if (!validateExtendedCredentialResult.verified) {
            gs1CredentialCheck.errors = gs1CredentialCheck.errors.concat(validateExtendedCredentialResult.errors);
        }
    } else {

        if (LOG_CREDENTIAL_CHAIN) {
            formateConsoleLog(credentialSchema.credentialType);
        }

        // Make sure the root is always a GS1 License Prefix Credential
        if (extendedCredentialType !== "GS1PrefixLicenseCredential") {
            gs1CredentialCheck.errors.push(invalidRootCredentialType);
        }

        if (credentialChain.extendedCredentialChain && credentialChain.extendedCredentialChain.credentialSubjectSchema) {
            const validateExtendedCredentialResult = await validateCredentialChain(externalCredentialVerification, credentialChain.extendedCredentialChain, false);

            // When Resolve VC is not in the presentation add to the output
            if (!credentialChain.extendedCredentialChain.inPresentation) {
                const resolvedCredentialMetaData = credentialChain.extendedCredentialChain;
                gs1CredentialCheck.resolvedCredential =  { 
                    credential: resolvedCredentialMetaData?.credential,
                    credentialId: resolvedCredentialMetaData?.credential?.id, 
                    credentialName: resolvedCredentialMetaData?.schema?.credentialType, 
                    verified: validateExtendedCredentialResult.verified, 
                    errors: validateExtendedCredentialResult.errors
                };
            }

            // Add Errors to Result - will be bubbled up the chain to the child credential result
            if (!validateExtendedCredentialResult.verified) {
                gs1CredentialCheck.verified = false;
                gs1CredentialCheck.errors = gs1CredentialCheck.errors.concat(validateExtendedCredentialResult.errors);
            }

        }
    }
   
    return gs1CredentialCheck;
}

