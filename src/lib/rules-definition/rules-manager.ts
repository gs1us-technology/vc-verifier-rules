import { checkCredentialAlternativeLicenseValue, checkCredentialIdentityKeyAlternativeLicenseValue } from "./subject/check-credential-alternative-license.js";
import { checkCredentialLicenseValue, checkPrefixCredentialLicenseValue } from "./subject/check-credential-license.js";
import { checkCredentialOrganization } from "./subject/check-credential-organization.js";
import { checkCredentialSameAsDigitalLink, checkCredentialSubjectIdDigitalLink } from "./subject/check-credential-subject-Id-digital-link.js";
import { checkCredentialSubjectId } from "./subject/check-credential-subject-Id.js";
import { validateExtendedCompanyPrefixCredential } from "./chain/validate-extended-company-prefix.js";
import { validateExtendedLicensePrefix } from "./chain/validate-extended-license-prefix.js";
import { validateExtendedKeyCredential, validateExtendedKeyDataCredential } from "./chain/validate-extended-data-key.js";
import { checkCredentialProduct } from "./subject/check-credential-product.js";
import { checkIdentityKeyTypeValue } from "./subject/check-identification-key-type.js";

// Rules Engine Manager that handles GS1 Credential Rules validation
export const rulesEngineManager: any = {};
rulesEngineManager.credentialSubjectId = checkCredentialSubjectId;
rulesEngineManager.digitalLink = checkCredentialSubjectIdDigitalLink;
rulesEngineManager.digitalLinkSameAs = checkCredentialSameAsDigitalLink;
rulesEngineManager.license = checkCredentialLicenseValue;
rulesEngineManager.alternativeLicense = checkCredentialAlternativeLicenseValue;
rulesEngineManager.prefixLicense = checkPrefixCredentialLicenseValue;
rulesEngineManager.GS1PrefixLicenseCredential = validateExtendedLicensePrefix;
rulesEngineManager.GS1CompanyPrefixLicenseCredential = validateExtendedCompanyPrefixCredential;
rulesEngineManager.KeyCredential  = validateExtendedKeyCredential;
rulesEngineManager.KeyDataCredential  = validateExtendedKeyDataCredential;
rulesEngineManager.organization = checkCredentialOrganization;
rulesEngineManager.product = checkCredentialProduct;
rulesEngineManager.identificationKeyType = checkIdentityKeyTypeValue;
rulesEngineManager.alternativeLicenseIdentityKeyValue = checkCredentialIdentityKeyAlternativeLicenseValue;