import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let idToken: string | null = null;

    if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const v = form.get("id_token");
      idToken = typeof v === "string" ? v : null;
    } else if (contentType.includes("application/json")) {
      const body = await req.json().catch(() => ({}));
      idToken = typeof body?.id_token === "string" ? body.id_token : null;
    }

    if (!idToken) {
      return NextResponse.json({ error: "Missing id_token" }, { status: 400 });
    }

    const parts = idToken.split(".");
    if (parts.length < 2) {
      return NextResponse.json({ error: "Invalid JWT format" }, { status: 400 });
    }

    const header = JSON.parse(Buffer.from(parts[0], "base64url").toString("utf8"));
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));

    const html = `
<!doctype html>
<html><head><meta charset="utf-8"><title>LTI Launch Parsed</title></head>
<body style="font-family: ui-sans-serif; padding:24px;">
  <h1>LTI Launch Parsed (Demo)</h1>
  <h2>Header</h2><pre>${escapeHTML(JSON.stringify(header, null, 2))}</pre>
  <h2>Payload</h2><pre>${escapeHTML(JSON.stringify(payload, null, 2))}</pre>
  <p style="margin-top:16px;"><a href="/lti/launch">Back</a></p>
</body></html>`;
    return new NextResponse(html, {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (err) {
    console.error("LTI launch error:", err);
    return NextResponse.json({ error: "LTI launch failure" }, { status: 500 });
  }
}

function escapeHTML(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
