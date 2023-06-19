import { checkCredentialChainIssuers, checkCredentialIssuers, checkIssuerToSubjectId, getCredentialIssuer } from "../lib/rules-definition/chain/shared-extended";
import { CredentialSubject } from "../lib/types";
import { mockCompanyPrefixCredential, mockPresentationParty } from "./mock-credential";

describe('Tests for Rules Engine Subject Field Validation', () => {

    it('should return issuer from (Company Prefix) credential', async () => {
        const result = await getCredentialIssuer(mockCompanyPrefixCredential);
        expect(result).toBe(mockCompanyPrefixCredential.issuer);
    })

    it('should return issuer id from (Company Prefix) credential', async () => {

        // In line update credential for mocking out issuer id
        const testIssuerId = "did:web:www.test.url";
        const mockCredential  = {...mockCompanyPrefixCredential, issuer: { id: testIssuerId }};
        const result = await getCredentialIssuer(mockCredential);

        expect(result).toBe(testIssuerId);
    })

    it('should return valid when checking credential issuer id vs subject', async () => {

        // In line update credential for mocking out issuer id
        const testIssuerId = "did:web:www.test.url";
        const mockCredential  = {...mockCompanyPrefixCredential, issuer: { id: testIssuerId }};
        const mockSubject: CredentialSubject  = {...mockCompanyPrefixCredential.credentialSubject, id: testIssuerId };
        const result = await checkIssuerToSubjectId(mockCredential, mockSubject);

        expect(result.verified).toBe(true);
    })

    it('should return invalid when checking credential issuer id vs subject', async () => {

        // In line update credential for mocking out issuer id
        const testIssuerId = "did:web:www.test.url";
        const testSubjectIssuerId = "did:web:www.test.com";
        const mockCredential  = {...mockCompanyPrefixCredential, issuer: { id: testIssuerId }};
        const mockSubject: CredentialSubject  = {...mockCompanyPrefixCredential.credentialSubject, id: testSubjectIssuerId };
        const result = await checkIssuerToSubjectId(mockCredential, mockSubject);

        expect(result.verified).toBe(false);
    })

    it('should return invalid when checking credential issuer id vs undefined subject', async () => {

        // In line update credential for mocking out issuer id
        const testIssuerId = "did:web:www.test.url";
        const mockCredential  = {...mockCompanyPrefixCredential, issuer: { id: testIssuerId }};
        const result = await checkIssuerToSubjectId(mockCredential, undefined);

        expect(result.verified).toBe(false);
    })

    it('should return valid when checking credential issuer id between different credentials', async () => {

        // In line update credential for mocking out issuer id
        const testIssuerId = "did:web:www.test.url";
        const mockCredential  = {...mockCompanyPrefixCredential, issuer: { id: testIssuerId }};
        const credentialToCompare  = {...mockCredential };
        const result = await checkCredentialIssuers(mockCredential, credentialToCompare);

        expect(result).toBe(true);
    })

    it('should return invalid when checking credential issuer id between different credentials', async () => {

        // In line update credential for mocking out issuer id
        const testIssuerId = "did:web:www.test.url";
        const mockCredential  = {...mockCompanyPrefixCredential, issuer: { id: testIssuerId }};
        const testIssuerId_compare = "did:web:www.test.com";
        const credentialToCompare  = {...mockCompanyPrefixCredential, issuer: { id: testIssuerId_compare }};
        const result = await checkCredentialIssuers(mockCredential, credentialToCompare);

        expect(result).toBe(false);
    })
    
    it('should return valid when checking credential issuer id between different credentials', async () => {

        const credentialChainIssuers = {
            dataCredential: mockPresentationParty.verifiableCredential[2],
            keyCredential: mockPresentationParty.verifiableCredential[1],
            companyPrefix: mockPresentationParty.verifiableCredential[0]
        }

        const result = await checkCredentialChainIssuers(credentialChainIssuers);
        expect(result).toBe(true);
    })

    it('should return invalid when checking credential issuer id between different credentials and one of the credentials is undefined', async () => {

        const credentialChainIssuers = {
            dataCredential: mockPresentationParty.verifiableCredential[2],
            keyCredential: undefined,
            companyPrefix: mockPresentationParty.verifiableCredential[0]
        }

        const result = await checkCredentialChainIssuers(credentialChainIssuers);
        expect(result).toBe(false);
    })

    it('should return invalid when checking credential issuer id between different credentials and one of the credentials is issued by a different DID', async () => {

        // Mock Test issuer for Key Credential 
        const mockKeyCredential = {...mockPresentationParty.verifiableCredential[1], issuer: { id: "did:web:www.test.com" }};

        const credentialChainIssuers = {
            dataCredential: mockPresentationParty.verifiableCredential[2],
            keyCredential: mockKeyCredential,
            companyPrefix: mockPresentationParty.verifiableCredential[0]
        }

        const result = await checkCredentialChainIssuers(credentialChainIssuers);
        expect(result).toBe(false);
    })

})
