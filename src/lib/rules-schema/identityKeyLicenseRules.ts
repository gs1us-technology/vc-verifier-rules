import { gs1CredentialSchema } from "./rules-schema-types";

// JSON Schema for GS1 Company Prefix Credential Validation Rules
export const identityKeyLicenseRuleSchema: gs1CredentialSchema = {
    "$id": "GS1-Identification-Key-License-Schema",
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "version": "1.0.0",
    "description": "GS1 Identity Key License Credential",
    "type": "object",
    "credentialType": "GS1IdentificationKeyLicenseCredential",
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
            "type": "alternativeLicenseIdentityKeyValue"
          },
          "identificationKeyType": {
            "type": "identificationKeyType"
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
          "identificationKeyType",
          "extendsCredential"
        ]
      }
    }
  }