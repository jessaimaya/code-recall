import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="flex gap-4">
        <Link href="/app/decks" className="rounded-md border px-4 py-2 hover:bg-gray-50">
          My Decks
        </Link>
        <Link
          href="/app/review"
          className="rounded-md bg-black px-4 py-2 text-white hover:bg-gray-800"
        >
          Start Review
        </Link>
      </div>
    </div>
  );
}
