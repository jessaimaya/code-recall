import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <nav className="border-b px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/app" className="font-semibold">
            Code Recall
          </Link>
          <Link href="/app/decks" className="text-sm text-gray-600 hover:text-black">
            Decks
          </Link>
          <Link href="/app/review" className="text-sm text-gray-600 hover:text-black">
            Review
          </Link>
        </div>
        <UserButton />
      </nav>
      <main className="p-6">{children}</main>
    </div>
  );
}
