import { dataMissingProduct } from "../../engine/gs1-credential-errors.js";
import { gs1CredentialValidationRuleResult, subjectProduct } from "../../gs1-rules-types.js";

// Verify if minimum required product fields is present and contains the necessary child fields
// Developer Notes: credentialSubject is defined as any because the credential subject is dynamic based on JSON-LD for a credential
export async function checkCredentialProduct(credentialSubject?: subjectProduct): Promise<gs1CredentialValidationRuleResult> {

    const product = credentialSubject?.product;

    if (!!!product) {
        return {verified: false, rule: dataMissingProduct};
    }

    const brandName = product["gs1:brand"];
    const productDescription = product["gs1:productDescription"]

    if (!!!brandName || !!!productDescription) {
        return {verified: false, rule: dataMissingProduct};
    }

     return {verified: true };
}

