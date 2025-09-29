import Link from "next/link";

export default function BackHomeButton() {
  return (
    <div className="mt-8">
      <Link
        href="/"
        className="inline-flex items-center rounded-xl border px-4 py-2 text-sm shadow-sm transition hover:shadow-md"
      >
        ← Back to Home
      </Link>
    </div>
  );
}
