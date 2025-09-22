// app/auth/saml/login/route.ts
import { NextResponse } from "next/server";
import { getSP } from "@/lib/saml";
import * as saml from "samlify";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const idpUrl = process.env.SAML_IDP_METADATA_URL;
  if (!idpUrl) {
    return NextResponse.json(
      {
        error: "IdP not configured yet",
        hint: "Set SAML_IDP_METADATA_URL to your Okta 'Identity Provider metadata' URL once the SAML app is created.",
      },
      { status: 503 }
    );
  }

  try {
    const xml = await (await fetch(idpUrl)).text();
    const idp = saml.IdentityProvider({ metadata: xml });

    const sp = getSP();
    // HTTP-Redirect binding → returns a redirect URL in `context`
    const { context } = await sp.createLoginRequest(idp, "redirect");
    return NextResponse.redirect(context);
  } catch (err) {
    console.error("SAML login error:", err);
    return NextResponse.json({ error: "Failed to initiate SAML login" }, { status: 500 });
  }
}
