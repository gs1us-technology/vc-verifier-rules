import { gs1CredentialSchema } from "./rules-schema-types";

// -----------------------------------------------------------
// Updated Extended Credential Chain for Organizations
// -----------------------------------------------------------

// JSON Schema for GS1 Company Prefix Credential Validation Rules
export const organizationDataRuleSchema: gs1CredentialSchema = {
    "$id": "GS1-Organization-Data-Schema",
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "version": "1.0.0",
    "description": "GS1 Organization Data Credential",
    "type": "object",
    "credentialType": "OrganizationDataCredential",
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
          "sameAs": {
            "type": "digitalLinkSameAs"
          }
        },
        "extendsCredentialType": {
          "type": ["KeyCredential"],
          "rule": "KeyCredential"
        },
        "required": [
          "id",
          "organization",
          "keyAuthorization"
        ]
      }
    }
  }