import { NextResponse } from "next/server";
import { getSP, getIdP } from "@/lib/saml";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const sp = getSP();
    const idp = await getIdP(); // cached fetch + parse
    const { context } = await sp.createLoginRequest(idp, "redirect");
    return NextResponse.redirect(context);
  } catch (err) {
    console.error("SAML login error:", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
