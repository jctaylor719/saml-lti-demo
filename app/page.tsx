// app/page.tsx
import Link from "next/link";
import { getSession } from "@/lib/session";

function Card({
  title,
  href,
  description,
  cta = "Open",
  external = false,
}: {
  title: string;
  href: string;
  description: string;
  cta?: string;
  external?: boolean;
}) {
  const content = (
    <div className="flex h-full flex-col justify-between rounded-2xl border p-5 shadow-sm transition hover:shadow-md">
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="mt-2 text-sm text-gray-600">{description}</p>
      </div>
      <div className="mt-4">
        <span className="inline-flex items-center rounded-lg border px-3 py-1 text-sm">
          {cta} <span className="ml-1">→</span>
        </span>
      </div>
    </div>
  );

  return external ? (
    <a href={href} className="h-full" target="_blank" rel="noreferrer">
      {content}
    </a>
  ) : (
    <Link href={href} className="h-full">
      {content}
    </Link>
  );
}

export default async function HomePage() {
  const session = await getSession();

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">SAML + LTI + Postgres Demo</h1>
        <p className="mt-2 text-gray-600">
          Portfolio showcase for a Technical Support Engineer role: SAML SSO,
          session handling, PostgreSQL APIs, and a minimal LTI launch tester.
        </p>

        {/* Login status */}
        <div className="mt-4 inline-flex items-center gap-3 rounded-xl border px-3 py-2">
          <span
            className={`h-2 w-2 rounded-full ${
              session?.email ? "bg-emerald-500" : "bg-gray-300"
            }`}
          />
          {session?.email ? (
            <div className="flex items-center gap-3">
              <span className="text-sm">Signed in as</span>
              <span className="text-sm font-medium">{session.email}</span>
              <a
                className="rounded-lg border px-2 py-1 text-sm hover:bg-gray-50"
                href="/auth/logout"
              >
                Log out
              </a>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-sm">Not signed in</span>
              <a
                className="rounded-lg border px-2 py-1 text-sm hover:bg-gray-50"
                href="/auth/saml/login"
              >
                SAML Login
              </a>
            </div>
          )}
        </div>
      </header>

      {/* Grid of demo areas */}
      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <Card
          title="Notes (Postgres CRUD)"
          href="/notes"
          description="Simple page backed by Neon Postgres. Lists notes and posts new ones via /api/notes with Zod validation."
          cta="Open /notes"
        />
        <Card
          title="SAML: Login"
          href="/auth/saml/login"
          description="Starts the SAML flow (Okta). After a successful assertion, the ACS sets a session and redirects to /me."
          cta="Start login"
        />
        <Card
          title="SAML: Who am I?"
          href="/me"
          description="Protected page that reads the signed cookie and shows the authenticated user’s email."
          cta="Open /me"
        />
        <Card
          title="SAML: SP Metadata (XML)"
          href="/auth/saml/metadata"
          description="Service Provider metadata endpoint. Use this in your IdP (Okta) SAML settings."
          cta="View metadata"
        />
        <Card
          title="API: DB Health"
          href="/api/db/health"
          description="Tiny health endpoint to confirm the server can reach Postgres."
          cta="Call /api/db/health"
        />
        <Card
          title="LTI 1.3 Launch Tester"
          href="/lti/launch"
          description="Paste an id_token (JWT) and POST to decode (and later verify) LTI launch claims."
          cta="Open /lti/launch"
        />
      </section>

      {/* Footnotes / usage tips */}
      <section className="mt-10 space-y-2 text-sm text-gray-600">
        <p>
          • SAML env: <code>SAML_SP_ENTITY_ID</code>, <code>SAML_SP_ACS</code>,{" "}
          <code>SAML_IDP_METADATA_URL</code>, <code>SESSION_SECRET</code>
        </p>
        <p>
          • DB: <code>DATABASE_URL</code> (Neon, with{" "}
          <code>sslmode=require</code>)
        </p>
        <p>
          • LTI (optional): <code>LTI_ISSUER</code>, <code>LTI_AUDIENCE</code>,{" "}
          <code>LTI_JWKS_URL</code> (verification step can be added later)
        </p>
      </section>
    </main>
  );
}
