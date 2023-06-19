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
export type gs1CredentialSchema = {
    "$id": string;
    "$schema": string;
    version: string;
    description: string;
    type: string;
    credentialType:string;
    properties: gs1CredentialSchemaProperty | undefined;
}