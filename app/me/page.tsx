import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import BackHomeButton from "@/components/BackHomeButton";

export default async function MePage() {
  const session = await getSession();
  if (!session?.email) {
    redirect("/auth/saml/login");
  }

  return (
    <main className="mx-auto max-w-xl p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Signed in</h1>
      <div className="rounded-xl border p-4">
        <p className="text-sm text-gray-600">Email</p>
        <p className="text-lg">{session.email}</p>
      </div>
      <a
        href="/auth/logout"
        className="inline-flex items-center rounded-lg border px-4 py-2 hover:bg-gray-50"
      >
        Log out
      </a>
      <BackHomeButton />
    </main>
  );
}
