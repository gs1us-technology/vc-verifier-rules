import { invalidSubjectId, missingSubjectId } from "../../engine/gs1-credential-errors.js";
import { gs1CredentialValidationRuleResult, subjectId } from "../../gs1-rules-types";

// Check if urlValue is a valid URI
const isUrl = (urlValue: string) => {
    try {
      new URL(urlValue);
      return true;
    } catch (e) {
      // return false if URL constructor throws exception
      return false;  
    }
  }

// Verify the Credential Subject Id is a valid URI or DID
export async function checkCredentialSubjectId(credentialSubject?: subjectId): Promise<gs1CredentialValidationRuleResult> {

    const value = credentialSubject?.id;

    if (!!!value) {
        return {verified: false, rule: missingSubjectId };
    }

    if (!isUrl(value)) {
        return {verified: false, rule: invalidSubjectId};
    }

    return {verified: true};
}