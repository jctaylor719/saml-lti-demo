import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/session";

export async function GET(_req: Request) {
  await clearSessionCookie();

  // Client-side redirect to "/" on the current origin (no envs, no absolute URLs)
  const html = `<!doctype html>
<html><head><meta charset="utf-8"><title>Signing out…</title></head>
<body>
  <script>
    // Replace so back button doesn't return to /auth/logout
    window.location.replace("/");
  </script>
  <noscript>
    <meta http-equiv="refresh" content="0; url=/" />
    <a href="/">Continue</a>
  </noscript>
</body></html>`;
  return new NextResponse(html, { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } });
}
