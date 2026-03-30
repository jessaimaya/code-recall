"use client";

import Link from "next/link";
import { trpc } from "@/lib/trpc/client";

export default function DecksPage() {
  const { data: decks, isLoading } = trpc.decks.list.useQuery();

  if (isLoading) return <p>Loading…</p>;

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Decks</h1>
        <Link
          href="/app/decks/new"
          className="rounded-md bg-black px-4 py-2 text-sm text-white hover:bg-gray-800"
        >
          New Deck
        </Link>
      </div>
      {decks?.length === 0 && (
        <p className="text-gray-500">No decks yet. Create your first deck to get started.</p>
      )}
      <ul className="space-y-3">
        {decks?.map((deck) => (
          <li key={deck.id}>
            <Link
              href={`/app/decks/${deck.id}`}
              className="block rounded-md border p-4 hover:bg-gray-50"
            >
              <p className="font-medium">{deck.name}</p>
              {deck.description && <p className="text-sm text-gray-500 mt-1">{deck.description}</p>}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
