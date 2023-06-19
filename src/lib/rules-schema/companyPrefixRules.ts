import { gs1CredentialSchema } from "./rules-schema-types";

// JSON Schema for GS1 Company Prefix Credential Validation Rules
export const companyPrefixRuleSchema: gs1CredentialSchema = {
    "$id": "GS1-Company-Prefix-Schema",
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "version": "1.0.0",
    "description": "GS1 Company Prefix License Credential",
    "type": "object",
    "credentialType": "GS1CompanyPrefixLicenseCredential",
    "properties": {
      "credentialSubject": {
        "type": "object",
        "properties": {
          "id": {
            "type": "credentialSubjectId"
          },
          "organization": {
            "type": "organization"
          },
          "licenseValue": {
            "type": "license"
          },
          "alternativeLicenseValue": {
            "type": "alternativeLicense"
          },
        },
        "extendsCredentialType": {
          "type": ["GS1PrefixLicenseCredential"],
          "rule": "GS1PrefixLicenseCredential"
        },
        "childCredential": {
          "type": ["KeyCredential"]
        },
        "required": [
          "id",
          "organization",
          "licenseValue",
          "extendsCredential"
        ]
      }
    }
  }