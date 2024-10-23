// Property Meta Data Type for Credential Subject Fields 
export type propertyMetaData = { 
    type: string[];
    rule?: string;
}

// Property Meta Data Type for Child Credential Types
export type propertyMetaDataTypes = { 
    type: string[];
}

// Credential Subject JSON Schema Type
// Properties is a dynamic object based on credential subject schema
export type CredentialSubjectSchema = {
    type: string;
    properties: any;
    required: string[];
    extendsCredentialType?: propertyMetaData;
    childCredential?: propertyMetaData;
}

// GS1 Credential Subject Type for JSON Schema Properties
export type gs1CredentialSchemaProperty = {
    credentialSubject: CredentialSubjectSchema;
}

// JSON Schema Type for GS1 Credential Validation Rules
// Developer Notes: properties in a schema must be a dynamic object
export type gs1CredentialSchema = {
    "$id": string;
    "$schema": string;
    credentialType?: string;
    version: string;
    description: string;
    required?: string[];
    type: string;
    title: string;
    properties: any;
}

export type gs1CredentialSchemaChain = {
    title: string;
    extendsCredentialType?: propertyMetaData;
    childCredential?: propertyMetaData;
}
