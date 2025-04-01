2.0.0 (2024-10-25)
---
BREAKING: Major Upgrade to Library to support WC3 Verifiable Credentials 2.0 enveloping proof [JOSE](https://www.w3.org/TR/vc-jose-cose/) securing mechanisms. 

- Updated rules validation to use Json Schema validation with custom GS1 rules cross field validation and GS1 Digital Links
- Updated Simplified API to make it easier to consumer Rules Library
- Getting Start Integration Test to help developers use the Rules Library

1.0.0 (2023-08-30)
---

Initial version of GS1 US Credential Rules Engine library for validating GS1 Credentials based on the [GS1 Verifiable Credentials Data Model](https://ref.gs1.org/gs1/vc/data-model/).

List of Support GS1 credentials:
- GS1PrefixLicenseCredential
- GS1CompanyPrefixLicenseCredential
- KeyCredential
- OrganizationDataCredential
- ProductDataCredential
- GS1IdentificationKeyLicenseCredential

