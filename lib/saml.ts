// lib/saml.ts
import * as saml from "samlify";
import { cache } from "react";

// Optional: If you prefer to fetch IdP metadata by URL later, we’ll add that in a later step.
// For now we only need SP ready so /auth/saml/metadata works reliably.

const spEntityId = process.env.SAML_SP_ENTITY_ID!;
const spAcs = process.env.SAML_SP_ACS!;

if (!spEntityId || !spAcs) {
  throw new Error(
    "Missing SAML_SP_ENTITY_ID or SAML_SP_ACS. Add them to .env.local and Render env."
  );
}

// Keep schema validator permissive for demo; we’ll rely on IdP signing certs later.
saml.setSchemaValidator({
  validate: async (_xml: string) => "OK",
});

// Build the Service Provider once per server context
export const getSP = cache(() =>
  saml.ServiceProvider({
    entityID: spEntityId,
    assertionConsumerService: [
      { Binding: saml.Constants.namespace.binding.post, Location: spAcs },
    ],
    // Demo-friendly flags; we can tighten later
    authnRequestsSigned: false,
    wantAssertionsSigned: true,
    wantMessageSigned: false,
  })
);

// IdP will be added in a later step (after Okta app is created and we have metadata).
// For now, exporting a placeholder helps avoid accidental use.
export async function getIdPNotReady() {
  throw new Error("IdP not configured yet. Create the Okta SAML app and add its metadata next.");
}
