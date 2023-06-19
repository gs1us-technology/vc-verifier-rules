import { gs1CredentialSchema } from "./rules-schema/rules-schema-types.js";
import { genericCredentialSchema } from "./rules-schema/genericCredentialSchema.js";
import { companyPrefixRuleSchema   } from "./rules-schema/companyPrefixRules.js";
import { prefixLicenseRuleSchema } from "./rules-schema/prefixLicenseRule.js";
import { keyRuleSchema } from "./rules-schema/keyRules.js";
import { organizationDataRuleSchema } from "./rules-schema/organizationPartyRules.js";
import { productDataRuleSchema } from "./rules-schema/productDataRules.js";
import { VerifiableCredential } from "./types.js";
import { identityKeyLicenseRuleSchema } from "./rules-schema/identityKeyLicenseRules.js";

// List of Supportive GS1 Credential Types
const GS1CredentialTypes = [
    "GS1CompanyPrefixLicenseCredential",
    "KeyCredential",
    "OrganizationDataCredential",
    "ProductDataCredential",
    "GS1PrefixLicenseCredential",
    "GS1IdentificationKeyLicenseCredential"
];

// Get the type of credential from Verifiable Credential Type Array
// If credential is not a supported GS1 Credential, return "unknown"
export const getCredentialType = ( credentialTypesSource: string[]): string =>  {

    if (!!!credentialTypesSource)
        return "unknown";

    // Look for GS1 Credential Type into source credential types. There should only be one GS1 Credential in the source 
    const credentialTypes = credentialTypesSource.filter(credentialType => GS1CredentialTypes.includes(credentialType));

    if (credentialTypes.length === 1) {
        return credentialTypes[0];
    } else if (credentialTypes.length > 1) {
        return "unknown";
    }

    // Credential is not a supported GS1 Credential
    return "unknown";
}

// Get the GS1 Credential Rule Schema based on the Credential Type
export const getCredentialRuleSchema = function(credential: VerifiableCredential) : gs1CredentialSchema { 

    if (!!!credential) {
        throw new Error("Credential is undefined");
    }

    const credentialType = getCredentialType(credential.type);

    switch(credentialType) {
        case "GS1PrefixLicenseCredential":
            return prefixLicenseRuleSchema;
        case "GS1CompanyPrefixLicenseCredential":
            return companyPrefixRuleSchema;
        case "KeyCredential":
            return keyRuleSchema;
        case "OrganizationDataCredential":
            return organizationDataRuleSchema;
        case "ProductDataCredential":
            return productDataRuleSchema;
        case "GS1IdentificationKeyLicenseCredential":
            return identityKeyLicenseRuleSchema;
        default:
            return genericCredentialSchema;
      }

}
