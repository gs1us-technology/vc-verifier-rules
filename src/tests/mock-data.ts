import { mockPrefixLicenseCredential } from "./mock-credential.js";
import { externalCredential, gs1CredentialValidationRule, gs1RulesResult, jsonSchemaLoader, VerifiableCredential, verifyExternalCredential } from "../lib/types";
import { mock_gs1CompanyPrefixSchema, mock_gs1ProductDataSchema } from "./mock-schema.js";

// Test function to resolve mock credentials
export const mock_getExternalCredential: externalCredential = async (url: string) : Promise<VerifiableCredential> => {

    if (url === "https://id.gs1.org/vc/license/gs1_prefix/08") {
        return mockPrefixLicenseCredential;
    }

    throw new Error(`External Credential "${url}" can not be resolved.`);
}

// Test function to verify mock credentials
export const mock_checkExternalCredential: verifyExternalCredential = async (credential: VerifiableCredential) : Promise<gs1RulesResult> => {

    const verifyStatus = credential.id === "mockCredentialId_Fail" ? false : true;
    const errors: gs1CredentialValidationRule[] = [];
    if (!verifyStatus) {
        errors.push({code: "MOCK173", rule: "Mock Rule"})
    }

    const gs1RulesResultMock = { credentialId: "MockCredentialId", credentialName: "MockCredentialName", verified: verifyStatus, errors: errors};
    return gs1RulesResultMock;
}

// Mock - Resolver Callback Function to Load JSON Schema for GS1 Credential Validation
export const mock_jsonSchemaLoader: jsonSchemaLoader = (schemaId: string) : Buffer => {

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
