import { gs1Organization } from "./gs1-shared-types.js";

export type gsOrganizationCredentialType = {
    id: string;
    keyAuthorization: string;
    organization: gs1Organization;
    sameAs?: string;
}