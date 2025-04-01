import { gs1CredentialValidationRule, gs1RulesResult, VerifiableCredential } from "../types";
import { errorResolveCredentialCode } from '../engine/gs1-credential-errors.js';
import { compileSchema } from "./ajv-gs1-extension.js";
import { gs1CredentialSchema } from "../rules-schema/rules-schema-types";
import { ErrorObject } from "ajv";

export type gs1CredentialValidationRuleError = {
  isGS1Error?: boolean,
  gs1Rule?: gs1CredentialValidationRule,
  keyword: string,
}

// Check the Verifiable Credential using the JSON Schema (schemaToValidate)
export async function checkSchema(schemaToValidate: gs1CredentialSchema, credential: VerifiableCredential) : Promise<gs1RulesResult> {

  const gs1CredentialCheck: gs1RulesResult = { credentialId: credential.id, credentialName: schemaToValidate.title ? schemaToValidate.title : "unknown", verified: true, errors: []};

  const credentialToValidate = {...credential, credentialSubject: {...credential.credentialSubject}}; 
  const ajvSchenma = compileSchema(schemaToValidate);
  const valid = ajvSchenma(credentialToValidate);
    
  if (!valid)  {
    gs1CredentialCheck.verified = false;
    ajvSchenma.errors?.forEach((error: ErrorObject) => {
      // Convert Error to Determine if its GS1 Specific Error
      const jsonSchemaError: gs1CredentialValidationRuleError = error.params as gs1CredentialValidationRuleError;

      if (jsonSchemaError.isGS1Error && jsonSchemaError.gs1Rule !== undefined) {
        gs1CredentialCheck.errors.push(jsonSchemaError.gs1Rule);
      } else {
        const jsonSchemaErrorRule = { code: errorResolveCredentialCode, rule: `${error.instancePath} ${error.message}`};
        gs1CredentialCheck.errors.push(jsonSchemaErrorRule);
      }
    });
  }

  return gs1CredentialCheck;
}