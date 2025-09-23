import { jwtVerify, createRemoteJWKSet, JWTPayload } from "jose";

const ISS = process.env.LTI_ISSUER;         // e.g. https://canvas.instructure.com (or your platform)
const AUD = process.env.LTI_AUDIENCE;       // your tool's client_id as registered with the platform
const JWKS_URL = process.env.LTI_JWKS_URL;  // platform's JWKS endpoint (/.well-known/jwks.json or tool-specific)

if (!ISS || !AUD || !JWKS_URL) {
  // Keep throw to catch misconfig early in dev
  throw new Error("Missing LTI_ISSUER, LTI_AUDIENCE, or LTI_JWKS_URL");
}

const jwks = createRemoteJWKSet(new URL(JWKS_URL));

export async function verifyLtiIdToken(idToken: string): Promise<JWTPayload> {
  const { payload } = await jwtVerify(idToken, jwks, {
    issuer: ISS,
    audience: AUD,
  });
  return payload;
}
