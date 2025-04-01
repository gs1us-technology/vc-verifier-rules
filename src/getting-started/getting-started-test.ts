import { checkGS1CredentialPresentationValidation, checkGS1CredentialWithoutPresentation } from "../lib/gs1-verification-service.js";
import { externalCredential, gs1CredentialValidationRule, gs1RulesResult, gs1ValidatorRequest, jsonSchemaLoader, VerifiableCredential, verifyExternalCredential } from "../lib/types.js";
import { getDecodedPresentation } from "../lib/utility/jwt-utils.js";
import { mockPrefixLicenseCredential } from "../tests/mock-credential.js";
import { mockJoseCredentialPresentationProductJwt } from "../tests/mock-jose-credential.js";
import { mock_gs1CompanyPrefixSchema, mock_gs1ProductDataSchema } from "../tests/mock-schema.js";

// Callback Function to Load External GS1 Credential.
// If the verifiable presentation is missing one of the required GS1 credentials, this function will be called to load the missing credential. 
export const loadExternalCredential: externalCredential = async (url: string) : Promise<VerifiableCredential> => {

    // For this sample the only expected external credential is the GS1 Prefix License Credential
    if (url === "https://id.gs1.org/vc/license/gs1_prefix/08") {
        return mockPrefixLicenseCredential;
    }
 
    throw new Error(`External Credential "${url}" can not be resolved.`);
 }
 
 // Callback function to verifify an externally loaded credential. 
 // When a credential is loaded from an external source, this function will verify the credential and check revocation. 
 // If verififcation fails return the status to the GS1 Rules Library
 export const validateExternalCredential: verifyExternalCredential = async (credential: VerifiableCredential) : Promise<gs1RulesResult> => {
 
    const credentialId = credential.id ? credential.id : "unknown";
    const credentialName = credential.name ? credential.name : "unknown";
    const errors: gs1CredentialValidationRule[] = [];
 
    return { credentialId: credentialId, credentialName: credentialName, verified: true, errors: errors};
 }
 
 // Callback Function to Load JSON Schema for GS1 Credential Validation
 // Developer Notes: The host application will need to cache or resolve all the GS1 JSON Schemas files for validation to pass.
 // The json-schema files are available in a sub folder to this test project.
 export const getJsonSchema: jsonSchemaLoader = (schemaId: string) : Buffer => {
 
    if (schemaId === "https://id.gs1.org/vc/schema/v1/companyprefix") {
        const jsonSchema = JSON.stringify(mock_gs1CompanyPrefixSchema);
        return Buffer.from(jsonSchema);
    }
 
    if (schemaId === "https://id.gs1.org/vc/schema/v1/productdata") {
        const jsonSchema = JSON.stringify(mock_gs1ProductDataSchema);
        return Buffer.from(jsonSchema);
    }
 
    // Return No Schema for unsupported schema types
    return Buffer.from('');
 }
 

// Setup the GS1 Validator Request Object with the Callback Functions
// Developer Notes: When fullJsonSchemaValidationOn is true the full Json Schema Validation will be performed.
// When fullJsonSchemaValidationOn is false only the custom GS1 rules for alternative license values and GS1 Digital Link URI will be executed.
 const test_gs1ValidatorRequest: gs1ValidatorRequest = {
    fullJsonSchemaValidationOn: true,
    gs1DocumentResolver: {
       externalCredentialLoader: loadExternalCredential, 
       externalCredentialVerification: validateExternalCredential,
       externalJsonSchemaLoader: getJsonSchema
   }
 }
 
 // Test Validating a sinlgle GS1 Company Prefix Credential.
 // Developer Notes: 
 // The GS1 Validator Request Callback Functions will be called to resolve the GS1 Prefix License Credential and load the required JSON Schema.
 export const testCompanyPrefixSchemaValidation = async function() : Promise<boolean> {

   const presentationToVerify = getDecodedPresentation(mockJoseCredentialPresentationProductJwt);
   const companyPrefixVerifiableCredential = presentationToVerify.verifiableCredential[0];
   const gs1RulesValidationResult = await checkGS1CredentialWithoutPresentation(test_gs1ValidatorRequest, companyPrefixVerifiableCredential);

   console.log("GS1 Rules Validation Company Prefix Result: " + gs1RulesValidationResult.verified);
   if (!gs1RulesValidationResult.verified) {
      console.log(gs1RulesValidationResult);
   }

   return gs1RulesValidationResult.verified;
 }

// Test Validating a GS1 Product (GTIN) Verifiable Presentation.
// Developer Notes: 
// The GS1 Validator Request Callback Functions will be called to resolve the GS1 Prefix License Credential and load the required JSON Schema.
 export const testProductPresentationValidation = async function() : Promise<boolean> {

   const presentationToVerify = getDecodedPresentation(mockJoseCredentialPresentationProductJwt);
   const gs1RulesValidationResult = await checkGS1CredentialPresentationValidation(test_gs1ValidatorRequest, presentationToVerify);

   console.log("GS1 Rules Validation Product Presentation Result: " + gs1RulesValidationResult.verified);
   if (!gs1RulesValidationResult.verified) {
      console.log(gs1RulesValidationResult);
   }

   return gs1RulesValidationResult.verified;
}
 