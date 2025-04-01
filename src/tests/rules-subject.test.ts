import { getCredentialRuleSchema } from '../lib/get-credential-type';
import { checkPrefixCredentialLicenseValue } from '../lib/rules-definition/subject/check-credential-license';
import { checkCredentialSameAsDigitalLink, checkCredentialSubjectIdDigitalLink, parseGS1DigitalLink } from '../lib/rules-definition/subject/check-credential-subject-Id-digital-link';
import { checkSchema } from '../lib/schema/validate-schema';
import { getDecodedPresentation } from '../lib/utility/jwt-utils';
import { mock_jsonSchemaLoader } from './mock-data';
import { mockJoseCredentialPresentationProductJwt } from './mock-jose-credential';

const getMockCredentialFromPresentation = function(presentation: string, indexValue: number) { 
  const presentationToVerify = getDecodedPresentation(presentation);
  const mockCredential = presentationToVerify.verifiableCredential[indexValue];
  return mockCredential;
};


describe('Tests for Rules Engine Subject Field Validation', () => {

  it('should return verified for 4 character license value', async () => {
    const mockCompanyPrefixCredential = getMockCredentialFromPresentation(mockJoseCredentialPresentationProductJwt, 0);
    mockCompanyPrefixCredential.credentialSubject.licenseValue = "0562";
    mockCompanyPrefixCredential.credentialSubject.alternativeLicenseValue = "562";
 
    const credentialSchema = getCredentialRuleSchema(mock_jsonSchemaLoader, mockCompanyPrefixCredential, true);
    const result = await checkSchema(credentialSchema, mockCompanyPrefixCredential);
    expect(result.verified).toBe(true);
    expect(result.errors.length).toBe(0);
  })

  it('should return verified for 14 character license value', async () => {
 
    const mockCompanyPrefixCredential = getMockCredentialFromPresentation(mockJoseCredentialPresentationProductJwt, 0);
    mockCompanyPrefixCredential.credentialSubject.licenseValue = "123456789012";
    mockCompanyPrefixCredential.credentialSubject.alternativeLicenseValue = undefined
 
    const credentialSchema = getCredentialRuleSchema(mock_jsonSchemaLoader, mockCompanyPrefixCredential, true);
    const result = await checkSchema(credentialSchema, mockCompanyPrefixCredential);
    expect(result.verified).toBe(true);
    expect(result.errors.length).toBe(0);
  })

  it('should return not verified for undefined license value', async () => {
      const mockCompanyPrefixCredential = getMockCredentialFromPresentation(mockJoseCredentialPresentationProductJwt, 0);
      mockCompanyPrefixCredential.credentialSubject.licenseValue = undefined;
   
      const credentialSchema = getCredentialRuleSchema(mock_jsonSchemaLoader, mockCompanyPrefixCredential, true);
      const result = await checkSchema(credentialSchema, mockCompanyPrefixCredential);
      expect(result.verified).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
  })

  it('should return not verified for null license value', async () => {
    const mockCompanyPrefixCredential = getMockCredentialFromPresentation(mockJoseCredentialPresentationProductJwt, 0);
    mockCompanyPrefixCredential.credentialSubject.licenseValue = null;
 
    const credentialSchema = getCredentialRuleSchema(mock_jsonSchemaLoader, mockCompanyPrefixCredential, true);
    const result = await checkSchema(credentialSchema, mockCompanyPrefixCredential);
    expect(result.verified).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  }) 

  it('should return not verified for non number license value', async () => {
    const mockCompanyPrefixCredential = getMockCredentialFromPresentation(mockJoseCredentialPresentationProductJwt, 0);
    mockCompanyPrefixCredential.credentialSubject.licenseValue = "zebra";
 
    const credentialSchema = getCredentialRuleSchema(mock_jsonSchemaLoader, mockCompanyPrefixCredential, true);
    const result = await checkSchema(credentialSchema, mockCompanyPrefixCredential);
    expect(result.verified).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  }) 

  it('should return verified for 2 character prefix license value', async () => {
    const credentialSubject = { licenseValue: "12" };
    const result = await checkPrefixCredentialLicenseValue(credentialSubject);
    expect(result.verified).toBe(true);
    expect(result.rule).toBeUndefined();
  })

  it('should return verified for 4 character prefix license value', async () => {
    const credentialSubject = { licenseValue: "1234" };
    const result = await checkPrefixCredentialLicenseValue(credentialSubject);
    expect(result.verified).toBe(true);
    expect(result.rule).toBeUndefined();
  })

  it('should return not verified for 5 character prefix license value', async () => {
    const credentialSubject = { licenseValue: "12345" };
    const result = await checkPrefixCredentialLicenseValue(credentialSubject);
    expect(result.verified).toBe(false);
    expect(result.rule).toBeDefined();
  }) 

  it('should return verified for properly alternate license value', async () => {
    const mockCompanyPrefixCredential = getMockCredentialFromPresentation(mockJoseCredentialPresentationProductJwt, 0);
    mockCompanyPrefixCredential.credentialSubject.licenseValue = "08600057694";
    mockCompanyPrefixCredential.credentialSubject.alternativeLicenseValue = "8600057694";
 
    const credentialSchema = getCredentialRuleSchema(mock_jsonSchemaLoader, mockCompanyPrefixCredential, true);
    const result = await checkSchema(credentialSchema, mockCompanyPrefixCredential);
    expect(result.verified).toBe(true);
    expect(result.errors.length).toBe(0);
  }) 

  it('should return not verified for undefined alternate license value', async () => {
    const mockCompanyPrefixCredential = getMockCredentialFromPresentation(mockJoseCredentialPresentationProductJwt, 0);
    mockCompanyPrefixCredential.credentialSubject.licenseValue = "08600057694";
    mockCompanyPrefixCredential.credentialSubject.alternativeLicenseValue = undefined;
 
    const credentialSchema = getCredentialRuleSchema(mock_jsonSchemaLoader, mockCompanyPrefixCredential, true);
    const result = await checkSchema(credentialSchema, mockCompanyPrefixCredential);
    expect(result.verified).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  }) 
 
  it('should return not verified for incorrect alternate license value', async () => {
    const mockCompanyPrefixCredential = getMockCredentialFromPresentation(mockJoseCredentialPresentationProductJwt, 0);
    mockCompanyPrefixCredential.credentialSubject.licenseValue = "08600057694";
    mockCompanyPrefixCredential.credentialSubject.alternativeLicenseValue = "18600057694";
 
    const credentialSchema = getCredentialRuleSchema(mock_jsonSchemaLoader, mockCompanyPrefixCredential, true);
    const result = await checkSchema(credentialSchema, mockCompanyPrefixCredential);
    expect(result.verified).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  }) 

  it('should return not verified for alternate license value starting with zero', async () => {
    const mockCompanyPrefixCredential = getMockCredentialFromPresentation(mockJoseCredentialPresentationProductJwt, 0);
    mockCompanyPrefixCredential.credentialSubject.licenseValue = "08600057694";
    mockCompanyPrefixCredential.credentialSubject.alternativeLicenseValue = "08600057694";
 
    const credentialSchema = getCredentialRuleSchema(mock_jsonSchemaLoader, mockCompanyPrefixCredential, true);
    const result = await checkSchema(credentialSchema, mockCompanyPrefixCredential);
    expect(result.verified).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  }) 

  it('should return verified for Organization', async () => {
      const organization = { 
          "gs1:partyGLN": "0860005769407",
          "gs1:organizationName": "Healthy Tots"
      };

      const mockCompanyPrefixCredential = getMockCredentialFromPresentation(mockJoseCredentialPresentationProductJwt, 0);
      mockCompanyPrefixCredential.credentialSubject.organization = organization
   
      const credentialSchema = getCredentialRuleSchema(mock_jsonSchemaLoader, mockCompanyPrefixCredential, true);
      const result = await checkSchema(credentialSchema, mockCompanyPrefixCredential);
      expect(result.verified).toBe(true);
      expect(result.errors.length).toBe(0);

    }) 

    it('should return not verified for Organization when name is missing', async () => {
      const organization = { 
        "gs1:partyGLN": "0860005769407",
        "gs1:organizationName": undefined
    };

    const mockCompanyPrefixCredential = getMockCredentialFromPresentation(mockJoseCredentialPresentationProductJwt, 0);
    mockCompanyPrefixCredential.credentialSubject.organization = organization;
 
    const credentialSchema = getCredentialRuleSchema(mock_jsonSchemaLoader, mockCompanyPrefixCredential, true);
    const result = await checkSchema(credentialSchema, mockCompanyPrefixCredential);
    expect(result.verified).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  }) 

    it('should return not verified for Organization when partyGLN is missing', async () => {
      const organization = { 
          "gs1:partyGLN": undefined,
          "gs1:organizationName": "Healthy Tots"
      };

      const mockCompanyPrefixCredential = getMockCredentialFromPresentation(mockJoseCredentialPresentationProductJwt, 0);
      mockCompanyPrefixCredential.credentialSubject.organization = organization
  
      const credentialSchema = getCredentialRuleSchema(mock_jsonSchemaLoader,  mockCompanyPrefixCredential, true);
      const result = await checkSchema(credentialSchema, mockCompanyPrefixCredential);
      expect(result.verified).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    }) 

    it('should return not verified for Organization when all fields are missing', async () => {
      const organization = { 
        "gs1:partyGLN": undefined,
        "gs1:organizationName": undefined
    };

    const mockCompanyPrefixCredential = getMockCredentialFromPresentation(mockJoseCredentialPresentationProductJwt, 0);
    mockCompanyPrefixCredential.credentialSubject.organization = organization;

    const credentialSchema = getCredentialRuleSchema(mock_jsonSchemaLoader, mockCompanyPrefixCredential, true);
    const result = await checkSchema(credentialSchema, mockCompanyPrefixCredential);
    expect(result.verified).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);

  }) 

    it('should return not verified for Organization node is undefined', async () => {
      const organization = undefined;

    const mockCompanyPrefixCredential = getMockCredentialFromPresentation(mockJoseCredentialPresentationProductJwt, 0);
    mockCompanyPrefixCredential.credentialSubject.organization = organization

    const credentialSchema = getCredentialRuleSchema(mock_jsonSchemaLoader, mockCompanyPrefixCredential, true);
    const result = await checkSchema(credentialSchema, mockCompanyPrefixCredential);
    expect(result.verified).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    }) 

    it('should return verified for Product', async () => {
      const product = {
        "gs1:brand": { "gs1:brandName": "Healthy Tots Baby Food" },
        "gs1:productDescription": "Healthy Tots Baby Food"
      }

      const mockProductDataCredential = getMockCredentialFromPresentation(mockJoseCredentialPresentationProductJwt, 2);
      mockProductDataCredential.credentialSubject.product = product;

      const credentialSchema = getCredentialRuleSchema(mock_jsonSchemaLoader, mockProductDataCredential, true);
      const result = await checkSchema(credentialSchema, mockProductDataCredential);
      expect(result.verified).toBe(true);
      expect(result.errors.length).toBe(0);
    }) 

    it('should return not verified for Product when brand is missing', async () => {
      const product = {
        "gs1:brand": undefined,
        "gs1:productDescription": "Healthy Tots Baby Food"
      }

      const mockProductDataCredential = getMockCredentialFromPresentation(mockJoseCredentialPresentationProductJwt, 2);
      mockProductDataCredential.credentialSubject.product = product;

      const credentialSchema = getCredentialRuleSchema(mock_jsonSchemaLoader, mockProductDataCredential, true);
      const result = await checkSchema(credentialSchema, mockProductDataCredential);

      expect(result.verified).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    }) 

    it('should return not verified for Product when description is missing', async () => {
      const product = {
        "gs1:brand": { "gs1:brandName": "Healthy Tots Baby Food" },
        "gs1:productDescription": undefined
      }

      const mockProductDataCredential = getMockCredentialFromPresentation(mockJoseCredentialPresentationProductJwt, 2);
      mockProductDataCredential.credentialSubject.product = product;

      const credentialSchema = getCredentialRuleSchema(mock_jsonSchemaLoader, mockProductDataCredential, true);
      const result = await checkSchema(credentialSchema, mockProductDataCredential);
      expect(result.verified).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    }) 

    it('should return not verified for Product when all fields are missing', async () => {
      const product = {
        "gs1:brand": undefined,
        "gs1:productDescription": undefined
      }

      const mockProductDataCredential = getMockCredentialFromPresentation(mockJoseCredentialPresentationProductJwt, 2);
      mockProductDataCredential.credentialSubject.product = product;

      const credentialSchema = getCredentialRuleSchema(mock_jsonSchemaLoader, mockProductDataCredential, true);
      const result = await checkSchema(credentialSchema, mockProductDataCredential);
      expect(result.verified).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    }) 

    it('should return not verified for Product node is undefined', async () => {
      const mockProductDataCredential = getMockCredentialFromPresentation(mockJoseCredentialPresentationProductJwt, 2);
      mockProductDataCredential.credentialSubject.product = undefined;

      const credentialSchema = getCredentialRuleSchema(mock_jsonSchemaLoader, mockProductDataCredential, true);
      const result = await checkSchema(credentialSchema, mockProductDataCredential);
      expect(result.verified).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    }) 

    it('should return verified for Subject Id', async () => {
      const credentialSubjectId = "did:web:www.healthytots.com";

      const mockCompanyPrefixCredential = getMockCredentialFromPresentation(mockJoseCredentialPresentationProductJwt, 0);
      mockCompanyPrefixCredential.credentialSubject.id = credentialSubjectId;
   
      const credentialSchema = getCredentialRuleSchema(mock_jsonSchemaLoader, mockCompanyPrefixCredential, true);
      const result = await checkSchema(credentialSchema, mockCompanyPrefixCredential);
      expect(result.verified).toBe(true);
      expect(result.errors.length).toBe(0);
    }) 

    it('should return not verified for non URI Subject Id', async () => {
      const credentialSubjectId = "healthytots";

      const mockCompanyPrefixCredential = getMockCredentialFromPresentation(mockJoseCredentialPresentationProductJwt, 0);
      mockCompanyPrefixCredential.credentialSubject.id = credentialSubjectId;
   
      const credentialSchema = getCredentialRuleSchema(mock_jsonSchemaLoader, mockCompanyPrefixCredential, true);
      const result = await checkSchema(credentialSchema, mockCompanyPrefixCredential);
      expect(result.verified).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    }) 

    it('should return not verified for missing Subject Id', async () => {
      const credentialSubjectId = undefined;

      const mockCompanyPrefixCredential = getMockCredentialFromPresentation(mockJoseCredentialPresentationProductJwt, 0);
      mockCompanyPrefixCredential.credentialSubject.id = credentialSubjectId;
   
      const credentialSchema = getCredentialRuleSchema(mock_jsonSchemaLoader, mockCompanyPrefixCredential);
      const result = await checkSchema(credentialSchema, mockCompanyPrefixCredential);
      expect(result.verified).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    }) 

    it('should return verified for Subject Id is DigitalLink', async () => {
      const credentialSubject = { id: "https://id.gs1.org/417/0860005769407" };

      const result = await checkCredentialSubjectIdDigitalLink(credentialSubject);
      expect(result.verified).toBe(true);
      expect(result.rule).toBeUndefined();
    }) 

    it('should return non verified for Subject Id is not a valid DigitalLink', async () => {
      const credentialSubject = { id: "https://id.gs1.org/0860005769407" };

      const result = await checkCredentialSubjectIdDigitalLink(credentialSubject);
      expect(result.verified).toBe(false);
      expect(result.rule).toBeDefined();
    }) 
    
    it('should return non verified for Subject Id is a number not a valid DigitalLink', async () => {
      const credentialSubject = { id: "0860005769407" };

      const result = await checkCredentialSubjectIdDigitalLink(credentialSubject);
      expect(result.verified).toBe(false);
      expect(result.rule).toBeDefined();
    }) 

    it('should return non verified for Subject Id is a undefined not a valid DigitalLink', async () => {
      const credentialSubject = { id: undefined};

      const result = await checkCredentialSubjectIdDigitalLink(credentialSubject);
      expect(result.verified).toBe(false);
      expect(result.rule).toBeDefined();
    }) 

    it('should return non verified for Subject is a undefined (Id) not a valid DigitalLink', async () => {
      const credentialSubject = undefined;

      const result = await checkCredentialSubjectIdDigitalLink(credentialSubject);
      expect(result.verified).toBe(false);
      expect(result.rule).toBeDefined();
    }) 

    it('should return verified for Subject sameAs is DigitalLink', async () => {
      const credentialSubject = { sameAs: "https://id.gs1.org/417/0860005769407" };

      const result = await checkCredentialSameAsDigitalLink(credentialSubject);
      expect(result.verified).toBe(true);
      expect(result.rule).toBeUndefined();
    }) 

    it('should return non verified for Subject sameAs is not a valid DigitalLink', async () => {
      const credentialSubject = { sameAs: "https://id.gs1.org/0860005769407" };

      const result = await checkCredentialSameAsDigitalLink(credentialSubject);
      expect(result.verified).toBe(false);
      expect(result.rule).toBeDefined();
    }) 
    
    it('should return non verified for Subject sameAs is a number not a valid DigitalLink', async () => {
      const credentialSubject = { sameAs: "0860005769407" };

      const result = await checkCredentialSameAsDigitalLink(credentialSubject);
      expect(result.verified).toBe(false);
      expect(result.rule).toBeDefined();
    }) 

    it('should return verified for Subject sameAs is a undefined because the field is optional', async () => {
      const credentialSubject = { sameAs: undefined};

      const result = await checkCredentialSameAsDigitalLink(credentialSubject);
      expect(result.verified).toBe(true);
      expect(result.rule).toBeUndefined();
    }) 

    it('should return verified for Subject is a undefined (sameAs) because the field is optional', async () => {
      const credentialSubject = undefined;

      const result = await checkCredentialSameAsDigitalLink(credentialSubject);
      expect(result.verified).toBe(true);
      expect(result.rule).toBeUndefined();
    }) 

    it('should return valid for parsing GS1 Digital Link', async () => {
      const credentialSubject = "https://id.gs1.org/417/0860005769407";

      const result = await parseGS1DigitalLink(credentialSubject);
      expect(result.isValid).toBe(true);
      expect(result.parsedValue).toBe("0860005769407");
    }) 

    it('should return not valid (undefined) for parsing GS1 Digital Link', async () => {
      const credentialSubject = undefined;

      const result = await parseGS1DigitalLink(credentialSubject);
      expect(result.isValid).toBe(false);
      expect(result.type).toBe("Unknown");
    }) 
    
    it('should return not valid for incorrectly defined GS1 Digital Link', async () => {
      const credentialSubject = "https://id.gs1.org/0860005769407"

      const result = await parseGS1DigitalLink(credentialSubject);
      expect(result.isValid).toBe(false);
      expect(result.type).toBe("Unknown");
    }) 


  })

