import { NextRequest, NextResponse } from "next/server";
import * as saml from "samlify";
import { getSP } from "@/lib/saml";
import { pool } from "@/lib/db";
import { setSessionCookie } from "@/lib/session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function ensureUsersTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const samlResponse = form.get("SAMLResponse");
    if (!samlResponse || typeof samlResponse !== "string") {
      return NextResponse.json({ error: "Missing SAMLResponse" }, { status: 400 });
    }

    const idpUrl = process.env.SAML_IDP_METADATA_URL!;
    const xml = await (await fetch(idpUrl)).text();
    const idp = saml.IdentityProvider({ metadata: xml });
    const sp = getSP();

    const { extract } = await sp.parseLoginResponse(idp, "post", {
      body: { SAMLResponse: samlResponse },
    });

    const nameId = extract?.nameID;
    const attrs = (extract?.attributes ?? {}) as Record<string, unknown>;
    const email =
      (Array.isArray(attrs.email) ? attrs.email[0] : (attrs.email as string | undefined)) ||
      (typeof attrs.email === "string" ? attrs.email : undefined) ||
      nameId;

    if (!email) {
      return NextResponse.json({ error: "No email/NameID in assertion" }, { status: 400 });
    }

    await ensureUsersTable();
    await pool.query(`INSERT INTO users (email) VALUES ($1) ON CONFLICT (email) DO NOTHING`, [email]);

    // Set session cookie
    await setSessionCookie({ email, iat: Math.floor(Date.now() / 1000) });

    // Redirect to /me
    return NextResponse.redirect(new URL("/me", req.url));
  } catch (err) {
    console.error("ACS error:", err);
    return NextResponse.json({ error: "ACS failure" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
