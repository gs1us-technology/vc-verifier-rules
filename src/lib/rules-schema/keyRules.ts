import { gs1CredentialSchema } from "./rules-schema-types";

// JSON Schema for GS1 Company Prefix Credential Validation Rules
export const keyRuleSchema: gs1CredentialSchema = {
    "$id": "GS1-Key-Schema",
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "version": "1.0.0",
    "description": "GS1 KeyCredential",
    "type": "object",
    "credentialType": "KeyCredential",
    "properties": {
      "credentialSubject": {
        "type": "object",
        "properties": {
          "id": {
            "type": "digitalLink"
          }
        },
        "extendsCredentialType": {
          "type": ["GS1CompanyPrefixLicenseCredential", "GS1IdentificationKeyLicenseCredential"],
          "rule": "GS1CompanyPrefixLicenseCredential",
        },
        "childCredential": {
          "type": ["OrganizationDataCredential", "ProductDataCredential"],
        },
        "required": [
          "id",
          "extendsCredential"
        ]
      }
    }
  }
