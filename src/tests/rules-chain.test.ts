import { resolveExternalCredential } from '../lib/engine/resolve-external-credential';
import { buildCredentialChain, credentialChainMetaData, validateCredentialChain } from '../lib/engine/validate-extended-credential';
import { CredentialSubjectSchema } from '../lib/rules-schema/rules-schema-types';
import { externalCredential, gs1CredentialValidationRule, gs1RulesResult, VerifiableCredential, verifyExternalCredential } from '../lib/types';
import { mockCompanyPrefixCredential, mockGenericCredential, mockPrefixLicenseCredential, mockPresentationParty } from './mock-credential';
import { validateExtendedCompanyPrefixCredential } from '../lib/rules-definition/chain/validate-extended-company-prefix';
import { validateExtendedKeyDataCredential } from '../lib/rules-definition/chain/validate-extended-data-key';
import { compareLicenseValue } from '../lib/rules-definition/chain/shared-extended';

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
    const errors: gs1CredentialValidationRule[] = [];
    if (!verifyStatus) {
        errors.push({code: "MOCK173", rule: "Mock Rule"})
    }

    const gs1RulesResultMock = { credentialId: "MockCredentialId", credentialName: "MockCredentialName", verified: verifyStatus, errors: errors};
    return gs1RulesResultMock;
}

describe('Tests for Rules Engine Subject Field Validation', () => {

    it('should return externally resolved credential (Company Prefix)', async () => {
        // In line update presentation to only include the company prefix credential
        const mockPresentation  = {...mockPresentationParty, verifiableCredential: [mockCompanyPrefixCredential]};

        const urlToResolve = "https://id.gs1.org/vc/license/gs1_prefix/08";
        const result = await resolveExternalCredential(mock_getExternalCredential, mockPresentation, urlToResolve);

        expect(result.inPresentation).toBe(false);
        expect(result.credential).toBeDefined();
    })

    it('should return externally resolved credential (Organization)', async () => {
        const urlToResolve = "http://did-vc.gs1us.org/vc/license/08600057694";
        const result = await resolveExternalCredential(mock_getExternalCredential, mockPresentationParty, urlToResolve);

        expect(result.inPresentation).toBe(true);
        expect(result.credential).toBeDefined();
    })

    it('should throw error for externally credential that can not be resolved', async () => {
          const urlToResolve = "https://mock-credential";
          const expectedError = `External Credential "${urlToResolve}" can not be resolved.`;

          const result = await resolveExternalCredential(mock_getExternalCredential, mockPresentationParty, urlToResolve);
          expect(result.credential).toBeUndefined();
          expect(result.error?.length).toBeGreaterThan(0);
          expect(result.error).toBe(expectedError);
    })
  
    it('should throw error for externally credential (undefined) that can not be resolved', async () => {
        const urlToResolve = undefined;
        const expectedError = `External Credential "${urlToResolve}" can not be resolved.`;
        
        const result = await resolveExternalCredential(mock_getExternalCredential, mockPresentationParty, urlToResolve);
        expect(result.credential).toBeUndefined();
        expect(result.error?.length).toBeGreaterThan(0);
        expect(result.error).toBe(expectedError);
    })

    it('should build credential chain for Company Prefix', async () => {
        // In line update presentation to only include the company prefix credential
        const mockPresentation  = {...mockPresentationParty, verifiableCredential: [mockCompanyPrefixCredential]};
        const result = await buildCredentialChain(mock_getExternalCredential, mockPresentation, mockCompanyPrefixCredential);
        expect(result.schema).toBeDefined();
    })

    it('should build credential chain for Company Prefix and extended License Prefix Credential', async () => {
        // In line update presentation to only include the company prefix credential
        const mockPresentation  = {...mockPresentationParty, verifiableCredential: [mockCompanyPrefixCredential]};
        const result = await buildCredentialChain(mock_getExternalCredential, mockPresentation, mockCompanyPrefixCredential);

        expect(result.extendedCredentialChain).toBeDefined();
        expect(result.extendedCredentialChain?.inPresentation).toBe(false);
    })

    it('should build credential chain for Organization Party with extended credentials', async () => {
        const mockOrganizationCredential = mockPresentationParty.verifiableCredential[2];
        const result = await buildCredentialChain(mock_getExternalCredential, mockPresentationParty, mockOrganizationCredential);

        expect(result.extendedCredentialChain).toBeDefined();
        expect(result.extendedCredentialChain?.inPresentation).toBe(true);
    })

    it('should not build credential chain for Generic Non GS1 Credential', async () => {
        const mockCredentialNotGS1  = mockGenericCredential.verifiableCredential[0];
        const result = await buildCredentialChain(mock_getExternalCredential, mockGenericCredential, mockCredentialNotGS1);
        const resultSchema = result.schema;

        expect(resultSchema).toBeDefined();
        expect(resultSchema.title).toBe("genericCredentialSchema");
    })

    it('should validate credential chain for Company Prefix and extended License Prefix Credential', async () => {
        // In line update presentation to only include the company prefix credential
        const mockPresentation  = {...mockPresentationParty, verifiableCredential: [mockCompanyPrefixCredential]};
        const resultBuildChain = await buildCredentialChain(mock_getExternalCredential, mockPresentation, mockCompanyPrefixCredential);

        const result = await validateCredentialChain(mock_checkExternalCredential, resultBuildChain, true);
        expect(result.verified).toBe(true);
    })
    
    it('should not validate credential chain for Company Prefix because credential can not be verified', async () => {
        // In line update presentation to only include the company prefix credential
        const mockPresentation  = {...mockPresentationParty, verifiableCredential: [mockCompanyPrefixCredential]};
        const resultBuildChain = await buildCredentialChain(mock_getExternalCredential, mockPresentation, mockCompanyPrefixCredential);

        // Mock Overrides for Testing Different Scenarios
        resultBuildChain.inPresentation = false;
        resultBuildChain.credential.id =  "mockCredentialId_Fail";

        const result = await validateCredentialChain(mock_checkExternalCredential, resultBuildChain, true);
        expect(result.verified).toBe(false);
    })

    it('should not validate credential chain for Company Prefix because parent type is invalid', async () => {
        // In line update presentation to only include the company prefix credential
        const mockPresentation  = {...mockPresentationParty, verifiableCredential: [mockCompanyPrefixCredential]};
        const resultBuildChain = await buildCredentialChain(mock_getExternalCredential, mockPresentation, mockCompanyPrefixCredential);

        // Mock Overrides for Testing Different Scenarios
        const schemaSubject = resultBuildChain.credentialSubjectSchema as CredentialSubjectSchema;
        if (schemaSubject && schemaSubject.extendsCredentialType) {
            schemaSubject.extendsCredentialType.type = ["mock"];
        }

        const result = await validateCredentialChain(mock_checkExternalCredential, resultBuildChain, true);
        expect(result.verified).toBe(false);
    })

    it('should not validate credential chain for Company Prefix because child type is invalid', async () => {
        // In line update presentation to only include the company prefix credential
        const mockPresentation  = {...mockPresentationParty, verifiableCredential: [mockCompanyPrefixCredential]};

        // Mock Overrides for Testing Different Scenarios
        mockPresentation.verifiableCredential[0].type = ["mock"];

        const resultBuildChain = await buildCredentialChain(mock_getExternalCredential, mockPresentation, mockCompanyPrefixCredential);
        const result = await validateCredentialChain(mock_checkExternalCredential, resultBuildChain, true);
        expect(result.verified).toBe(false);
    })
    
    it('should return valid when checking organization (party) Credential chain', async () => {
        const mockKeyCredential = mockPresentationParty.verifiableCredential[1];
        const resultBuildChain = await buildCredentialChain(mock_getExternalCredential, mockPresentationParty, mockKeyCredential);

        const result = await validateExtendedCompanyPrefixCredential("GS1CompanyPrefixLicenseCredential", resultBuildChain);
        expect(result.verified).toBe(true);
    })

    it('should return invalid when checking organization (party) Credential chain and extended credential is undefined', async () => {
        const mockKeyCredential = mockPresentationParty.verifiableCredential[1];
        const resultBuildChain = await buildCredentialChain(mock_getExternalCredential, mockPresentationParty, mockKeyCredential);
        resultBuildChain.extendedCredentialChain = undefined;

        const result = await validateExtendedCompanyPrefixCredential("GS1CompanyPrefixLicenseCredential", resultBuildChain);
        expect(result.verified).toBe(false);
    })

    it('should return invalid when checking organization (party) Credential chain with different issuer', async () => {
        const mockKeyCredential = {...mockPresentationParty.verifiableCredential[1], issuer: { id: "did:web:www.test.com" }};
        const resultBuildChain = await buildCredentialChain(mock_getExternalCredential, mockPresentationParty, mockKeyCredential);
        resultBuildChain.extendedCredentialChain = undefined;

        const result = await validateExtendedCompanyPrefixCredential("GS1CompanyPrefixLicenseCredential", resultBuildChain);
        expect(result.verified).toBe(false);
    })

    it('should return invalid when checking organization (party) Credential chain with different subject id', async () => {
        // Override the subject id to be different locally to the test
        const jsonKeyCredential = JSON.stringify(mockPresentationParty.verifiableCredential[1]);
        const mockKeyCredential = JSON.parse(jsonKeyCredential);
        mockKeyCredential.credentialSubject.id = "https://id.gs1.org/417/7360005769407";

        const resultBuildChain = await buildCredentialChain(mock_getExternalCredential, mockPresentationParty, mockKeyCredential);

        const result = await validateExtendedCompanyPrefixCredential("GS1CompanyPrefixLicenseCredential", resultBuildChain);
        expect(result.verified).toBe(false);
    })

    it('should return valid when checking organization (party) Credential against data credential', async () => {
        const mockDataCredential = mockPresentationParty.verifiableCredential[2];
        const resultBuildChain: credentialChainMetaData = await buildCredentialChain(mock_getExternalCredential, mockPresentationParty, mockDataCredential);

        const result = await validateExtendedKeyDataCredential("KeyCredential", resultBuildChain);
        expect(result.verified).toBe(true);
    })

    it('should return true when comparing company prefix in key credential license value', async () => {
        const keyCredentialValue = "0860005769407";
        const companyPrefixValue = "08600057694";

        const result = compareLicenseValue(keyCredentialValue, companyPrefixValue);
        expect(result).toBe(true);
    })

    it('should return true when comparing company prefix in key credential license value with one padded zeros', async () => {
        const keyCredentialValue = "00860005769407";
        const companyPrefixValue = "08600057694";

        const result = compareLicenseValue(keyCredentialValue, companyPrefixValue);
        expect(result).toBe(true);
    })

    it('should return true when comparing company prefix in key credential license value with several padded zeros', async () => {
        const keyCredentialValue = "00000860005769407";
        const companyPrefixValue = "08600057694";

        const result = compareLicenseValue(keyCredentialValue, companyPrefixValue);
        expect(result).toBe(true);
    })

    it('should return false when comparing company prefix in key credential license value with incorrect key credential', async () => {
        const keyCredentialValue = "007600057694";
        const companyPrefixValue = "08600057694";

        const result = compareLicenseValue(keyCredentialValue, companyPrefixValue);
        expect(result).toBe(false);
    })

})

