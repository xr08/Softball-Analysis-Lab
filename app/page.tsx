import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-start justify-center gap-6 px-6 py-16">
      <h1 className="text-3xl font-bold text-slate-900">Softball Analysis Lab</h1>
      <p className="text-base text-slate-700">
        Local-first session analysis for pitchers, batters, fielders, at-bats, review, and reports.
      </p>
      <Link
        href="/analyse"
        className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
      >
        Open Analysis Screen
      </Link>
    </main>
  );
}
