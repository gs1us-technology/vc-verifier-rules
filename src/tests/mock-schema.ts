export const mock_gs1CompanyPrefixSchema = {
    "$id": "GS1-Company-Prefix-Schema",
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "version": "1.0.0",
    "title": "GS1CompanyPrefixLicenseCredential",
    "description": "A GS1 Company Prefix License is issued by a GS1 Member Organization or GS1 Global Office and allocated to a user company or to itself for the purpose of generating tier 1 GS1 identification keys",
    "type": "object",
    "credentialType": "GS1CompanyPrefixLicenseCredential",
    "properties": {
      "credentialSubject": {
        "type": "object",
        "properties": {
          "id": {
            "title": "Member Company Decentralized Identifier. The subject of this credential must be the issuer of all GS1 Key and Data Credential inherit from the company prefix.", 
            "type": "string",
            "format": "uri"
          },
          "organization": {
            "title": "An Organization is any legal or physical entity involved at any point in any supply chain and upon which there is a need to retrieve predefined information. An Organization is uniquely identified by a Global Location Number (GLN).",
            "type": "object",
            "properties": {
              "gs1:partyGLN": {
                "title": "13-digit GLN that is being used to identify a legal entity or function. If gs1:glnType is present, gs1:partyGLN SHALL only be used when gs1:GLN_TypeCode includes LEGAL_ENTITY and/or FUNCTION",
                "type": "string",
                "pattern": "^\\d{13}$"
              },
              "gs1:organizationName": {
                "title": "The name of the organization expressed in text.",
                "type": "string"
              }
            },
            "required": [
              "gs1:partyGLN", "gs1:organizationName"
            ]
          },
          "licenseValue": {
            "type": "string",
            "title": "GS1 Company Prefix License Value",
            "pattern": "^\\d{4,12}$"
          },
          "alternativeLicenseValue": {
            "title": "GS1 Company Prefix Alternative License Value. This field is optional.",
            "type": "string"
          },
          "extendsCredential": {
            "title": "Provides a complete chain to the GS1 Prefix or GS1-8 Prefix license credential issued by GS1 Global Office.",
            "type": "string"
          }
        },
        "required": [
          "id", "licenseValue", "organization", "extendsCredential"
        ],
        "additionalProperties": true
      }
    }
  }

  export const mock_gs1ProductDataSchema = {
    "$id": "GS1-Product-Data-Schema",
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "version": "1.0.0",
    "title": "ProductDataCredential",
    "description": "The product data credential is the Verifiable Credential that is shared with parties interested in the basic information associated with a product identified by a GTIN.",
    "type": "object",
    "properties": {
      "credentialSubject": {
        "type": "object",
        "properties": {
          "id": {
            "title": "Credential Subject ID can be a valid GS1 Digital Link URI, DID or URI.",
            "type": "string",
            "format": "uri"
          },
          "product": {
            "title": "Any item (product or service) upon which there is a need to retrieve pre-defined information and that may be priced, or ordered, or invoiced at any point in any supply chain.",
            "type": "object",
            "properties": {
              "gs1:brand": {
                "title": "The brand of the product that appears on the consumer package.",
                "type": "object",
                "properties": {
                  "gs1:brandName": {
                    "title": "The brand name of the product that appears on the consumer package.",
                    "type": "string"
                  }
                }
              },
              "gs1:productDescription": {
                "title": "An understandable and useable description of a product using brand and other descriptors. This attribute is filled with as little abbreviation as possible, while keeping to a reasonable length. This should be a meaningful description of the product with full spelling to facilitate message processing. Retailers can use this description as the base to fully understand the brand, flavour, scent etc. of the specific product, in order to accurately create a product description as needed for their internal systems. Examples: XYZ Brand Base Invisible Solid Deodorant AP Stick Spring Breeze.",
                "type": "string"
              }
            },
            "required": [
              "gs1:brand",
              "gs1:productDescription"
            ]
          },
          "sameAs": {
            "title": "If the credential subject ID is not a GS1 Digital Link URI, this specifies the GS1 Digital Link URI.",
            "type": "string"
          },
          "keyAuthorization": {
            "title": "Reference to a credential that authorizes the issuer to declare data for the credential subject (the key). Normally, this is the key credential itself, in which case the issuer of this and the key credential must be the same. For data that is declared by other parties on behalf of the issuer of the key credential, an authorization credential may be provided instead. In some circumstances, where the issuer of the data declaration is entirely independent, the key authorization may be entirely outside of the GS1 system (e.g., aproof-of-purchase Verifiable Credential for a product review).",
            "type": "string"
          }
        },
        "required": [
          "id",
          "product",
          "keyAuthorization"
        ]
      }
    }
  }