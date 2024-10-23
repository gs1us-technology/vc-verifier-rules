export const gs1GenericSchemaGS1 = {
    "$id": "GS1-Generoc-Schema",
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "version": "1.0.0",
    "title": "GS1GenericSchema",
    "description": "A Generic GS1 Schema used when a specific schema is not available",
    "type": "object",
    "properties": {
      "credentialSubject": {
      }
    }
  }

export const emptyJsonSchemaSubjectOnly =  {
    "credentialSubject": {
    }
}

export const gs1AltLicenseValidationRules = {
    "altLicenseValidation": true
}

export const gs1DigitalLinkRules = {
    "digitalLink": true
}

export const gs1DigitalLinkSameAsRules = {
    "digitalLinkSameAs": true
}
