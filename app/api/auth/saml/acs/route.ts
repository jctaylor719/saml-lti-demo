// app/api/auth/saml/acs/route.ts
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

    // Build IdP/SP from metadata and env
    const idpUrl = process.env.SAML_IDP_METADATA_URL!;
    const xml = await (await fetch(idpUrl)).text();
    const idp = saml.IdentityProvider({ metadata: xml });
    const sp = getSP();

    // Parse SAMLResponse
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

    // Upsert user
    await ensureUsersTable();
    await pool.query(
      `INSERT INTO users (email) VALUES ($1) ON CONFLICT (email) DO NOTHING`,
      [email]
    );

    // Set the session cookie for this user
    await setSessionCookie({ email, iat: Math.floor(Date.now() / 1000) });

    // Respond with 200 HTML that then navigates to /me on the same origin
    const target = "https://saml-lti-demo.onrender.com/me";
    const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta http-equiv="Cache-Control" content="no-store" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Signing you in…</title>
</head>
<body class="min-h-screen bg-white text-gray-900">
  <main class="mx-auto max-w-5xl px-6 py-10">
    <h1 class="text-3xl font-bold">SAML + LTI + Postgres Demo</h1>
    <p class="mt-2 text-gray-600">Signing you in…</p>

    <div class="mt-6 rounded-2xl border p-5 shadow-sm">
      <h2 class="text-lg font-semibold">Please wait</h2>
      <p class="mt-2 text-sm text-gray-600">Redirecting to your dashboard…</p>
    </div>
  </main>

  <script>window.location.replace(${JSON.stringify(target)});</script>
  <noscript><meta http-equiv="refresh" content="0; url=${target}"></noscript>
</body>
</html>`;

    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("ACS error:", err);
    return NextResponse.json({ error: "ACS failure" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
