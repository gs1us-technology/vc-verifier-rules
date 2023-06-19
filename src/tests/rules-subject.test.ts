import { checkCredentialAlternativeLicenseValue } from '../lib/rules-definition/subject/check-credential-alternative-license';
import { checkCredentialLicenseValue, checkPrefixCredentialLicenseValue } from '../lib/rules-definition/subject/check-credential-license';
import { checkCredentialOrganization } from '../lib/rules-definition/subject/check-credential-organization';
import { checkCredentialProduct } from '../lib/rules-definition/subject/check-credential-product';
import { checkCredentialSubjectId } from '../lib/rules-definition/subject/check-credential-subject-Id';
import { checkCredentialSameAsDigitalLink, checkCredentialSubjectIdDigitalLink, parseGS1DigitalLink } from '../lib/rules-definition/subject/check-credential-subject-Id-digital-link';
import { checkIdentityKeyTypeValue } from '../lib/rules-definition/subject/check-identification-key-type';

describe('Tests for Rules Engine Subject Field Validation', () => {

  it('should return verified for 3 character license value', async () => {
        const credentialSubject = { licenseValue: "123" };
        const result = await checkCredentialLicenseValue(credentialSubject);
        expect(result.verified).toBe(true);
        expect(result.rule).toBeUndefined();
  })

  it('should return verified for 14 character license value', async () => {
    const credentialSubject = { licenseValue: "12345678901234" };
    const result = await checkCredentialLicenseValue(credentialSubject);
    expect(result.verified).toBe(true);
    expect(result.rule).toBeUndefined();
  })

  it('should return not verified for undefined license value', async () => {
      const credentialSubject = { licenseValue: undefined };
      const result = await checkCredentialLicenseValue(credentialSubject);
      expect(result.verified).toBe(false);
      expect(result.rule).toBeDefined();
  })

  it('should return not verified for null license value', async () => {
    const credentialSubject = { licenseValue: null };
    const result = await checkCredentialLicenseValue(credentialSubject);
    expect(result.verified).toBe(false);
    expect(result.rule).toBeDefined();
  }) 

  it('should return not verified for non number license value', async () => {
    const credentialSubject = { licenseValue: "zebra" };
    const result = await checkCredentialLicenseValue(credentialSubject);
    expect(result.verified).toBe(false);
    expect(result.rule).toBeDefined();
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
    const credentialSubject = { licenseValue: "08600057694", alternativeLicenseValue: "8600057694"};
    const result = await checkCredentialAlternativeLicenseValue(credentialSubject);
    expect(result.verified).toBe(true);
    expect(result.rule).toBeUndefined();
  }) 

  it('should return verified for properly alternate license value', async () => {
    const credentialSubject = { licenseValue: "08600057694", alternativeLicenseValue: "8600057694"};
    const result = await checkCredentialAlternativeLicenseValue(credentialSubject);
    expect(result.verified).toBe(true);
    expect(result.rule).toBeUndefined();
  }) 

  it('should return not verified for undefined alternate license value', async () => {
    const credentialSubject = { licenseValue: "08600057694", alternativeLicenseValue: undefined};
    const result = await checkCredentialAlternativeLicenseValue(credentialSubject);
    expect(result.verified).toBe(false);
    expect(result.rule).toBeDefined();
  }) 
 
  it('should return not verified for incorrect alternate license value', async () => {
    const credentialSubject = { licenseValue: "08600057694", alternativeLicenseValue: "18600057694"};
    const result = await checkCredentialAlternativeLicenseValue(credentialSubject);
    expect(result.verified).toBe(false);
    expect(result.rule).toBeDefined();
  }) 

  it('should return not verified for alternate license value starting with zero', async () => {
    const credentialSubject = { licenseValue: "08600057694", alternativeLicenseValue: "08600057694"};
    const result = await checkCredentialAlternativeLicenseValue(credentialSubject);
    expect(result.verified).toBe(false);
    expect(result.rule).toBeDefined();
  }) 

  it('should return verified for Organization', async () => {
      const credentialSubject = { 
          organization: {
            "gs1:partyGLN": "0860005769407",
            "gs1:organizationName": "Healthy Tots"
          }
      };

      const result = await checkCredentialOrganization(credentialSubject);
      expect(result.verified).toBe(true);
      expect(result.rule).toBeUndefined();
    }) 

    it('should return not verified for Organization when name is missing', async () => {
      const credentialSubject = { 
          organization: {
            "gs1:partyGLN": "0860005769407",
            "gs1:organizationName": undefined
          }
      };

      const result = await checkCredentialOrganization(credentialSubject);
      expect(result.verified).toBe(false);
      expect(result.rule).toBeDefined();
    }) 

    it('should return not verified for Organization when partyGLN is missing', async () => {
      const credentialSubject = { 
          organization: {
            "gs1:partyGLN": undefined,
            "gs1:organizationName": "Healthy Tots"
          }
      };

      const result = await checkCredentialOrganization(credentialSubject);
      expect(result.verified).toBe(false);
      expect(result.rule).toBeDefined();
    }) 

    it('should return not verified for Organization when all fields are missing', async () => {
      const credentialSubject = { 
          organization: {
            "gs1:partyGLN": undefined,
            "gs1:organizationName": undefined
          }
      };

      const result = await checkCredentialOrganization(credentialSubject);
      expect(result.verified).toBe(false);
      expect(result.rule).toBeDefined();
    }) 

    it('should return not verified for Organization node is undefined', async () => {
      const credentialSubject = undefined;

      const result = await checkCredentialOrganization(credentialSubject);
      expect(result.verified).toBe(false);
      expect(result.rule).toBeDefined();
    }) 

    it('should return verified for Product', async () => {
      const credentialSubject = { 
          product: {
            "gs1:brand": "Healthy Tots Baby Food",
            "gs1:productDescription": "Healthy Tots Baby Food"
          }
      };

      const result = await checkCredentialProduct(credentialSubject);
      expect(result.verified).toBe(true);
      expect(result.rule).toBeUndefined();
    }) 


    it('should return not verified for Product when brand is missing', async () => {
      const credentialSubject = { 
        product: {
          "gs1:brand": undefined,
          "gs1:productDescription": "Healthy Tots Baby Food"
        }
    };

      const result = await checkCredentialProduct(credentialSubject);
      expect(result.verified).toBe(false);
      expect(result.rule).toBeDefined();
    }) 

    it('should return not verified for Product when description is missing', async () => {
      const credentialSubject = { 
        product: {
          "gs1:brand": "Healthy Tots Baby Food",
          "gs1:productDescription": undefined
        }
    };

      const result = await checkCredentialProduct(credentialSubject);
      expect(result.verified).toBe(false);
    }) 

    it('should return not verified for Product when all fields are missing', async () => {
      const credentialSubject = { 
        product: {
          "gs1:brand": undefined,
          "gs1:productDescription": undefined
        }
    };

      const result = await checkCredentialProduct(credentialSubject);
      expect(result.verified).toBe(false);
    }) 

    it('should return not verified for Product node is undefined', async () => {
      const credentialSubject = undefined;

      const result = await checkCredentialProduct(credentialSubject);
      expect(result.verified).toBe(false);
      expect(result.rule).toBeDefined();
    }) 

    it('should return verified for Subject Id', async () => {
      const credentialSubject = { id: "did:web:www.healthytots.com" };

      const result = await checkCredentialSubjectId(credentialSubject);
      expect(result.verified).toBe(true);
      expect(result.rule).toBeUndefined();
    }) 

    it('should return not verified for non URI Subject Id', async () => {
      const credentialSubject = { id: "healthytots" };

      const result = await checkCredentialSubjectId(credentialSubject);
      expect(result.verified).toBe(false);
      expect(result.rule).toBeDefined();
    }) 

    it('should return not verified for undefined Subject Id', async () => {
      const credentialSubject = { id: undefined };

      const result = await checkCredentialSubjectId(credentialSubject);
      expect(result.verified).toBe(false);
      expect(result.rule).toBeDefined();
    }) 

    it('should return not verified for missing Subject Id', async () => {
      const credentialSubject = undefined;

      const result = await checkCredentialSubjectId(credentialSubject);
      expect(result.verified).toBe(false);
      expect(result.rule).toBeDefined();
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


    it('should return verified for (GTIN) Identification Key Type', async () => {
      const credentialSubject = { identificationKeyType: "GTIN" };

      const result = await checkIdentityKeyTypeValue(credentialSubject);
      expect(result.verified).toBe(true);
      expect(result.rule).toBeUndefined();
    })

    it('should return verified for (GLN) Identification Key Type', async () => {
      const credentialSubject = { identificationKeyType: "GLN" };

      const result = await checkIdentityKeyTypeValue(credentialSubject);
      expect(result.verified).toBe(true);
      expect(result.rule).toBeUndefined();
    })

    it('should return not verified for (Unknown) Identification Key Type', async () => {
      const credentialSubject = { identificationKeyType: "Unknown" };

      const result = await checkIdentityKeyTypeValue(credentialSubject);
      expect(result.verified).toBe(false);
      expect(result.rule).toBeDefined();
    })

  })

