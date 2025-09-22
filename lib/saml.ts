// lib/saml.ts
import * as saml from "samlify";
import { cache } from "react";

const spEntityId = process.env.SAML_SP_ENTITY_ID!;
const spAcs = process.env.SAML_SP_ACS!;
const idpMetadataUrl = process.env.SAML_IDP_METADATA_URL || null;

if (!spEntityId || !spAcs) {
  throw new Error("Missing SAML_SP_ENTITY_ID or SAML_SP_ACS");
}

saml.setSchemaValidator({
  validate: async () => "OK",
});

export const getSP = cache(() =>
  saml.ServiceProvider({
    entityID: spEntityId,
    assertionConsumerService: [
      { Binding: saml.Constants.namespace.binding.post, Location: spAcs },
    ],
    authnRequestsSigned: false,
    wantAssertionsSigned: true,
    wantMessageSigned: false,
  })
);

// *** New: cached IdP ***
export const getIdP = cache(async () => {
  if (!idpMetadataUrl) throw new Error("Missing SAML_IDP_METADATA_URL");
  const xml = await (await fetch(idpMetadataUrl)).text();
  return saml.IdentityProvider({ metadata: xml });
});
