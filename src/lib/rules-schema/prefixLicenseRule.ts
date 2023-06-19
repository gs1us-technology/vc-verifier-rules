import { gs1CredentialSchema } from "./rules-schema-types";

// JSON Schema for GS1 Prefix License Credential Validation Rules
export const prefixLicenseRuleSchema: gs1CredentialSchema = {
    "$id": "GS1-Prefix-License-Schema",
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "version": "1.0.0",
    "description": "GS1 Prefix License Credential",
    "type": "object",
    "credentialType": "GS1PrefixLicenseCredential",
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
            "type": "prefixLicense"
          },
          "alternativeLicenseValue": {
            "type": "alternativeLicense"
          },
        },
        "childCredential": {
          "type": ["GS1CompanyPrefixLicenseCredential", "GS1IdentificationKeyLicenseCredential"]
        },
        "required": [
          "id",
          "licenseValue",
        ]
      }
    }
  }