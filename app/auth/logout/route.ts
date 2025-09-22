// app/auth/logout/route.ts
import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/session";

export async function GET(req: Request) {
  await clearSessionCookie();

  // Always redirect relative to the current request URL
  const url = new URL("/", req.url);
  return NextResponse.redirect(url);
}
