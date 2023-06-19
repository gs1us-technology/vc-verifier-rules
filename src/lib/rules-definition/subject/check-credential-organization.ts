import { invalidOrganization } from "../../engine/gs1-credential-errors.js";
import { gs1CredentialValidationRuleResult, subjectOrganization } from "../../gs1-rules-types";

// Verify if GS1 Organization is present and contains the necessary child fields
// Developer Notes: credentialSubject is defined as any because the credential subject is dynamic based on JSON-LD for a credential
export async function checkCredentialOrganization(credentialSubject: subjectOrganization | undefined): Promise<gs1CredentialValidationRuleResult> {

    const organization = credentialSubject?.organization;

    if (!!!organization) {
        return {verified: false, rule: invalidOrganization};
    }

    const partyGLN = organization["gs1:partyGLN"];
    const organizationName = organization["gs1:organizationName"];

    if (!!!partyGLN || !!!organizationName) {
        return {verified: false, rule: invalidOrganization};
    }

     return {verified: true };
  }

