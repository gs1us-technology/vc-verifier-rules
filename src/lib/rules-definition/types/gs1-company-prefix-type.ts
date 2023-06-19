import { gs1Organization } from "./gs1-shared-types.js";

export type gs1CompanyPrefixCredentialType = {
    id: string;
    extendsCredential: string;
    licenseValue: string
    alternativeLicenseValue?: string;
    organization: gs1Organization;
}


