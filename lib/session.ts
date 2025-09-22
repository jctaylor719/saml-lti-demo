import { cookies } from "next/headers";
import crypto from "crypto";

const COOKIE_NAME = "sid";
const MAX_AGE_SEC = 60 * 60 * 24 * 7; // 7 days

function getSecret() {
  if (!process.env.SESSION_SECRET) throw new Error("Missing SESSION_SECRET");
  return process.env.SESSION_SECRET;
}

export type SessionData = { email: string; iat: number };

function sign(payload: string) {
  const h = crypto.createHmac("sha256", getSecret()).update(payload).digest("base64url");
  return `${payload}.${h}`;
}

function verify(signed: string): string | null {
  const idx = signed.lastIndexOf(".");
  if (idx < 0) return null;
  const payload = signed.slice(0, idx);
  const mac = signed.slice(idx + 1);
  const expected = crypto.createHmac("sha256", getSecret()).update(payload).digest("base64url");
  return crypto.timingSafeEqual(Buffer.from(mac), Buffer.from(expected)) ? payload : null;
}

export async function setSessionCookie(data: SessionData) {
  const payload = Buffer.from(JSON.stringify(data)).toString("base64url");
  const value = sign(payload);
  (await cookies()).set({
    name: COOKIE_NAME,
    value,
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SEC,
  });
}

export async function clearSessionCookie() {
  (await cookies()).delete(COOKIE_NAME);
}

export async function getSession(): Promise<SessionData | null> {
  const c = (await cookies()).get(COOKIE_NAME)?.value;
  if (!c) return null;
  const payload = verify(c);
  if (!payload) return null;
  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as SessionData;
  } catch {
    return null;
  }
}
