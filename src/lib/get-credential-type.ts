import { gs1CredentialSchema, gs1CredentialSchemaChain } from "./rules-schema/rules-schema-types.js";
import { genericCredentialSchema } from "./rules-schema/genericCredentialSchema.js";
import { gs1CredentialTypes, gs1RulesSchemaMetaModel, jsonSchemaLoader, VerifiableCredential } from "./types.js";
import { gs1CredentialChainRules } from "./rules-schema/gs1-chain-rules.js";
import { decoder } from "./utility/text-util.js";
import { emptyJsonSchemaSubjectOnly, gs1AltLicenseValidationRules, gs1DigitalLinkRules, gs1DigitalLinkSameAsRules, gs1GenericSchemaGS1 } from "./schema/gs1-schema-extention-types.js";

export const GS1_PREFIX_LICENSE_CREDENTIAL = "GS1PrefixLicenseCredential";
export const GS1_COMPANY_PREFIX_LICENSE_CREDENTIAL = "GS1CompanyPrefixLicenseCredential";
export const KEY_CREDENTIAL = "KeyCredential";
export const ORGANIZATION_DATA_CREDENTIAL = "OrganizationDataCredential";
export const PRODUCT_DATA_CREDENTIAL = "ProductDataCredential";
export const GS1_IDENTIFICATION_KEY_LICENSE_CREDENTIAL = "GS1IdentificationKeyLicenseCredential";

// List of Supportive GS1 Credential Types
const GS1CredentialTypes = [
    GS1_COMPANY_PREFIX_LICENSE_CREDENTIAL,
    KEY_CREDENTIAL,
    ORGANIZATION_DATA_CREDENTIAL,
    PRODUCT_DATA_CREDENTIAL,
    GS1_PREFIX_LICENSE_CREDENTIAL,
    GS1_IDENTIFICATION_KEY_LICENSE_CREDENTIAL
];

export const UNKNOWN_VALUE = "unknown";

 // GS1 JSON Schmea Map to GS1 Credential Type
const GS1CredentialSchema = [
    { name: GS1_PREFIX_LICENSE_CREDENTIAL, schemaId: "https://id.gs1.org/vc/schema/v1/prefix" },
    { name: GS1_COMPANY_PREFIX_LICENSE_CREDENTIAL, schemaId: "https://id.gs1.org/vc/schema/v1/companyprefix" },
    { name: KEY_CREDENTIAL, schemaId: "https://id.gs1.org/vc/schema/v1/key" },
    { name: ORGANIZATION_DATA_CREDENTIAL, schemaId: "https://id.gs1.org/vc/schema/v1/organizationdata" },
    { name: PRODUCT_DATA_CREDENTIAL, schemaId: "https://id.gs1.org/vc/schema/v1/productdata" },
    { name: GS1_IDENTIFICATION_KEY_LICENSE_CREDENTIAL, schemaId: "https://id.gs1.org/vc/schema/v1/identificationkey" }
];

// Get the type of credential from Verifiable Credential Type Array
// If credential is not a supported GS1 Credential, return "unknown"
export const getCredentialType = ( credentialTypesSource: string[] | undefined): gs1CredentialTypes =>  {

    if (!credentialTypesSource)
        return {name: UNKNOWN_VALUE, schemaId: ""};

    // Look for GS1 Credential Type into source credential types. There should only be one GS1 Credential in the source 
    const credentialTypes = credentialTypesSource.filter(credentialType => GS1CredentialTypes.includes(credentialType));

    if (credentialTypes.length === 1) {
        const credentialType = GS1CredentialSchema.find(credential => credential.name === credentialTypes[0]);
        if (!credentialType) {
            return {name: UNKNOWN_VALUE, schemaId: ""};
        }
        return credentialType;
    } else if (credentialTypes.length > 1) {
        return {name: UNKNOWN_VALUE, schemaId: ""};
    }

    // Credential is not a supported GS1 Credential
    return {name: UNKNOWN_VALUE, schemaId: ""};
}

// Get the GS1 Credential Chain Rule Schema based on the Credential Type
// The Chain Rule is used to validate the GS1 Credential Chain Root of Trust
export const getCredentialRuleSchemaChain = function(credential: VerifiableCredential) : gs1CredentialSchemaChain { 

    if (!credential) {
        throw new Error("Credential is undefined");
    }

    const credentialType = getCredentialType(credential.type);
    switch(credentialType.name) {
        case GS1_PREFIX_LICENSE_CREDENTIAL:
            return gs1CredentialChainRules.GS1PrefixLicenseCredential;
        case GS1_COMPANY_PREFIX_LICENSE_CREDENTIAL:
            return gs1CredentialChainRules.GS1CompanyPrefixLicenseCredential;
        case KEY_CREDENTIAL:
            return gs1CredentialChainRules.KeyCredential;
        case ORGANIZATION_DATA_CREDENTIAL:
            return gs1CredentialChainRules.OrganizationDataCredential;
        case PRODUCT_DATA_CREDENTIAL:
            return gs1CredentialChainRules.ProductDataCredential;
        default:
            return gs1CredentialChainRules.genericCredentialSchema;
      }
}

// Get JSON Schema to Validate GS1 Credentials. 
// If fullJsonSchemaValidationOn is false only the GS1 Specific Rules will be validated
const getGS1JsonSchema = function(fullJsonSchemaValidationOn: boolean, standardSchema: gs1CredentialSchema, gs1RulesSchema: gs1RulesSchemaMetaModel) : gs1CredentialSchema {
    
    const schemaToValidate = {...standardSchema};

    if (!fullJsonSchemaValidationOn && gs1RulesSchema != null) {
        schemaToValidate.properties = {...emptyJsonSchemaSubjectOnly};
    }

    if (gs1RulesSchema != null) { 
        schemaToValidate.properties.credentialSubject = {...schemaToValidate.properties?.credentialSubject, ...gs1RulesSchema};
    }

    return schemaToValidate;
}

// This method handles breakwards compatibility for Verifiable Credential V1 JSON Schema Validation
// Developer Notes: Current Assumption hasProof are Data Integrity Proof V1 Verifiable Credential
const getGS1JsonSchemaForV1 = function(jsonSchema: gs1CredentialSchema) {

    const {...v1Schema} = jsonSchema;
    //const {properties, ...v1Schema} = jsonSchema
    v1Schema["$id"] = jsonSchema["$id"] + "-V1";
    v1Schema.required = [];
    v1Schema.properties = {};
    v1Schema.properties.credentialSubject = jsonSchema.properties.credentialSubject;
    return v1Schema;
}


// Call the external JSON Schema Loader to get a GS1 Schema JSON
const callResolverToGetJsonSchema = function(schemaLoader: jsonSchemaLoader, credentialType: gs1CredentialTypes) : gs1CredentialSchema {

    // Callback for JSON Schema
    if (schemaLoader) { 
        const credentialSchemaContent = schemaLoader(credentialType.schemaId);

        if (credentialSchemaContent && credentialSchemaContent.length > 0) {
            const schemaContent = decoder.decode(credentialSchemaContent);
            const parsedSchemaContent = JSON.parse(schemaContent);
            return parsedSchemaContent;
        } 
    }

    // Return Generic Undefined Schema when the loader is not available or the requesyed schema is not found
    return gs1GenericSchemaGS1;
}

// Resolve JSON Schema to Validate GS1 Credential based on the Credential Type
export const getCredentialRuleSchema = function(schemaLoader: jsonSchemaLoader, credential: VerifiableCredential, fullJsonSchemaValidationOn: boolean = true) : gs1CredentialSchema { 

    if (!credential) {
        throw new Error("Credential can not be undefined.");
    }

    if (credential.type === undefined) {
        throw new Error("Credential type can not be undefined.");
    }

    // GS1 Credential Type from verifiable credential
    const credentialType = getCredentialType(credential.type);

    // Use Callback Resolver to Get JSON Schema for GS1 Credentials
    const credentialSchema = callResolverToGetJsonSchema(schemaLoader, credentialType);

    // Fallback to V1 JSON Schema for Data Integrity Proof Credentials
    const starterSchema = credential.proof !== undefined ? getGS1JsonSchemaForV1(credentialSchema) : credentialSchema;
  
    switch(credentialType.name) {
        case GS1_PREFIX_LICENSE_CREDENTIAL:
           return getGS1JsonSchema(fullJsonSchemaValidationOn, starterSchema, gs1AltLicenseValidationRules);
        case GS1_COMPANY_PREFIX_LICENSE_CREDENTIAL:
            return getGS1JsonSchema(fullJsonSchemaValidationOn, starterSchema, gs1AltLicenseValidationRules)
        case KEY_CREDENTIAL:
            return getGS1JsonSchema(fullJsonSchemaValidationOn, starterSchema, gs1DigitalLinkRules);
        case ORGANIZATION_DATA_CREDENTIAL:
            return getGS1JsonSchema(fullJsonSchemaValidationOn, starterSchema, gs1DigitalLinkSameAsRules);
        case PRODUCT_DATA_CREDENTIAL:
            return getGS1JsonSchema(fullJsonSchemaValidationOn, starterSchema, gs1DigitalLinkSameAsRules);
        default:
            return genericCredentialSchema;
      }

}
