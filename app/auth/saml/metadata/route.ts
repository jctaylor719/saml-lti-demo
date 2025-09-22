import { NextResponse } from "next/server";
import { getSP } from "@/lib/saml";

export const dynamic = "force-dynamic";

export async function GET() {
  const sp = getSP();
  const xml = sp.getMetadata();
  return new NextResponse(xml, {
    status: 200,
    headers: {
      // Use text/xml so the browser renders instead of downloading
      "Content-Type": "text/xml; charset=utf-8",
      "Cache-Control": "no-store",
      // Optional: make the filename nice if someone still saves it
      "Content-Disposition": 'inline; filename="sp-metadata.xml"',
    },
  });
}
