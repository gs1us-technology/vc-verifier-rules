import { genericCredentialSchema } from "./rules-schema/genericCredentialSchema.js";
import { getCredentialRuleSchema } from "./get-credential-type.js";
import { buildCredentialChain,  validateCredentialChain } from "./engine/validate-extended-credential.js";
import { CredentialPresentation, gs1RulesResult, gs1RulesResultContainer, gs1ValidatorRequest, VerifiableCredential, VerifiablePresentation } from "./types.js";
import { errorResolveCredentialCode } from "./engine/gs1-credential-errors.js";
import { checkSchema } from "./schema/validate-schema.js";
import { resolveExternalCredential } from "./engine/resolve-external-credential.js";

// Verify the credential and ensure it follows the GS1 level four rules.
// - validatorRequest: Request Objetct with callback fuctions for resolving and verifying credentials
// - verifiablePresentation: Verifiable Presentation containing the credential to be verified
// - credential : Verifiable Credential to be verified
// - When fullJsonSchemaValidationOn is true will Validate full GS1 JSON Schema
// - When fullJsonSchemaValidationOn is false will Validate only validate GS1 Custom Rules and Root of Trust credential chain
async function checkGS1Credentials(validatorRequest: gs1ValidatorRequest, verifiablePresentation: CredentialPresentation, credential: VerifiableCredential) : Promise<gs1RulesResult> {

    const credentialSubject = credential?.credentialSubject;

    if (!credential || !credentialSubject) { 
        throw new Error("No Credential in Presentation");
    }

    if (!validatorRequest || !validatorRequest.gs1DocumentResolver) { 
        throw new Error("Document Resolver Callback must be provided to validate GS1 Credentials");
    }
    
    const externalCredentialLoader = validatorRequest.gs1DocumentResolver.externalCredentialLoader;
    const externalCredentialVerification = validatorRequest.gs1DocumentResolver.externalCredentialVerification;
    const jsonSchemaLoader = validatorRequest.gs1DocumentResolver.externalJsonSchemaLoader;

    const credentialSchema = getCredentialRuleSchema(jsonSchemaLoader, credential, validatorRequest.fullJsonSchemaValidationOn);

    // Return verified when non GS1 Credential
    if (credentialSchema.$id === genericCredentialSchema.$id) { 
        return { credentialId : credential.id, credentialName: "unknown", verified: true, errors: []};
    }

    const gs1CredentialCheck: gs1RulesResult = { credentialId : credential.id, credentialName: credentialSchema.title ? credentialSchema.title : "unknown", verified: true, errors: []};

    // Enforce GS1 Credential JSON Schema Rules
    const schemaCheckResult = await checkSchema(credentialSchema, credential);

    if (!schemaCheckResult.verified) { 
       gs1CredentialCheck.errors = schemaCheckResult.errors;
   }

    const credentialChain = await buildCredentialChain(externalCredentialLoader, verifiablePresentation, credential);
    if (!credentialChain.error) {
        const extendedCredentialResult = await validateCredentialChain(externalCredentialVerification, credentialChain, true);

        gs1CredentialCheck.resolvedCredential = extendedCredentialResult.resolvedCredential;
        if (!extendedCredentialResult.verified) {
            gs1CredentialCheck.errors = gs1CredentialCheck.errors.concat(extendedCredentialResult.errors);
        }
    } else {
        gs1CredentialCheck.errors.push({ code: errorResolveCredentialCode, rule: credentialChain.error });
    }

    if (gs1CredentialCheck.errors.length > 0) {
        gs1CredentialCheck.verified = false;
    }

    return gs1CredentialCheck;
}

// Verify an indiviual GS1 credential to ensure it follows the GS1 level four rules. 
// Will Resolve any required GS1 Credential to validate the root of trust chain
// - validatorRequest: Request Objetct with callback fuctions for resolving and verifying credentials
// - verifiableCredential : Verifiable Credential to be verified
// - When fullJsonSchemaValidationOn is true will Validate full GS1 JSON Schema
// - When fullJsonSchemaValidationOn is false will Validate only validate GS1 Custom Rules and Root of Trust credential chain
export async function checkGS1CredentialWithoutPresentation(validatorRequest: gs1ValidatorRequest, verifiableCredential: VerifiableCredential) : Promise<gs1RulesResult> {
    const verifiablePresentation = { verifiableCredential: verifiableCredential };
    return await checkGS1Credentials(validatorRequest, verifiablePresentation, verifiablePresentation.verifiableCredential);
}

// Verify a verifiable credential presentation and ensure all credentials follows the GS1 level four rules.
// - validatorRequest: Request Objetct with callback fuctions for resolving and verifying credentials
// - verifiablePresentation: Verifiable Presentation containing the credential to be verified
// - When fullJsonSchemaValidationOn is true will Validate full GS1 JSON Schema
// - When fullJsonSchemaValidationOn is false will Validate only validate GS1 Custom Rules and Root of Trust credential chain
export async function checkGS1CredentialPresentationValidation(validatorRequest: gs1ValidatorRequest, verifiablePresentation: VerifiablePresentation) :  Promise<gs1RulesResultContainer> {
    const gs1CredentialCheck: gs1RulesResultContainer = { verified: true, result: []};
    const presentationCredentials = verifiablePresentation.verifiableCredential;

    if (Array.isArray(presentationCredentials)) { 
        if (!validatorRequest.gs1DocumentResolver || !validatorRequest.gs1DocumentResolver.externalCredentialLoader) {
            throw new Error("Validation Document Resolver Callback must be provided to validate GS1 Credentials");
        }
       
        const externalCredentialLoader = validatorRequest.gs1DocumentResolver.externalCredentialLoader;
        const presentationToValidateVC = structuredClone(presentationCredentials);

        for (const credential of presentationCredentials) {
            const extendedCredentialValue = credential.credentialSubject.extendsCredential;
            const extendedCredentialResult = await resolveExternalCredential(externalCredentialLoader, verifiablePresentation, extendedCredentialValue);
    
            // Add Resolved Credential to Presentation
            if (extendedCredentialResult?.credential) { 
                if (!extendedCredentialResult.inPresentation) {
                    presentationToValidateVC.unshift(extendedCredentialResult.credential);
                }
            }
        }

        const presentationToValidate = structuredClone(verifiablePresentation);
        presentationToValidate.verifiableCredential = presentationToValidateVC;

        for (const credential of presentationToValidate.verifiableCredential) {
            const credentialResult = await checkGS1Credentials(validatorRequest, presentationToValidate, credential);
    
            gs1CredentialCheck.result.push(credentialResult);
            if (!credentialResult.verified) {
                gs1CredentialCheck.verified = false;
            }
          }
    } else {
        const credentialResult = await checkGS1Credentials(validatorRequest, verifiablePresentation, presentationCredentials);
    
        gs1CredentialCheck.result.push(credentialResult);
        if (!credentialResult.verified) {
            gs1CredentialCheck.verified = false;
        }

        if (credentialResult.resolvedCredential) {
            gs1CredentialCheck.result.push(credentialResult.resolvedCredential);
        }
    }

    return gs1CredentialCheck;
}
