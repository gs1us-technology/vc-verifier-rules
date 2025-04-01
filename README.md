# Overview 
The GS1 US Decentralized Identifier & Verifiable Credentials solution has been created to provide guidance on how to verify Verifiable Credentials (VC) issued for the GS1 Verifiable Credentials Digital License ecosystem. The library is **FOR DEMONSTRATION PURPOSES ONLY: NOT TO BE USED FOR PRODUCTION GRADE SYSTEMS!**

The GS1 License ecosystem ensures globally unique identification of products, asserts, locations, and entities for global trade.  The GS1 Digital license ecosystem expresses existing licenses as W3C verifiable credentials.   By assembling a chain of these credentials, product, location, and asset assertions can be digitally verified as authentic.  This library supports the validation of these credentials chains.

This solutions support the [WC3 Verifiable Credentials Data Model 2.0](https://www.w3.org/TR/vc-data-model-2.0) and [WC3 Verifiable Credentials Data Model 1.1](https://www.w3.org/TR/vc-data-model) and the GS1 level four validation rules defined in the [GS1 Data Model](https://ref.gs1.org/gs1/vc/data-model/) to validate the root of trust with GS1 issued credentials.

The GS1 US Verifiable Credentials Verification solution is divided into two libraries. 

- [vc-verifier-core](https://github.com/gs1us-technology/vc-verifier-core): This is the core library for verifying GS1 US Based Verifiable Credentials. This library is the main library to use for verifying VCs. The library will perform proof and revocation checks on all presented VCs. 
- [vc-verifier-rules](https://github.com/gs1us-technology/vc-verifier-rules): This is the rules library for verifying GS1 US Based Verifiable Credentials. This library will validate GS1 based VCs and ensure they follow the level four business rules defined by the GS1 Data Model Document. 

**Notes**: To run the libraries locally you will need to clone both repos into a parent Folder (e.g. gs1-us). The vc-verifier-core library has a dependency on the vc-verifier-rules and requires running a local NPM Install. 

See the using the library section for more details. 

# GS1 Credential Data Model
## Overview 
When validating GS1 Credentials the verification process will need to resolve each level of the verifiable credential chain. This will be done by checking for the next verifiable credential (VC) in the hierarchy chain is included in the verifiable presentation. 
If the required verifiable credential is not in the presentation, the verification process must resolve the verifiable credential via the document resolver. Any resolved verifiable credential should pass proof and revocation checks prior to completing the GS1 Credential validation rules check.  

Below is the credential chain for the ProductDataCredential. The validation flow will only check the specific VC passed into the rules engine and its related credential chain. If a company prefix VC is passed in it will validate the VC subject fields and then check the extended credential rules between a company prefix and license prefix credential. 
When a ProductDataCredential is passed in its subject field validation requires resolving both its related key credential and company prefix. This is required because the key credential only defines the relationship to the GS1 Key (GLN, GTIN, Etc.) and not the underlying data.  

To validate a ProductDataCredential in addition to checking its related key credential is valid, the company prefix associated with the key credential must be resolved and required checks for the issuer of the ProductDataCredential -> GS1KeyCredential -> GS1CompanyPrefix -> LicenseCredential. 

A Company Prefix credential must be issued by a GS1 Member Organization (e.g. GS1 US) or GS1 Global. Part of the validation process for a GS1 Company Prefix credential includes resolving the associated GS1 Prefix License Credential issued by GS1 Global DID **did:web:id.gs1.org**. 

If any of the credentials in the chain, can not be resolved, verified or pass the GS1 credential Rules the whole chain will not be verified. 

![Screenshot](./content/gs1_credential_chain.png)
  
## List of GS1 credentials Supported By the Rules Library
- GS1PrefixLicenseCredential
- GS1CompanyPrefixLicenseCredential 
- KeyCredential
- OrganizationDataCredential 
- ProductDataCredential

# Library Runtime

The library is a JavaScript ES Module (EMS) based NPM package. To consume the library directly you can **Import** any of the Functions or Types exported by the libraries src/index.ts file. 

The library requires the following environment:
- Node - v18.20.4+
- NPM - v10.7.0+

# Repo Folders
- `src\getting-started`: Getting started guide on how to use the GS1 Verifiable Credential validation rules library
- `src\lib`: The main code for the GS1 US vc-verifier-rules JavaScript library.
- `src\lib\rules-schema`: JSON Schema Rules for GS1 Credentials
- `src\lib\rules-definition`: JavaScript Functions for validating GS1 Credentials
- `src\lib\schema`: Custom Json Schema Validation rules for GS1 Verifiable Credentials
- `src\lib\engine`: JavaScript Functions for resolving and validating extended GS1 Credentials
- `src\lib\utility`: JavaScript Utility Functions for handing JOSE (JWT) based Verifiable Credentials
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
To use the GS1 US Decentralized Identifier & Verifiable Credentials rules library in your own solution, do a local 'npm install ../vc-verifier-rule'. This will install the library and its dependencies into your local node_modules folder. 

*Note* The Rules Library has an external dependency on the [Ajv JSON schema validator](https://www.npmjs.com/package/ajv) NPM package. This dependency allows for the validation of Json Schema files for the GS1 Verifiable Credentials.

## Getting Started
Check out the getting started test - *getting-started-test.ts* that will guide you through how to call the GS1 Verification Rules Library and how to setup the document resolver to resolve external verifiable credentials, verify external verifiable credentials, and load GS1 Json Schema Files. You can find the GS1 json schema files in the /getting-started/json-schema folder.

## Referencing the Library 

Add the following to reference the library in your local code. 

``` typescript
import { checkGS1CredentialPresentationValidation, 
    checkGS1CredentialWithoutPresentation,
    externalCredential, 
    verifyExternalCredential, 
    gs1RulesResult, 
    gs1RulesResultContainer, 
    verificationErrorCode, 
    VerifiableCredential,
    VerifiablePresentation, 
    gs1ValidatorRequest} 
from '@gs1us/vc-verifier-rules';
``` 

## Library API
The library includes two methods for verifying credentials.

export async function checkGS1CredentialWithoutPresentation(validatorRequest: gs1ValidatorRequest, verifiableCredential: VerifiableCredential)

- `validatorRequest` Document resolver required to resolve and verify external verifying credentials and load GS1 Json Schema files. 
- `verifiableCredential` The GS1 Verifiable Credential to be validated by the GS1 Level Four Rules.

export async function checkGS1CredentialPresentationValidation(validatorRequest: gs1ValidatorRequest, verifiableCredential: VerifiableCredential)

- `validatorRequest` Document resolver required to resolve and verify external verifying credentials and load GS1 Json Schema files. 
- `verifiablePresentation` A verifiable presentation that contains one or more GS1 Verifiable Credentials to be validated using the GS1 Level Four Rules.

## Code Example
Included below is an example of calling the `checkGS1CredentialPresentationValidation` method in the library. This will check the presentation for any GS1 Credentials and verify them against the GS1 level four business rules including ensuring the credentials chain is validate and the GS1 Global DID is the root issuer. 

Take note of the required document resolver callback methods
- 'externalCredentialLoader' this method will be called when one of the required GS1 credential can not be found in the presentation
- 'externalCredentialVerification' this method is called to verify any externally resolved credentials 
- 'externalJsonSchemaLoader' this method is called to load the GS1 Json Schema files

Note: When *fullJsonSchemaValidationOn* is true the GS1 Verification Rules Library will check all the Json Schema rules defined in the verifiable credential schema definition. When *fullJsonSchemaValidationOn* is false the library will only check the custom Json Schema rules for alternate license values and GS1 Digitial Links. The GS1 Digitial License Chain validation will always be performed whether the *fullJsonSchemaValidationOn* is true or false.

``` typescript
// Callback Function to Load External GS1 Credential.
// If the verifiable presentation is missing one of the required GS1 credentials, this function will be called to load the missing credential. 
export const loadExternalCredential: externalCredential = async (url: string) : Promise<VerifiableCredential> => {

    // For this sample the only expected external credential is the GS1 Prefix License Credential
    if (url === "https://id.gs1.org/vc/license/gs1_prefix/08") {
        return mockPrefixLicenseCredential;
    }
 
    throw new Error(`External Credential "${url}" can not be resolved.`);
 }

// Callback function to verifify an externally loaded credential. 
// When a credential is loaded from an external source, this function will verify the credential and check revocation. 
// If verififcation fails return the status to the GS1 Rules Library
 export const validateExternalCredential: verifyExternalCredential = async (credential: VerifiableCredential) : Promise<gs1RulesResult> => {
 
    const credentialId = credential.id ? credential.id : "unknown";
    const credentialName = credential.name ? credential.name : "unknown";
    const errors: gs1CredentialValidationRule[] = [];
 
    return { credentialId: credentialId, credentialName: credentialName, verified: true, errors: errors};
 }

 // Callback Function to Load JSON Schema for GS1 Credential Validation
 // Developer Notes: The host application will need to cache or resolve all the GS1 JSON Schemas files for validation to pass.
 // The json-schema files are available in a sub folder to this test project.
 export const getJsonSchema: jsonSchemaLoader = (schemaId: string) : Buffer => {
 
    if (schemaId === "https://id.gs1.org/vc/schema/v1/companyprefix") {
        const jsonSchema = JSON.stringify(mock_gs1CompanyPrefixSchema);
        return Buffer.from(jsonSchema);
    }
 
    if (schemaId === "https://id.gs1.org/vc/schema/v1/productdata") {
        const jsonSchema = JSON.stringify(mock_gs1ProductDataSchema);
        return Buffer.from(jsonSchema);
    }
 
    // Return No Schema for unsupported schema types
    return Buffer.from('');
 }

// Setup the GS1 Validator Request Object with the Callback Functions
// Developer Notes: When fullJsonSchemaValidationOn is true the full Json Schema Validation will be performed.
// When fullJsonSchemaValidationOn is false only the custom GS1 rules for alternative license values and GS1 Digital Link URI will be executed.
 const test_gs1ValidatorRequest: gs1ValidatorRequest = {
    fullJsonSchemaValidationOn: true,
    gs1DocumentResolver: {
       externalCredentialLoader: loadExternalCredential, 
       externalCredentialVerification: validateExternalCredential,
       externalJsonSchemaLoader: getJsonSchema
   }
 }

// Test Validating a GS1 Product (GTIN) Verifiable Presentation.
// Developer Notes: 
// The GS1 Validator Request Callback Functions will be called to resolve the GS1 Prefix License Credential and load the required JSON Schema.
 export const testProductPresentationValidation = async function() : Promise<boolean> {

   const presentationToVerify = getDecodedPresentation(mockJoseCredentialPresentationProductJwt);
   const gs1RulesValidationResult = await checkGS1CredentialPresentationValidation(test_gs1ValidatorRequest, presentationToVerify);

   console.log("GS1 Rules Validation Product Presentation Result: " + gs1RulesValidationResult.verified);
   if (!gs1RulesValidationResult.verified) {
      console.log(gs1RulesValidationResult);
   }

   return gs1RulesValidationResult.verified;
}
```

## Library Output 
The following types are the main output from the @gs1us/vc-verifier-rules library. When calling the `checkGS1CredentialWithoutPresentation` you will receive a single `gs1RulesResult` object. When calling the  `checkGS1CredentialPresentationValidation` a container object will be returned that contains multiple `gs1RulesResult`, objects, one for each verifiable credentials included in the presentation.

Check the `verified` property if a the presentation or credential validation passes or fails. When a validation fails check the errors array for one or more reasons the validation process fails.

``` typescript
// GS1 Validation Rule Checks Status
export type verificationCheck = {
    status: "good" | "bad";
    title: "Proof" | "Activation" | "Expired" | "Revocation" | "JsonSchema" | "GS1CredentialValidation";
}

// Code and Rule Associated with GS1 Validation Rules - See lib/engine/gs1-credential-errors.ts for list of codes
export type gs1CredentialValidationRule = {
    code: string;
    rule: string;
}

// *****  Verification Library Result Objects *****
export type credentialResults = {
    verified: boolean, 
    credentialId: string,
    credentialName: string;
    credentialValidationRules?: gs1CredentialValidationRule[];
    error?: string[];
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
Copyright 2024 GS1 US

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
