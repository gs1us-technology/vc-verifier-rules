import { invalidGS1DigitalLink, invalidGS1DigitalLink_sameAs } from "../../engine/gs1-credential-errors.js";
import { gs1CredentialValidationRuleResult, subjectId, subjectSameAs } from "../../gs1-rules-types.js";
import { gs1CredentialValidationRule } from "../../types.js";

export type gs1DigitalLinkValue = {
  isValid: boolean;
  type: "GLN" |"GTIN" | "Unknown";
  originalValue: string;
  parsedValue?: string;
  otherUriElements?: string[];
}

function checkForGS1DigitalLink(value: string  | undefined, validationRule: gs1CredentialValidationRule, ignoreNull: boolean) : gs1CredentialValidationRuleResult {
  if (!!!value) {
    if (ignoreNull) {
      return {verified: true};
    }
    return {verified: false, rule: validationRule};
  }

  const gs1DigitalLinkResult = parseGS1DigitalLink(value);
  return gs1DigitalLinkResult.isValid ? {verified: true} : {verified: false, rule: validationRule};
}

// Verify the Credential Subject Id is a valid GS1 Digital Link
export async function checkCredentialSubjectIdDigitalLink(credentialSubject?: subjectId): Promise<gs1CredentialValidationRuleResult> {
  return checkForGS1DigitalLink(credentialSubject?.id, invalidGS1DigitalLink, false);
}

// Verify the Credential Subject sameAs is a valid GS1 Digital Link
export async function checkCredentialSameAsDigitalLink(credentialSubject?: subjectSameAs): Promise<gs1CredentialValidationRuleResult> {
  return checkForGS1DigitalLink(credentialSubject?.sameAs, invalidGS1DigitalLink_sameAs, true);
}

// Determine the type of GS1 Digital Link
// Developer Notes: We are currently only supporting GLN and GTIN Types
export function gs1DigitalLinkType(typeValue: string) : "GLN" |"GTIN" | "Unknown" {

  if (typeValue === "01") {
    return "GTIN";
  }

  if (typeValue === "417") {
    return "GLN";
  }

  return "Unknown";
}

// parse value into GS1 Digital Link URI elements
export function parseGS1DigitalLink(value?: string) : gs1DigitalLinkValue {

  if (value != null) {
    const subjectIdNoProtocol = value.replace("https://", "");
    const subjectIdParsed = subjectIdNoProtocol.split("/");
  
     if (subjectIdParsed.length >= 3) {
          return {
            isValid: true,
            type: gs1DigitalLinkType(subjectIdParsed[1]),
            originalValue: value,
            parsedValue: subjectIdParsed[2],
            otherUriElements: subjectIdParsed.slice(3)
          }
     }
  }

   return {
    isValid: false,
    originalValue: value ? value : '' ,
    type: "Unknown"
  }

}