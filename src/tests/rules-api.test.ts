import { mockCompanyPrefixCredential, mockPresentationParty } from "./mock-credential.js";
import { checkGS1CredentialPresentationValidation, checkGS1CredentialWithoutPresentation } from "../lib/gs1-verification-service.js"
import { getCredentialRuleSchema, getCredentialType } from "../lib/get-credential-type.js";
import { mock_checkExternalCredential, mock_getExternalCredential, mock_jsonSchemaLoader } from "./mock-data.js";
import { gs1ValidatorRequest } from "../lib/types.js";

describe('Tests for Rules Engine Subject Field Validation', () => {

    it('should check GS1 Credential (Company Prefix) inside of a Presentation', async () => {
        // In line data update to mock out data for test  
        const mockPresentation  = {...mockPresentationParty, verifiableCredential: [mockCompanyPrefixCredential]};

        const validatorRequest: gs1ValidatorRequest = {
            fullJsonSchemaValidationOn: true,
            gs1DocumentResolver: {
                externalCredentialLoader: mock_getExternalCredential,
                externalCredentialVerification: mock_checkExternalCredential,
                externalJsonSchemaLoader: mock_jsonSchemaLoader
            }
        }

        const result = await checkGS1CredentialPresentationValidation(validatorRequest,  mockPresentation);

        expect(result.verified).toBe(true);
        expect(result.result[0].errors.length).toBe(0);
    })

    it('should check GS1 Credential (Company Prefix) with out a Without a Presentation', async () => {

        const validatorRequest: gs1ValidatorRequest = {
            fullJsonSchemaValidationOn: true,
            gs1DocumentResolver: {
                externalCredentialLoader: mock_getExternalCredential,
                externalCredentialVerification: mock_checkExternalCredential,
                externalJsonSchemaLoader: mock_jsonSchemaLoader
            }
        }

        const result = await checkGS1CredentialWithoutPresentation(validatorRequest,  mockCompanyPrefixCredential);

        expect(result.verified).toBe(true);
        expect(result.errors.length).toBe(0);
    })

    it('should check GS1 Credential (Company Prefix) with and invalid license value', async () => {
        // In line data update to mock out data for test    
        const jsonCompanyPrefixCredential = JSON.stringify(mockCompanyPrefixCredential);
        const mockCompanyPrefix = JSON.parse(jsonCompanyPrefixCredential);

        mockCompanyPrefix.credentialSubject.licenseValue = "00000000";

        const validatorRequest: gs1ValidatorRequest = {
            fullJsonSchemaValidationOn: true,
            gs1DocumentResolver: {
                externalCredentialLoader: mock_getExternalCredential,
                externalCredentialVerification: mock_checkExternalCredential,
                externalJsonSchemaLoader: mock_jsonSchemaLoader
            }
        }

        const result = await checkGS1CredentialWithoutPresentation(validatorRequest,  mockCompanyPrefix);

        expect(result.verified).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
    })

    it('should check GS1 Credential (Company Prefix) with and invalid issuer', async () => {
        // In line data update to mock out data for test    
        const jsonCompanyPrefixCredential = JSON.stringify(mockCompanyPrefixCredential);
        const mockCompanyPrefix = JSON.parse(jsonCompanyPrefixCredential);

        mockCompanyPrefix.issuer = "unknown";

        const validatorRequest: gs1ValidatorRequest = {
            fullJsonSchemaValidationOn: true,
            gs1DocumentResolver: {
                externalCredentialLoader: mock_getExternalCredential,
                externalCredentialVerification: mock_checkExternalCredential,
                externalJsonSchemaLoader: mock_jsonSchemaLoader
            }
        }

        const result = await checkGS1CredentialWithoutPresentation(validatorRequest,  mockCompanyPrefix);

        expect(result.verified).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
    })

    it('should check GS1 Credential (Company Prefix) with and invalid subject id', async () => {

        // In line data update to mock out data for test    
        const jsonCompanyPrefixCredential = JSON.stringify(mockCompanyPrefixCredential);
        const mockCompanyPrefix = JSON.parse(jsonCompanyPrefixCredential);

        const validatorRequest: gs1ValidatorRequest = {
            fullJsonSchemaValidationOn: true,
            gs1DocumentResolver: {
                externalCredentialLoader: mock_getExternalCredential,
                externalCredentialVerification: mock_checkExternalCredential,
                externalJsonSchemaLoader: mock_jsonSchemaLoader
            }
        }

        mockCompanyPrefix.credentialSubject.id = "unknown";
        const result = await checkGS1CredentialWithoutPresentation(validatorRequest,  mockCompanyPrefix);

        expect(result.verified).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
    })

    it('should get a valid GS1 Credential Type', async () => {
        const result = await getCredentialType(["GS1CompanyPrefixLicenseCredential"]);
        expect(result.name).toBe("GS1CompanyPrefixLicenseCredential")
    })

    it('should get unknown type for any unsupported GS1 Credential Type', async () => {
        const result = await getCredentialType(["GS1UnknownCredential"]);
        expect(result.name).toBe("unknown")
    })
   
    it('should get credential scheme for a credential (Company Prefix)', async () => {
        const result = await getCredentialRuleSchema(mock_jsonSchemaLoader, mockCompanyPrefixCredential, true);
        expect(result.$id).toBe("GS1-Company-Prefix-Schema-V1");
    })

    it('should get credential scheme for a credential (Company Prefix)', async () => {
        // In line data update to mock out data for test    
        const jsonCompanyPrefixCredential = JSON.stringify(mockCompanyPrefixCredential);
        const mockCompanyPrefix = JSON.parse(jsonCompanyPrefixCredential);
        mockCompanyPrefix.type = ["GS1UnknownCredential"];

        const result = await getCredentialRuleSchema(mock_jsonSchemaLoader, mockCompanyPrefix, true);
        expect(result.$id).toBe("Generic-Schema");
    })


   
})

