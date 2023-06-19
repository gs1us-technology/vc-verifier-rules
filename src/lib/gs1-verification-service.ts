import { externalCredential, gs1RulesResult, gs1RulesResultContainer, verifyExternalCredential } from "./gs1-rules-types.js";
import { genericCredentialSchema } from "./rules-schema/genericCredentialSchema.js";
import { rulesEngineManager } from "./rules-definition/rules-manager.js";
import { getCredentialRuleSchema } from "./get-credential-type.js";
import { buildCredentialChain,  validateCredentialChain } from "./engine/validate-extended-credential.js";
import { CredentialPresentation, VerifiableCredential, VerifiablePresentation } from "./types.js";
import { errorResolveCredentialCode, requiredFieldMissing } from "./engine/gs1-credential-errors.js";

// Verify the credential and ensure it follows the GS1 level four rules.
// - externalCredentialLoader: External Callback to get credentials from external source
// - verifiablePresentation: Verifiable Presentation containing the credential to be verified
export async function checkGS1Credentials(externalCredentialLoader: externalCredential, externalCredentialVerification: verifyExternalCredential, verifiablePresentation: CredentialPresentation, credential: VerifiableCredential) : Promise<gs1RulesResult> {

    const credentialSubject = credential?.credentialSubject;

    if (!!!credential || !!!credentialSubject) { 
        throw new Error("No Credential in Presentation");
    }

    const credentialSchema = getCredentialRuleSchema(credential);

    // Return verified when non GS1 Credential
    if (credentialSchema.$id === genericCredentialSchema.$id) { 
        return { credentialId : credential.id, credentialName: "unknown", verified: true, errors: []};
    }

    const gs1CredentialCheck: gs1RulesResult = { credentialId : credential.id, credentialName: credentialSchema.credentialType, verified: true, errors: []};
    const credentialSubjectSchemaRule = credentialSchema.properties?.credentialSubject;

    if (credentialSubjectSchemaRule) {

        // Check required fields are present
        credentialSubjectSchemaRule.required.forEach( (requiredField: string) => {
            const fieldExistInwSubject = Object.keys(credentialSubject).includes(requiredField);
            if (!fieldExistInwSubject) {
                const requiredFieldMissingError = { 
                    code: requiredFieldMissing.code,
                    rule: `Required field ${requiredField} is missing.`
                };

                gs1CredentialCheck.errors.push(requiredFieldMissingError)
            }
        });

        // Check Credential Subject Fields
        for (const field in credentialSubjectSchemaRule.properties) {
            const checkField = credentialSubjectSchemaRule.properties[field];

            const fieldValidationResult = await rulesEngineManager[checkField.type](credentialSubject);
            if (!fieldValidationResult.verified) {
                gs1CredentialCheck.errors.push(fieldValidationResult.rule)
            }
        }

        const credentialChainNew = await buildCredentialChain(externalCredentialLoader, verifiablePresentation, credential);

        if (!!!credentialChainNew.error) {
            const extendedCredentialResult = await validateCredentialChain(externalCredentialVerification, credentialChainNew, true);
                    
            if (!extendedCredentialResult.verified) {
                gs1CredentialCheck.errors = gs1CredentialCheck.errors.concat(extendedCredentialResult.errors);
            }
        } else {
            gs1CredentialCheck.errors.push({ code: errorResolveCredentialCode, rule: credentialChainNew.error });
        }
    }

    if (gs1CredentialCheck.errors.length > 0) {
        gs1CredentialCheck.verified = false;
    }

    return gs1CredentialCheck;
}

export async function checkGS1CredentialWithoutPresentation(externalCredentialLoader: externalCredential, externalCredentialVerification: verifyExternalCredential, verifiableCredential: VerifiableCredential) : Promise<gs1RulesResult> {
    const verifiablePresentation = { verifiableCredential: verifiableCredential };
    return await checkGS1Credentials(externalCredentialLoader, externalCredentialVerification, verifiablePresentation, verifiablePresentation.verifiableCredential);
}

export async function checkGS1CredentialPresentation(externalCredentialLoader: externalCredential, externalCredentialVerification: verifyExternalCredential, verifiablePresentation: VerifiablePresentation) : Promise<gs1RulesResultContainer> {
    const gs1CredentialCheck: gs1RulesResultContainer = { verified: true, result: []};

    const presentationCredentials = verifiablePresentation.verifiableCredential;

    if (Array.isArray(presentationCredentials)) { 
        for (const credential of presentationCredentials) {
            const credentialResult = await checkGS1Credentials(externalCredentialLoader, externalCredentialVerification, verifiablePresentation, credential);
    
            gs1CredentialCheck.result.push(credentialResult);
            if (!credentialResult.verified) {
                gs1CredentialCheck.verified = false;
            }
          }
    } else {
        const credentialResult = await checkGS1Credentials(externalCredentialLoader, externalCredentialVerification, verifiablePresentation, presentationCredentials);
    
        gs1CredentialCheck.result.push(credentialResult);
        if (!credentialResult.verified) {
            gs1CredentialCheck.verified = false;
        }
    }

    return gs1CredentialCheck;
}
