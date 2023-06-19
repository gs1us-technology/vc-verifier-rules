import { gs1CredentialSchema } from "./rules-schema-types";

// -----------------------------------------------------------
// Updated Extended Credential Chain for Product Data Credential
// -----------------------------------------------------------

// JSON Schema for GS1 Company Prefix Credential Validation Rules
export const productDataRuleSchema: gs1CredentialSchema = {
    "$id": "GS1-Product-Data-Schema",
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "version": "1.0.0",
    "description": "GS1 Product Data Credential",
    "type": "object",
    "credentialType": "ProductDataCredential",
    "properties": {
      "credentialSubject": {
        "type": "object",
        "properties": {
          "id": {
            "type": "credentialSubjectId"
          },
          "sameAs": {
            "type": "digitalLinkSameAs"
          },
          "product": {
            "type": "product"
          },
        },
        "extendsCredentialType": {
          "type": ["KeyCredential"],
          "rule": "KeyDataCredential"
        },
        "required": [
          "id",
          "keyAuthorization",
          "product"
        ]
      }
    }
  }