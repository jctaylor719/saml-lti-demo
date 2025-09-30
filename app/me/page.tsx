import { getSession } from "@/lib/session";

export default async function MePage() {
  const session = await getSession();
  const email = session?.email ?? null;

  if (!email) {
    // No session visible on first render — reload once to let the cookie be seen.
    // If it still isn't present after one reload, fall back to /auth/saml/login.
    return (
      <main className="mx-auto max-w-xl p-6">
        <h1 className="text-2xl font-semibold">Finishing sign-in…</h1>
        <p className="mt-2 text-gray-600">
          One moment while we complete your session.
        </p>

        {/* Auto-reload once */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function(){
  try {
    if (!sessionStorage.getItem('me-reloaded')) {
      sessionStorage.setItem('me-reloaded','1');
      window.location.replace('/me');
    } else {
      window.location.replace('/auth/saml/login');
    }
  } catch (e) {
    window.location.replace('/me');
  }
})();
            `,
          }}
        />
        <noscript>
          <meta httpEquiv="refresh" content="1; url=/me" />
        </noscript>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-xl p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Signed in</h1>
      <div className="rounded-xl border p-4">
        <p className="text-sm text-gray-600">Email</p>
        <p className="text-lg">{email}</p>
      </div>
      <a
        href="/auth/logout"
        className="inline-flex items-center rounded-lg border px-4 py-2 hover:bg-gray-50"
      >
        Log out
      </a>
    </main>
  );
}
