import { gs1CredentialSchema } from "./rules-schema-types";

// JSON Schema for Generic Credential Validation Rules
export const genericCredentialSchema: gs1CredentialSchema = {
    "$id": "Generic-Schema",
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "version": "1.0.0",
    "description": "Generic Credential",
    "type": "object",
    "credentialType": "genericCredentialSchema",
    "properties": undefined
}
