import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-8 text-center">
      <h1 className="text-5xl font-bold tracking-tight">Code Recall</h1>
      <p className="max-w-md text-lg text-gray-600">
        Master software engineering concepts with spaced repetition. Study smarter, not harder.
      </p>
      <div className="flex gap-4">
        <Link
          href="/sign-in"
          className="rounded-md bg-black px-6 py-3 text-white hover:bg-gray-800"
        >
          Sign in
        </Link>
        <Link
          href="/sign-up"
          className="rounded-md border border-gray-300 px-6 py-3 hover:bg-gray-50"
        >
          Get started
        </Link>
      </div>
    </main>
  );
}
