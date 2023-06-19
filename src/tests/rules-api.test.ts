import { externalCredential, gs1RulesResult, verifyExternalCredential } from "../lib/gs1-rules-types.js";
import { mockCompanyPrefixCredential, mockPrefixLicenseCredential, mockPresentationParty } from "./mock-credential.js";
import { VerifiableCredential } from "../lib/types";
import { checkGS1CredentialPresentation, checkGS1CredentialWithoutPresentation } from "../lib/gs1-verification-service.js"
import { getCredentialRuleSchema, getCredentialType } from "../lib/get-credential-type.js";

// Test function to resolve mock credentials
const mock_getExternalCredential: externalCredential = async (url: string) : Promise<VerifiableCredential> => {

    if (url === "https://id.gs1.org/vc/license/gs1_prefix/08") {
        return mockPrefixLicenseCredential;
    }

    throw new Error(`External Credential "${url}" can not be resolved.`);
}

// Test function to verify mock credentials
const mock_checkExternalCredential: verifyExternalCredential = async (credential: VerifiableCredential) : Promise<gs1RulesResult> => {

    const verifyStatus = credential.id === "mockCredentialId_Fail" ? false : true;
    const errors: any[] = [];
    if (!verifyStatus) {
        errors.push({message: "Mock Error"})
    }

    const gs1RulesResultMock = { credentialId: "MockCredentialId", credentialName: "MockCredentialName", verified: verifyStatus, errors: errors};
    return gs1RulesResultMock;
}

describe('Tests for Rules Engine Subject Field Validation', () => {

    it('should check GS1 Credential (Company Prefix) inside of a Presentation', async () => {
        // In line data update to mock out data for test  
        const mockPresentation  = {...mockPresentationParty, verifiableCredential: [mockCompanyPrefixCredential]};
        const result = await checkGS1CredentialPresentation(mock_getExternalCredential, mock_checkExternalCredential,  mockPresentation);

        expect(result.verified).toBe(true);
        expect(result.result[0].errors.length).toBe(0);
    })

    it('should check GS1 Credential (Company Prefix) with out a Without a Presentation', async () => {
        const result = await checkGS1CredentialWithoutPresentation(mock_getExternalCredential, mock_checkExternalCredential,  mockCompanyPrefixCredential);

        expect(result.verified).toBe(true);
        expect(result.errors.length).toBe(0);
    })

    it('should check GS1 Credential (Company Prefix) with and invalid license value', async () => {
        // In line data update to mock out data for test    
        const jsonCompanyPrefixCredential = JSON.stringify(mockCompanyPrefixCredential);
        const mockCompanyPrefix = JSON.parse(jsonCompanyPrefixCredential);

        mockCompanyPrefix.credentialSubject.licenseValue = "00000000";

        const result = await checkGS1CredentialWithoutPresentation(mock_getExternalCredential, mock_checkExternalCredential,  mockCompanyPrefix);

        expect(result.verified).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
    })

    it('should check GS1 Credential (Company Prefix) with and invalid issuer', async () => {
        // In line data update to mock out data for test    
        const jsonCompanyPrefixCredential = JSON.stringify(mockCompanyPrefixCredential);
        const mockCompanyPrefix = JSON.parse(jsonCompanyPrefixCredential);

        mockCompanyPrefix.issuer = "unknown";

        const result = await checkGS1CredentialWithoutPresentation(mock_getExternalCredential, mock_checkExternalCredential,  mockCompanyPrefix);

        expect(result.verified).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
    })

    it('should check GS1 Credential (Company Prefix) with and invalid subject id', async () => {
        // In line data update to mock out data for test    
        const jsonCompanyPrefixCredential = JSON.stringify(mockCompanyPrefixCredential);
        const mockCompanyPrefix = JSON.parse(jsonCompanyPrefixCredential);

        mockCompanyPrefix.credentialSubject.id = "unknown";

        const result = await checkGS1CredentialWithoutPresentation(mock_getExternalCredential, mock_checkExternalCredential,  mockCompanyPrefix);

        expect(result.verified).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
    })

    it('should get a valid GS1 Credential Type', async () => {
        const result = await getCredentialType(["GS1CompanyPrefixLicenseCredential"]);
        expect(result).toBe("GS1CompanyPrefixLicenseCredential")
    })

    it('should get unknown type for any unsupported GS1 Credential Type', async () => {
        const result = await getCredentialType(["GS1UnknownCredential"]);
        expect(result).toBe("unknown")
    })
   
    it('should get credential scheme for a credential (Company Prefix)', async () => {
        const result = await getCredentialRuleSchema(mockCompanyPrefixCredential);
        expect(result.$id).toBe("GS1-Company-Prefix-Schema");
    })

    it('should get credential scheme for a credential (Company Prefix)', async () => {
        // In line data update to mock out data for test    
        const jsonCompanyPrefixCredential = JSON.stringify(mockCompanyPrefixCredential);
        const mockCompanyPrefix = JSON.parse(jsonCompanyPrefixCredential);
        mockCompanyPrefix.type = ["GS1UnknownCredential"];

        const result = await getCredentialRuleSchema(mockCompanyPrefix);
        expect(result.$id).toBe("Generic-Schema");
    })


   
})

