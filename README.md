# Overview 
The GS1 US Decentralized Identifier & Verifiable Credentials solution has been created to provide guidance on how to verify Verifiable Credentials (VC) issued for the GS1 Verifiable Credentials Digital License ecosystem. 

The GS1 License ecosystem ensures globally unique identification of products, asserts, locations, and entities for global trade.  The GS1 Digital license ecosystem expresses existing licenses as W3C verifiable credentials.   By assembling a chain of these credentials, product, location, and asset assertions can be digitally verified as authentic.  This library supports the validation of these credentials chains.

Currently this solution is built for the [WC3 Verifiable Credentials Data Model 1.1](https://www.w3.org/TR/vc-data-model) and the GS1 level four validation rules defined in the [GS1 Data Model](https://ref.gs1.org/gs1/vc/data-model/) to validate the root of trust with GS1 issued credentials.

The GS1 US Verifiable Credentials Verification solution is divided into two libraries. 

- [vc-verifier-core](https://github.com/gs1us-technology/vc-verifier-core): This is the core library for verifying GS1 US Based Verifiable Credentials. This library is the main library to use for verifying VCs. The library will perform proof and revocation checks on all presented VCs. 
- [vc-verifier-rules](https://github.com/gs1us-technology/vc-verifier-rules): This is the rules library for verifying GS1 US Based Verifiable Credentials. This library will validate GS1 based VCs and ensure they follow the level four business rules defined by the GS1 Data Model Document. 

**Notes**: To run the libraries locally you will need to clone both repos into a parent Folder (e.g. gs1-us). The vc-verifier-core library has a dependency on the vc-verifier-rules and requires running a local NPM Install. 

See the using the library section for more details. 

# GS1 Credential Data Model
## Overview 
When validating GS1 Credentials the verification process will need to resolve each level of the verifiable credential chain. This will be done by checking for the next verifiable credential (VC) in the hierarchy chain is included in the verifiable presentation. 
If the required verifiable credential is not in the presentation, the verification process must resolve the verifiable credential via the document loader. Any resolved verifiable credential should pass proof and revocation checks prior to completing the GS1 Credential validation rules check.  

Below is the credential chain for the ProductDataCredential. The validation flow will only check the specific VC passed into the rules engine and its related credential chain. If a company prefix VC is passed in it will validate the VC subject fields and then check the extended credential rules between a company prefix and license prefix credential. 
When a ProductDataCredential is passed in its subject field validation requires resolving both its related key credential and company prefix. This is required because the key credential only defines the relationship to the GS1 Key (GLN, GTIN, Etc.) and not the underlying data.  

To validate a ProductDataCredential in addition to checking its related key credential is valid, the company prefix associated with the key credential must be resolved and required checks for the issuer of the ProductDataCredential -> GS1KeyCredential -> GS1CompanyPrefix -> LicenseCredential. 

A Company Prefix credential must be issued by a GS1 Member Organization (e.g. GS1 US) or GS1 Global. Part of the validation process for a GS1 Company Prefix credential includes resolving the associated GS1 Prefix License Credential issued by GS1 Global DID **did:web:id.gs1.org**. 

If any of the credentials in the chain, can not be resolved, verified or pass the GS1 credential Rules the whole chain will not be verified. 
  
## List of GS1 credentials Supported By the Rules Library
- GS1PrefixLicenseCredential
- GS1CompanyPrefixLicenseCredential 
- KeyCredential
- OrganizationDataCredential 
- ProductDataCredential
- GS1IdentificationKeyLicenseCredential 

# Library Runtime

The library is a JavaScript ES Module (EMS) based NPM package. To consume the library directly you can **Import** any of the Functions or Types exported by the libraries src/index.ts file. 

The library requires the following environment:
- Node - v18.16.1+
- NPM - 9.5.1+

# Repo Folders
- `src\lib`: The main code for the GS1 US vc-verifier-rules JavaScript library.
- `src\lib\rules-schema`: JSON Schema Rules for GS1 Credentials
- `src\lib\rules-definition`: JavaScript Functions for validating GS1 Credentials
- `src\lib\engine`: JavaScript Functions for resolving and validating extended GS1 Credentials
- `src\test`: JEST based unit tests for testing the vc-verifier-rules library and the validation of GS1 Credentials

# Running the Library Locally 
To use the GS1 US Decentralized Identifier & Verifiable Credentials rules library clone the [vc-verifier-rules](https://github.com/gs1us-technology/vc-verifier-rules) library. 

After cloning open the `vc-verifier-rules` library and perform the following steps from the top folder for vc-verifier-rules.

The  `npm run dev` command will compile the library into it's dist folder. 

``` 
npm install
npm run dev
``` 

# Testing the Library
To test the `vc-verifier-rules` library run npm test from a node terminal. This will run the JEST based unit tests for the rules library. 

``` 
npm test
``` 

# Using the Library
To use the GS1 US Decentralized Identifier & Verifiable Credentials rules library in your own solution, do a local 'npm install ../vc-verifier-rule'. 

This will install the library and its dependencies into your local node_modules folder. 

## Referencing the Library 
Add the following to reference the library your local code. Take note you may have to add **// @ts-ignore** above the from. This is override for when the libraries TypeScript Types can not be imported correctly.

``` typescript
import { checkGS1CredentialPresentation, 
        checkGS1CredentialWithoutPresentation, 
        externalCredential, 
        verifyExternalCredential, 
        gs1RulesResult,  
        gs1RulesResultContainer, 
        verificationErrorCode, 
        VerifiableCredential,
        VerifiablePresentation } 
    // @ts-ignore
    from '@gs1us/vc-verifier-rules';
``` 

## Library API
The library includes two methods for verifying credentials.

export async function verifyGS1CredentialsInPresentation(externalCredentialLoader: externalCredential, externalCredentialVerification: verifyExternalCredential, verifiablePresentation: any) : Promise<gs1RulesResultContainer> {

- `checkGS1CredentialPresentation` Check the Verifiable Presentation for any GS1 Credential, if any are found validate them using the GS1 Credential Rules. 
- `checkGS1CredentialWithoutPresentation` Check if the Verifiable Credential is a GS1 Credential and if so check the GS1 Credential Rules for that credential. 

## Code Example
Included below is an example of calling the `checkGS1CredentialPresentation` method in the library. This will check the presentation for any GS1 Credentials and verify them against the GS1 level four business rules including ensuring the credentials chain is validate and the GS1 Global DID is the root issuer. 

Take note there are two call back methods that must be provided:
- 'externalCredentialLoader' this method will be called when one of the required GS1 credential can not be found in the presentation
- 'verifyExternalCredential' this method is called to verify any externally resolved credentials 

``` typescript
// Callback function to resolve external credential using the document loader 
const getExternalCredential: externalCredential = async (url: string) : Promise<VerifiableCredential> => {
    const extendedVC = await documentLoader(url);
    return extendedVC.document;
}

// Callback function to verify external credential to ensure the VC passes proof, revocation and GS1 Rules
const checkExternalCredential: verifyExternalCredential = async (credential: VerifiableCredential) : Promise<gs1RulesResult> => {
    const verificationResult =  await verifyCredential_Direct(credential);

    // Developer Note: Since we are only checking a single credential we can assume the first credential result is the one we want to check
    let validationErrors: any[] = [];
    if (verificationResult.credentialResults.length > 0) {
            validationErrors = verificationResult.credentialResults[0].error?.errors.map( (error: any) => {
                return { code: verificationErrorCode, rule: error.message, isValid: false };
        });
    }

    // Check GS1 Rules for external credential
    const gs1RulesResult = await checkGS1Credential(credential);

    // Merge Verification Errors with GS1 Rules Errors
    if  (validationErrors && validationErrors.length > 0) {
        gs1RulesResult.errors.push(...validationErrors);
        gs1RulesResult.verified = false;
    }

    return gs1RulesResult;
}

// The Code to load the test pr
import { mockPresentationParty } from "./mock-credential.js";

const result = await checkGS1CredentialPresentation(mock_getExternalCredential, mock_checkExternalCredential,  mockPresentationParty);

if (result.verified === true) {
   console.log("Success");
} else {
  console.log(JSON.stringify(result, null, 4));
}
```

## Library Output 
The following types are the main output from the @gs1us/vc-verifier-rules library. When calling the `checkGS1CredentialWithoutPresentation` you will receive a single `gs1RulesResult` object. When calling the  `checkGS1CredentialPresentation` a container object will be returned that contains multiple `gs1RulesResult`, objects, one for each verifiable credentials included in the presentation.

Check the `verified` property if a the presentation or credential validation passes or fails. When a validation fails check the errors array for one or more reasons the validation process fails.

``` typescript
// Code and Rule Associated with GS1 Validation Rules - See lib/engine/gs1-credential-errors.ts for list of codes
export type gs1CredentialValidationRule = {
    code: string;
    rule: string;
}

// GS1 Credential rule validation result - Contains meta data about the credential being validated and the result of the GS1 Credential Rules Validation 
export type gs1RulesResult = {
    credential?: VerifiableCredential;
    credentialId: string;
    credentialName: string;
    verified: boolean;
    errors: gs1CredentialValidationRule[];
}

// Container Object for returning multiple gs1RulesResult 
export type gs1RulesResultContainer = {
    verified: boolean;
    result: gs1RulesResult[];
}
```

# Contribute
This library is currently not supporting external PRs. If you run into an issue or have a suggest please post in the repo's issue board. 

# License
Copyright 2023 GS1 US

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
